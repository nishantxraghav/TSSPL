import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as base64 from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
}

interface SmtpResponse {
  success: boolean;
  error?: string;
  id?: string;
}

async function sendViaSMTP(
  smtpHost: string,
  smtpPort: number,
  smtpUser: string,
  smtpPass: string,
  fromEmail: string,
  to: string[],
  subject: string,
  html: string
): Promise<SmtpResponse> {
  try {
    const conn = await Deno.connect({
      hostname: smtpHost,
      port: smtpPort,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Read initial server response
    const buffer = new Uint8Array(1024);
    const bytesRead = await conn.read(buffer);
    console.log("Server:", decoder.decode(buffer.subarray(0, bytesRead)));

    // Helper to send SMTP commands
    const sendCommand = async (command: string) => {
      console.log(`Sending: ${command.trim()}`);
      await conn.write(encoder.encode(command + "\r\n"));
      
      const buf = new Uint8Array(1024);
      const n = await conn.read(buf);
      const response = decoder.decode(buf.subarray(0, n));
      console.log(`Response: ${response.trim()}`);
      return response;
    };

    // Start TLS handshake
    const startTlsResp = await sendCommand("STARTTLS");
    if (!startTlsResp.startsWith("220")) {
      throw new Error(`STARTTLS failed: ${startTlsResp}`);
    }

    // Upgrade to TLS
    const tlsConn = await Deno.startTls(conn);
    const tlsEncoder = new TextEncoder();
    const tlsDecoder = new TextDecoder();

    const tlsSendCommand = async (command: string) => {
      console.log(`TLS Sending: ${command.trim()}`);
      await tlsConn.write(tlsEncoder.encode(command + "\r\n"));
      
      const buf = new Uint8Array(1024);
      const n = await tlsConn.read(buf);
      const response = tlsDecoder.decode(buf.subarray(0, n));
      console.log(`TLS Response: ${response.trim()}`);
      return response;
    };

    // Say EHLO
    await tlsSendCommand(`EHLO ${Deno.hostname()}`);

    // Authenticate
    const authString = `${smtpUser}\0${smtpUser}\0${smtpPass}`;
    const authBase64 = base64.encode(authString);
    const authResp = await tlsSendCommand(`AUTH PLAIN ${authBase64}`);
    if (!authResp.startsWith("235")) {
      throw new Error(`Authentication failed: ${authResp}`);
    }

    // Send email
    await tlsSendCommand(`MAIL FROM:<${fromEmail}>`);
    
    for (const recipient of to) {
      await tlsSendCommand(`RCPT TO:<${recipient}>`);
    }

    await tlsSendCommand("DATA");

    // Build email message
    const message = `From: ${fromEmail}\r\nTo: ${to.join(", ")}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
    
    console.log(`TLS Sending message body...`);
    await tlsConn.write(tlsEncoder.encode(message + "\r\n.\r\n"));
    
    const buf = new Uint8Array(1024);
    const n = await tlsConn.read(buf);
    const response = tlsDecoder.decode(buf.subarray(0, n));
    console.log(`Final Response: ${response.trim()}`);

    // Quit
    await tlsSendCommand("QUIT");
    
    tlsConn.close();

    return {
      success: true,
      id: `email-${Date.now()}`,
    };
  } catch (error) {
    console.error("SMTP Error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email via SMTP",
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { to, subject, html } = (await req.json()) as EmailRequest;

    // Validate input
    if (!to || !Array.isArray(to) || to.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipients specified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!subject || !html) {
      return new Response(
        JSON.stringify({ success: false, error: "Subject and HTML are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get SMTP credentials from environment variables
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587", 10);
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") || "info@tsspl.org";

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn("SMTP credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "SMTP service not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Send email
    const result = await sendViaSMTP(
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      fromEmail,
      to,
      subject,
      html
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
