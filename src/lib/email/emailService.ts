/**
 * e-Bhoomi Email Service (Server-Side Only)
 *
 * Orchestrates email delivery using the centralized Nodemailer transport
 * (mailer.ts) and HTML templates (templates/emailTemplates.ts).
 *
 * SECURITY RULES:
 * - Do NOT import this module from any client component.
 * - Do NOT expose GMAIL_APP_PASSWORD to the browser.
 * - Temporary passwords must NOT be stored in Firestore, logs, or audit records.
 */

import { getMailTransporter, getSenderAddress } from './mailer';
import {
  officerAccountCreatedTemplate,
  officerTransferredTemplate,
  accountSuspendedTemplate,
  adminOtpTemplate,
  OfficerAccountCreatedData,
  OfficerTransferredData,
  AccountSuspendedData,
} from './templates/emailTemplates';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  mode: 'live' | 'mock';
  error?: string;
}

export interface EmailAuditRecord {
  emailType: string;
  recipient: string;
  initiatedBy: string;
  timestamp: string;
  result: 'DELIVERED' | 'MOCK_LOGGED' | 'FAILED';
  messageId?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal dispatch helper
// ─────────────────────────────────────────────────────────────────────────────

async function dispatchEmail(
  to: string,
  subject: string,
  html: string,
  emailType: string,
  initiatedBy: string
): Promise<EmailDeliveryResult> {
  const transporter = getMailTransporter();
  const from = `"e-Bhoomi Administration" <${getSenderAddress()}>`;

  if (!transporter) {
    // Controlled mock / log-only mode
    console.log(`[e-Bhoomi Mailer][MOCK] emailType=${emailType} to=${to}\nSubject: ${subject}\n(HTML body suppressed for security)`);
    
    const audit: EmailAuditRecord = {
      emailType,
      recipient: to,
      initiatedBy,
      timestamp: new Date().toISOString(),
      result: 'MOCK_LOGGED',
    };
    logEmailAudit(audit);
    return { success: true, mode: 'mock' };
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    
    const audit: EmailAuditRecord = {
      emailType,
      recipient: to,
      initiatedBy,
      timestamp: new Date().toISOString(),
      result: 'DELIVERED',
      messageId: info.messageId,
    };
    logEmailAudit(audit);
    return { success: true, messageId: info.messageId, mode: 'live' };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'SMTP delivery failed';
    
    const audit: EmailAuditRecord = {
      emailType,
      recipient: to,
      initiatedBy,
      timestamp: new Date().toISOString(),
      result: 'FAILED',
      error: errorMsg,
    };
    logEmailAudit(audit);
    // Return structured failure — do NOT throw, let caller decide recovery action
    return { success: false, mode: 'live', error: errorMsg };
  }
}

/** Writes email audit record to server console (Firestore write can be added here later). */
function logEmailAudit(record: EmailAuditRecord): void {
  // IMPORTANT: Never log passwords, App Password, or authentication tokens here.
  console.log(
    `[e-Bhoomi EmailAudit] type=${record.emailType} recipient=${record.recipient} ` +
    `result=${record.result} ts=${record.timestamp}` +
    (record.messageId ? ` msgId=${record.messageId}` : '') +
    (record.error ? ` error=${record.error}` : '')
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends the official officer account credential email.
 * Called from /api/admin/officers after Firebase Auth account creation.
 * The temporary password may appear in this email ONCE and must NOT be
 * stored in Firestore, audit logs, or any persistent store.
 */
export async function sendOfficerCredentialEmail(
  data: OfficerAccountCreatedData & { recipientEmail: string; initiatedBy?: string }
): Promise<EmailDeliveryResult> {
  const { subject, html } = officerAccountCreatedTemplate({
    recipientName: data.recipientName,
    role: data.role,
    jurisdiction: data.jurisdiction,
    loginId: data.loginId,
    temporaryPassword: data.temporaryPassword,
    loginUrl: data.loginUrl,
  });

  return dispatchEmail(
    data.recipientEmail,
    subject,
    html,
    'OfficerAccountCreated',
    data.initiatedBy || 'SYSTEM'
  );
}

/**
 * Sends a jurisdiction transfer notification to the officer.
 */
export async function sendOfficerTransferEmail(
  data: OfficerTransferredData & { recipientEmail: string; initiatedBy?: string }
): Promise<EmailDeliveryResult> {
  const { subject, html } = officerTransferredTemplate({
    recipientName: data.recipientName,
    newJurisdiction: data.newJurisdiction,
    effectiveDate: data.effectiveDate,
    loginUrl: data.loginUrl,
  });

  return dispatchEmail(
    data.recipientEmail,
    subject,
    html,
    'OfficerTransferred',
    data.initiatedBy || 'SYSTEM'
  );
}

/**
 * Sends an account suspension notification to the officer.
 */
export async function sendAccountSuspendedEmail(
  data: AccountSuspendedData & { recipientEmail: string; initiatedBy?: string }
): Promise<EmailDeliveryResult> {
  const { subject, html } = accountSuspendedTemplate({
    recipientName: data.recipientName,
    reason: data.reason,
    contactEmail: data.contactEmail,
  });

  return dispatchEmail(
    data.recipientEmail,
    subject,
    html,
    'AccountSuspended',
    data.initiatedBy || 'SYSTEM'
  );
}

/**
 * Server-side only: sends a controlled test email to verify SMTP connectivity.
 * Must NEVER be called automatically on application startup.
 * Must only be triggered by an explicit, authenticated admin action.
 */
export async function sendTestEmail(
  testRecipient: string,
  initiatedBy: string
): Promise<EmailDeliveryResult> {
  const subject = 'e-Bhoomi — SMTP Connectivity Test';
  const html = `
    <div style="font-family:sans-serif;padding:20px;max-width:500px;">
      <h2 style="color:#0f6b3d;">✅ e-Bhoomi Email Service — Test Successful</h2>
      <p>This is a controlled test email confirming that the Gmail SMTP transport
      is correctly configured for the e-Bhoomi administration system.</p>
      <p style="color:#64748b;font-size:12px;">No credentials or secrets are included in this message.</p>
    </div>
  `;

  return dispatchEmail(testRecipient, subject, html, 'SMTPTest', initiatedBy);
}

/**
 * Sends the admin 2FA OTP email after successful email+password authentication.
 * The OTP is generated server-side and must NOT be stored in logs.
 */
export async function sendAdminOtpEmail(
  data: { recipientEmail: string; recipientName: string; otp: string; expiresMinutes: number; initiatedBy?: string }
): Promise<EmailDeliveryResult> {
  const { subject, html } = adminOtpTemplate({
    recipientName: data.recipientName,
    otp: data.otp,
    expiresMinutes: data.expiresMinutes,
  });

  return dispatchEmail(
    data.recipientEmail,
    subject,
    html,
    'AdminOTP',
    data.initiatedBy || 'SYSTEM'
  );
}
