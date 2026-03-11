const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'info@tsspl.org';
const PLATFORM_URL = 'https://b1b08bc2-3b3e-4f0e-aed5-93e7444c50b6.canvases.tempo.build';

const statusLabels: Record<string, string> = {
  Clear: 'Clear',
  MinorIssue: 'Amber-Insufficiency',
  MajorIssue: 'Red-Discrepancy',
  Interim: 'Interim',
};

function getStatusColor(status: string): { bg: string; color: string } {
  switch (status) {
    case 'Clear': return { bg: '#d1fae5', color: '#065f46' };
    case 'MinorIssue': return { bg: '#fef3c7', color: '#92400e' };
    case 'MajorIssue': return { bg: '#fee2e2', color: '#991b1b' };
    case 'Interim': return { bg: '#dbeafe', color: '#1e40af' };
    default: return { bg: '#f1f5f9', color: '#475569' };
  }
}

function emailWrapper(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
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
              ${bodyContent}
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
</html>`.trim();
}

// ── Email 1: Company Creation ──
function buildCompanyCreationClientEmail(companyName: string, email: string, password: string, contactPerson?: string): { subject: string; html: string } {
  const subject = `Welcome to TSSPL - Your Company Account Has Been Created`;
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">Dear <strong>${contactPerson || companyName}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      Your company account on the TSSPL Background Verification Platform has been successfully created. You can now log in and manage your background verification cases.
    </p>
    <!-- Credentials Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="8">
            <tr>
              <td style="font-size:13px;color:#64748b;width:160px;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Company Name</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${companyName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Login Email</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${email}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Password</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${password}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
      Please log in using the link below and change your password at your earliest convenience:
    </p>
    <p style="margin:0 0 24px;">
      <a href="${PLATFORM_URL}/client-login" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#ffffff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">Log In to Your Account</a>
    </p>
  `;
  return { subject, html: emailWrapper(subject, body) };
}

