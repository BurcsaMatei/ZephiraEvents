// lib/admin/smtp.ts
// Helper SMTP reutilizabil pentru API routes admin (reply, compose).
// Refolosește configurația SMTP din .env.local (aceeași cu contact/offer-request).

import nodemailer from "nodemailer";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export interface AdminMailOptions {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}

// ──────────────────────────────────────────────────────────
// Sender
// ──────────────────────────────────────────────────────────
export async function sendAdminMail(opts: AdminMailOptions): Promise<void> {
  const host = (process.env.SMTP_HOST ?? "").trim();
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = (process.env.SMTP_USER ?? "").trim();
  const pass = process.env.SMTP_PASS ?? "";
  const secure = String(process.env.SMTP_SECURE ?? "false") === "true";
  const from = (process.env.CONTACT_FROM_EMAIL ?? "").trim();

  if (!host || !user || !from) {
    throw new Error("Configurare SMTP incompletă (SMTP_HOST, SMTP_USER, CONTACT_FROM_EMAIL).");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    authMethod: "LOGIN",
    tls: { servername: host, minVersion: "TLSv1.2", rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from,
    to: opts.to,
    replyTo: opts.replyTo ?? from,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

// ──────────────────────────────────────────────────────────
// HTML escape util
// ──────────────────────────────────────────────────────────
export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]!,
  );
}
