/**
 * e-Bhoomi — Centralized Nodemailer Transport (Server-Side Only)
 *
 * This module creates and exports a Nodemailer transporter backed by
 * Gmail SMTP + Google App Password.
 *
 * SECURITY RULES:
 * - This file must NEVER be imported from client components.
 * - GMAIL_APP_PASSWORD must NEVER be a NEXT_PUBLIC_* variable.
 * - Credentials are read exclusively from server-side process.env.
 */

import nodemailer, { Transporter } from 'nodemailer';

export interface MailerConfig {
  user: string;
  pass: string;
}

export interface MailerStatus {
  ready: boolean;
  mode: 'live' | 'mock';
  error?: string;
}

let _transporter: Transporter | null = null;
let _mailerStatus: MailerStatus = { ready: false, mode: 'mock' };

/**
 * Returns a Nodemailer transporter using GMAIL_USER + GMAIL_APP_PASSWORD
 * from server environment. Returns null when credentials are absent,
 * enabling a controlled "mock / log-only" fallback mode.
 */
export function getMailTransporter(): Transporter | null {
  if (_transporter) return _transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    _mailerStatus = {
      ready: false,
      mode: 'mock',
      error: 'GMAIL_USER or GMAIL_APP_PASSWORD environment variable is not set.'
    };
    console.warn(
      '[e-Bhoomi Mailer] ⚠️  GMAIL_USER / GMAIL_APP_PASSWORD not configured. ' +
      'Credential emails will be logged to server console only (mock mode).'
    );
    return null;
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  _mailerStatus = { ready: true, mode: 'live' };
  return _transporter;
}

/** Returns the current mailer configuration status (no credentials exposed). */
export function getMailerStatus(): MailerStatus {
  return _mailerStatus;
}

/** The authoritative sender address — always from environment, never hard-coded. */
export function getSenderAddress(): string {
  return process.env.GMAIL_USER || 'noreply@e-bhoomi.gov.in';
}
