// pages/api/admin/compose.ts
// POST — trimite email standalone (to, subject, body) via SMTP, salvează în composed_emails.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../lib/admin/auth";
import { escapeHtml, sendAdminMail } from "../../../lib/admin/smtp";
import { supabaseAdmin } from "../../../lib/admin/supabase";
import type { EmailStatus } from "../../../lib/admin/supabase.types";

type Ok = { ok: true; saved?: boolean; warning?: string };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ ok: false, message: "Neautorizat." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const body = req.body as {
    to?: unknown;
    toName?: unknown;
    subject?: unknown;
    emailBody?: unknown;
  };

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const toName = typeof body.toName === "string" ? body.toName.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const emailBody = typeof body.emailBody === "string" ? body.emailBody.trim() : "";

  if (!to || !subject || !emailBody) {
    return res
      .status(400)
      .json({ ok: false, message: "Câmpurile to, subject și emailBody sunt obligatorii." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ ok: false, message: "Adresă email destinatar invalidă." });
  }

  const salutation = toName
    ? `<p>Bună ziua, <strong>${escapeHtml(toName)}</strong>,</p>`
    : "<p>Bună ziua,</p>";

  const html =
    salutation +
    `<pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f7;` +
    `padding:16px;border-radius:6px">${escapeHtml(emailBody)}</pre>` +
    `<p style="color:#888;font-size:12px;margin-top:24px">ZephiraEvents — zephiraevents.ro</p>`;

  const now = new Date().toISOString();
  const toNameOrNull: string | null = toName || null;

  async function saveToDb(status: EmailStatus, sentAt?: string): Promise<void> {
    const { error } = await supabaseAdmin.from("composed_emails").insert({
      to_email: to,
      to_name: toNameOrNull,
      subject,
      body: emailBody,
      status,
      ...(sentAt ? { sent_at: sentAt } : {}),
    });
    if (error) throw new Error(error.message);
  }

  try {
    await sendAdminMail({ to, subject, text: emailBody, html });
  } catch (err) {
    try {
      await saveToDb("failed");
    } catch (dbErr) {
      console.error("[compose] DB insert failed status:", dbErr);
    }
    const message = err instanceof Error ? err.message : "Eroare la trimiterea emailului.";
    return res.status(500).json({ ok: false, message });
  }

  try {
    await saveToDb("sent", now);
  } catch (dbErr) {
    console.error("[compose] DB insert sent status:", dbErr);
    return res.status(200).json({
      ok: true,
      saved: false,
      warning: "Email trimis dar nu salvat în Trimise",
    });
  }

  return res.status(200).json({ ok: true });
}
