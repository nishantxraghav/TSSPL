const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const statusLabels: Record<string, string> = {
  Clear: 'Clear',
  MinorIssue: 'Amber-Insufficiency',
  MajorIssue: 'Red-Discrepancy',
  Interim: 'Interim',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const {
      employeeEmail,
      employeeName,
      employeeCode,
      status,
      remarks,
    } = await req.json();

    if (!employeeEmail || !employeeName || !employeeCode || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const statusLabel = statusLabels[status] || status;
    const subject = `Report Submission Notification - ${employeeName}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0F1C2E;padding:28px 36px;">
              <img src="https://sv.tsspl.org/public/uploads/image004.gif" alt="TSSPL" style="height:48px;display:block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">Dear <strong>${employeeName}</strong>,</p>

              <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
                Your background verification report has been completed and uploaded.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="8">
                      <tr>
                        <td style="font-size:13px;color:#64748b;width:160px;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Code</td>
                        <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeCode}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Verification Status</td>
                        <td style="padding:6px 0;">
                          <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;background:${status === 'Clear' ? '#d1fae5' : status === 'MinorIssue' ? '#fef3c7' : status === 'MajorIssue' ? '#fee2e2' : '#dbeafe'};color:${status === 'Clear' ? '#065f46' : status === 'MinorIssue' ? '#92400e' : status === 'MajorIssue' ? '#991b1b' : '#1e40af'};">${statusLabel}</span>
                        </td>
                      </tr>
                      ${remarks ? `
                      <tr>
                        <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Remarks</td>
                        <td style="font-size:14px;color:#334155;padding:6px 0;line-height:1.6;">${remarks}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Login Link -->
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                To log in and access your account, please click on the link given below:
              </p>
              <p style="margin:0 0 24px;">
                <a href="https://sv.tsspl.org/login" style="color:#2563eb;font-weight:600;font-size:14px;">https://sv.tsspl.org/login</a>
              </p>

              <!-- Nasscom & MSME badges -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding-right:20px;">
                    <img src="https://sv.tsspl.org/public/uploads/nas.jpg" alt="Nasscom Registered Company" style="height:48px;" />
                    <p style="margin:4px 0 0;font-size:11px;color:#64748b;">Nasscom Registered Company</p>
                  </td>
                  <td>
                    <img src="https://sv.tsspl.org/public/uploads/image007.jpg" alt="MSME Registered Company" style="height:48px;" />
                    <p style="margin:4px 0 0;font-size:11px;color:#64748b;">An MSME Registered Company</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#334155;">Yours Sincerely,</p>
              <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">TSSPL Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;padding:18px 36px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;font-style:italic;">
                Please note that this is an auto generated email, do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');

    if (!BREVO_API_KEY) {
      console.warn('BREVO_API_KEY not set — email not sent');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured (BREVO_API_KEY missing)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'TSSPL Verification', email: 'info@tsspl.org' },
        to: [{ email: employeeEmail }],
        subject,
        htmlContent: htmlBody,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error('Brevo error:', resData);
      return new Response(
        JSON.stringify({ success: false, error: resData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resData.messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
