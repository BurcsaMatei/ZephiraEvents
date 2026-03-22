// pages/api/admin/reply.ts
// POST — trimite reply la un mesaj existent via SMTP, salvează în admin_replies.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../lib/admin/auth";
import { escapeHtml, sendAdminMail } from "../../../lib/admin/smtp";
import { supabaseAdmin } from "../../../lib/admin/supabase";

type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

type MsgSnippet = { email: string; name: string | null; status: string };
type QuerySingle<T> = { data: T | null; error: { message: string } | null };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ ok: false, message: "Neautorizat." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const body = req.body as { messageId?: unknown; subject?: unknown; replyBody?: unknown };

  const messageId = typeof body.messageId === "string" ? body.messageId.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const replyBody = typeof body.replyBody === "string" ? body.replyBody.trim() : "";

  if (!messageId || !subject || !replyBody) {
    return res
      .status(400)
      .json({ ok: false, message: "Câmpurile messageId, subject și replyBody sunt obligatorii." });
  }

  // Preia adresa destinatarului din mesajul original
  const { data: msg, error: msgErr } = (await supabaseAdmin
    .from("messages")
    .select("email, name, status")
    .eq("id", messageId)
    .single()) as QuerySingle<MsgSnippet>;

  if (msgErr || !msg) {
    return res.status(404).json({ ok: false, message: "Mesaj sursă negăsit." });
  }

  const html =
    `<p>Bună ziua, <strong>${escapeHtml(msg.name ?? "")}</strong>,</p>` +
    `<pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f7;` +
    `padding:16px;border-radius:6px;border-left:3px solid #5561F2">${escapeHtml(replyBody)}</pre>` +
    `<p style="color:#888;font-size:12px;margin-top:24px">ZephiraEvents — zephiraevents.ro</p>`;

  try {
    await sendAdminMail({ to: msg.email, subject, text: replyBody, html });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare la trimiterea emailului.";
    return res.status(500).json({ ok: false, message });
  }

  const now = new Date().toISOString();

  await Promise.all([
    supabaseAdmin.from("admin_replies").insert({
      message_id: messageId,
      body: replyBody,
      sent_at: now,
      sent_by: process.env.ADMIN_EMAIL ?? "admin",
    }),
    supabaseAdmin.from("messages").update({ status: "replied" }).eq("id", messageId),
  ]);

  return res.status(200).json({ ok: true });
}
