/**
 * e-Bhoomi Email Templates (Server-Side Only)
 *
 * All HTML email templates are generated here as pure functions.
 * Templates must never be imported from client components.
 */

export interface OfficerAccountCreatedData {
  recipientName: string;
  role: string;
  jurisdiction: string;
  loginId: string;
  temporaryPassword: string;
  loginUrl: string;
}

export interface AdminOtpData {
  recipientName: string;
  otp: string;
  expiresMinutes: number;
}

export interface OfficerTransferredData {
  recipientName: string;
  newJurisdiction: string;
  effectiveDate: string;
  loginUrl: string;
}

export interface AccountSuspendedData {
  recipientName: string;
  reason: string;
  contactEmail: string;
}

/** HTML email for new officer account provisioning */
export function officerAccountCreatedTemplate(data: OfficerAccountCreatedData): { subject: string; html: string } {
  const subject = 'e-Bhoomi — Authorized Officer Account Created';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>e-Bhoomi Officer Account</title>
</head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#0f6b3d 100%);padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
                🏛 e-Bhoomi — National Land Records Portal
              </h1>
              <p style="margin:6px 0 0;color:#a7f3d0;font-size:13px;">
                Department of Land Resources, Ministry of Rural Development
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:15px;">Dear <strong>${data.recipientName}</strong>,</p>
              <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
                Your official revenue administration account has been provisioned on the <strong>e-Bhoomi</strong>
                National Land Records Modernization Platform.
              </p>

              <!-- Credential Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Account Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span style="color:#64748b;font-size:13px;">Role</span><br>
                        <strong style="color:#1e293b;font-size:14px;">${data.role}</strong>
                      </td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span style="color:#64748b;font-size:13px;">Jurisdiction</span><br>
                        <strong style="color:#1e293b;font-size:14px;">${data.jurisdiction}</strong>
                      </td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span style="color:#64748b;font-size:13px;">Official Login ID</span><br>
                        <code style="background:#e0f2fe;color:#0369a1;padding:4px 8px;border-radius:4px;font-size:15px;font-weight:700;">${data.loginId}</code>
                      </td></tr>
                      <tr><td style="padding:8px 0;">
                        <span style="color:#64748b;font-size:13px;">Temporary Password</span><br>
                        <code style="background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;font-size:15px;font-weight:700;">${data.temporaryPassword}</code>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <a href="${data.loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#0f6b3d);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
                      Access e-Bhoomi Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fee2e2;border-left:4px solid #b91c1c;border-radius:6px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0;color:#991b1b;font-size:13px;font-weight:700;">⚠ MANDATORY SECURITY ACTION</p>
                    <p style="margin:6px 0 0;color:#7f1d1d;font-size:13px;line-height:1.5;">
                      You <strong>must change your temporary password immediately</strong> after your first successful login.
                      Access to operational revenue workspace features will be restricted until this step is completed.
                      <strong>Do not share your credentials with anyone.</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                This is an automated administrative notification. Please do not reply to this email.<br>
                For support, contact your District Revenue Administration.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                <strong>e-Bhoomi</strong> · Department of Land Resources · Ministry of Rural Development · Government of India<br>
                Sent from a secure government system. Do not forward this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

/** HTML email for officer transfer notification */
export function officerTransferredTemplate(data: OfficerTransferredData): { subject: string; html: string } {
  const subject = 'e-Bhoomi — Jurisdiction Transfer Notification';
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:32px 16px;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;max-width:600px;margin:0 auto;">
    <tr>
      <td style="background:linear-gradient(135deg,#1e3a5f,#0f6b3d);padding:24px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:18px;">🔄 Jurisdiction Transfer — e-Bhoomi</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <p style="margin:0 0 16px;color:#1e293b;">Dear <strong>${data.recipientName}</strong>,</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          Your jurisdictional assignment has been updated on the e-Bhoomi platform.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:20px;">
          <tr><td style="padding:16px;">
            <p style="margin:0 0 8px;color:#475569;font-size:13px;"><strong>New Jurisdiction:</strong> ${data.newJurisdiction}</p>
            <p style="margin:0;color:#475569;font-size:13px;"><strong>Effective Date:</strong> ${data.effectiveDate}</p>
          </td></tr>
        </table>
        <a href="${data.loginUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:13px;">Login to e-Bhoomi →</a>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:11px;">e-Bhoomi · Department of Land Resources · Government of India</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, html };
}

/** HTML email for account suspension */
export function accountSuspendedTemplate(data: AccountSuspendedData): { subject: string; html: string } {
  const subject = 'e-Bhoomi — Account Suspended';
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:32px 16px;background:#fff1f2;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #fee2e2;max-width:600px;margin:0 auto;">
    <tr>
      <td style="background:#b91c1c;padding:24px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:18px;">⚠ Account Suspended — e-Bhoomi</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <p style="margin:0 0 16px;color:#1e293b;">Dear <strong>${data.recipientName}</strong>,</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          Your e-Bhoomi account has been suspended. Reason: <strong>${data.reason}</strong>
        </p>
        <p style="color:#475569;font-size:14px;">For assistance, contact: <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:11px;">e-Bhoomi · Department of Land Resources · Government of India</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, html };
}

/** HTML email for admin 2FA OTP */
export function adminOtpTemplate(data: AdminOtpData): { subject: string; html: string } {
  const subject = 'e-Bhoomi — Admin Login Security Code';
  const otpFormatted = data.otp.slice(0, 3) + ' ' + data.otp.slice(3);
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>e-Bhoomi Admin OTP</title></head>
<body style="margin:0;padding:32px 16px;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;max-width:600px;margin:0 auto;overflow:hidden;">
    <tr>
      <td style="background:linear-gradient(135deg,#1e3a5f 0%,#0f6b3d 100%);padding:28px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">🔐 e-Bhoomi Admin Console</h1>
        <p style="margin:6px 0 0;color:#a7f3d0;font-size:13px;">Two-Factor Authentication Code</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;color:#1e293b;font-size:15px;">Dear <strong>${data.recipientName}</strong>,</p>
        <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
          A login attempt to the <strong>e-Bhoomi System Administration Console</strong> has been detected.
          Use the security code below to complete authentication.
        </p>

        <!-- OTP Display -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td align="center" style="background:#f8fafc;border:2px dashed #059669;border-radius:12px;padding:28px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:2px;">Your Security Code</p>
              <p style="margin:0;font-size:40px;font-weight:800;color:#1e3a5f;letter-spacing:10px;font-family:monospace;">${otpFormatted}</p>
              <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Valid for ${data.expiresMinutes} minutes only</p>
            </td>
          </tr>
        </table>

        <!-- Warning -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fee2e2;border-left:4px solid #b91c1c;border-radius:6px;margin-bottom:24px;">
          <tr>
            <td style="padding:14px 16px;">
              <p style="margin:0;color:#991b1b;font-size:13px;font-weight:700;">⚠ Security Notice</p>
              <p style="margin:6px 0 0;color:#7f1d1d;font-size:13px;line-height:1.5;">
                If you did not initiate this login, your credentials may be compromised.
                <strong>Do not share this code with anyone.</strong>
                Contact your security officer immediately.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
          This code expires automatically and cannot be reused.<br>
          This is an automated security notification. Do not reply.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:11px;">e-Bhoomi · Department of Land Resources · Ministry of Rural Development · Government of India</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, html };
}