function buildCompanyCreationAdminEmail(companyName: string, email: string, contactPerson?: string, phone?: string, address?: string): { subject: string; html: string } {
  const subject = `New Company Created - ${companyName}`;
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">Dear <strong>Admin</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      A new company has been successfully registered on the TSSPL BGV Platform.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="8">
            <tr>
              <td style="font-size:13px;color:#64748b;width:160px;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Company Name</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${companyName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Email</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${email}</td>
            </tr>
            ${contactPerson ? `<tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Contact Person</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${contactPerson}</td>
            </tr>` : ''}
            ${phone ? `<tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Phone</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${phone}</td>
            </tr>` : ''}
            ${address ? `<tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Address</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${address}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
  `;
  return { subject, html: emailWrapper(subject, body) };
}

// ── Email 2: Document Submission (Employee submitted docs) ──
function buildDocSubmissionClientEmail(companyName: string, employeeName: string, employeeCode: string, employeeEmail: string, bgvChecks: string[]): { subject: string; html: string } {
  const subject = `Antecedence Check Initiation - ${employeeName}`;
  const checksHtml = bgvChecks.map(c => `<li style="font-size:14px;color:#334155;padding:3px 0;">${c}</li>`).join('');
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">Dear <strong>${companyName} Team</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      A new employee has submitted their documents for background verification. The case has been initiated and is now in the <strong>Work In Progress</strong> queue.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="8">
            <tr>
              <td style="font-size:13px;color:#64748b;width:160px;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Company</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${companyName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Name</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Code</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeCode}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Email</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeEmail}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${bgvChecks.length > 0 ? `
    <p style="margin:0 0 8px;font-size:14px;color:#1e293b;font-weight:600;">BGV Checks Selected:</p>
    <ul style="margin:0 0 24px;padding-left:20px;">${checksHtml}</ul>
    ` : ''}
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
      You can track the case status in your dashboard:
    </p>
    <p style="margin:0 0 24px;">
      <a href="${PLATFORM_URL}/client-login" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#ffffff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">View Dashboard</a>
    </p>
  `;
  return { subject, html: emailWrapper(subject, body) };
}

function buildDocSubmissionAdminEmail(companyName: string, employeeName: string, employeeCode: string, employeeEmail: string, bgvChecks: string[]): { subject: string; html: string } {
  const subject = `New Case Initiation - ${employeeName} (${companyName})`;
  const checksHtml = bgvChecks.map(c => `<li style="font-size:14px;color:#334155;padding:3px 0;">${c}</li>`).join('');
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">Dear <strong>Admin</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      A new employee has submitted their background verification documents and a new WIP case has been created.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="8">
            <tr>
              <td style="font-size:13px;color:#64748b;width:160px;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Company</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${companyName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Name</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Code</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeCode}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Email</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeEmail}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${bgvChecks.length > 0 ? `
    <p style="margin:0 0 8px;font-size:14px;color:#1e293b;font-weight:600;">BGV Checks Selected:</p>
    <ul style="margin:0 0 24px;padding-left:20px;">${checksHtml}</ul>
    ` : ''}
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
      Please review and process this case in the admin panel.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${PLATFORM_URL}/admin-login" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#ffffff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">Open Admin Panel</a>
    </p>
  `;
  return { subject, html: emailWrapper(subject, body) };
}

// ── Email 3: Report Submission (Admin completes case) ──
function buildReportSubmissionClientEmail(companyName: string, employeeName: string, employeeCode: string, status: string, remarks?: string): { subject: string; html: string } {
  const subject = `Report Submission Notification - ${employeeName}`;
  const statusLabel = statusLabels[status] || status;
  const { bg, color } = getStatusColor(status);
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">Dear <strong>${companyName} Team</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      The background verification report for the following employee has been completed and is now available.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="8">
            <tr>
              <td style="font-size:13px;color:#64748b;width:160px;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Name</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Code</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeCode}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Verification Status</td>
              <td style="padding:6px 0;">
                <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;background:${bg};color:${color};">${statusLabel}</span>
              </td>
            </tr>
            ${remarks ? `
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Remarks</td>
              <td style="font-size:14px;color:#334155;padding:6px 0;line-height:1.6;">${remarks}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
      You can download the report from your dashboard:
    </p>
    <p style="margin:0 0 24px;">
      <a href="${PLATFORM_URL}/client-login" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#ffffff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">View Report</a>
    </p>
  `;
  return { subject, html: emailWrapper(subject, body) };
}

function buildReportSubmissionAdminEmail(companyName: string, employeeName: string, employeeCode: string, status: string, remarks?: string): { subject: string; html: string } {
  const subject = `Case Completed - ${employeeName} (${companyName})`;
  const statusLabel = statusLabels[status] || status;
  const { bg, color } = getStatusColor(status);
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">Dear <strong>Admin</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      A background verification case has been marked as completed. Here is a summary for your records:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="8">
            <tr>
              <td style="font-size:13px;color:#64748b;width:160px;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Company</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${companyName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Name</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee Code</td>
              <td style="font-size:14px;color:#1e293b;padding:6px 0;font-weight:500;">${employeeCode}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status</td>
              <td style="padding:6px 0;">
                <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;background:${bg};color:${color};">${statusLabel}</span>
              </td>
            </tr>
            ${remarks ? `
            <tr>
              <td style="font-size:13px;color:#64748b;padding:6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Remarks</td>
              <td style="font-size:14px;color:#334155;padding:6px 0;line-height:1.6;">${remarks}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
  `;
  return { subject, html: emailWrapper(subject, body) };
}

async function sendEmail(apiKey: string, to: string[], subject: string, html: string): Promise<{ success: boolean; error?: string; id?: string }> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'TSSPL Verification', email: 'info@tsspl.org' },
      to: to.map(email => ({ email })),
      subject,
      htmlContent: html,
    }),
  });

  const resData = await res.json();
  if (!res.ok) {
    console.error('Brevo error:', resData);
    return { success: false, error: JSON.stringify(resData) };
  }
  return { success: true, id: resData.messageId };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    const { type } = body;

    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      console.warn('BREVO_API_KEY not set — emails not sent');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured (BREVO_API_KEY missing)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const results: { recipient: string; success: boolean; error?: string; id?: string }[] = [];

    if (type === 'company_created') {
      // Send to client (with credentials) and admin (notification)
      const { companyName, email, password, contactPerson, phone, address } = body;

      if (!companyName || !email || !password) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for company_created' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const clientEmail = buildCompanyCreationClientEmail(companyName, email, password, contactPerson);
      const clientResult = await sendEmail(BREVO_API_KEY, [email], clientEmail.subject, clientEmail.html);
      results.push({ recipient: email, ...clientResult });

      const adminEmail = buildCompanyCreationAdminEmail(companyName, email, contactPerson, phone, address);
      const adminResult = await sendEmail(BREVO_API_KEY, [ADMIN_EMAIL], adminEmail.subject, adminEmail.html);
      results.push({ recipient: ADMIN_EMAIL, ...adminResult });

    } else if (type === 'document_submitted') {
      // Send to client and admin about new employee submission
      const { companyName, companyEmail, employeeName, employeeCode, employeeEmail, bgvChecks } = body;

      if (!companyName || !employeeName || !employeeCode) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for document_submitted' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Send to client
      if (companyEmail) {
        const clientEmail = buildDocSubmissionClientEmail(companyName, employeeName, employeeCode, employeeEmail || '', bgvChecks || []);
        const clientResult = await sendEmail(BREVO_API_KEY, [companyEmail], clientEmail.subject, clientEmail.html);
        results.push({ recipient: companyEmail, ...clientResult });
      }

      // Send to admin
      const adminEmail = buildDocSubmissionAdminEmail(companyName, employeeName, employeeCode, employeeEmail || '', bgvChecks || []);
      const adminResult = await sendEmail(BREVO_API_KEY, [ADMIN_EMAIL], adminEmail.subject, adminEmail.html);
      results.push({ recipient: ADMIN_EMAIL, ...adminResult });

    } else if (type === 'report_submitted') {
      // Send to client and admin about completed case
      const { companyName, companyEmail, employeeName, employeeEmail, employeeCode, status, remarks } = body;

      if (!employeeName || !employeeCode || !status) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for report_submitted' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Send to client company
      if (companyEmail) {
        const clientEmail = buildReportSubmissionClientEmail(companyName || '', employeeName, employeeCode, status, remarks);
        const clientResult = await sendEmail(BREVO_API_KEY, [companyEmail], clientEmail.subject, clientEmail.html);
        results.push({ recipient: companyEmail, ...clientResult });
      }

      // Send to admin
      const adminEmail = buildReportSubmissionAdminEmail(companyName || '', employeeName, employeeCode, status, remarks);
      const adminResult = await sendEmail(BREVO_API_KEY, [ADMIN_EMAIL], adminEmail.subject, adminEmail.html);
      results.push({ recipient: ADMIN_EMAIL, ...adminResult });

    } else {
      return new Response(
        JSON.stringify({ error: `Unknown email type: ${type}. Valid types: company_created, document_submitted, report_submitted` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const allSuccess = results.every(r => r.success);
    return new Response(
      JSON.stringify({ success: allSuccess, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: allSuccess ? 200 : 207 }
    );

  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
