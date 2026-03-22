// pages/api/admin/messages/[id].ts
// GET — detaliu mesaj + reply-uri asociate.
// PATCH — actualizează status mesaj (new | read | replied | archived).

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { supabaseAdmin } from "../../../../lib/admin/supabase";
import type { AdminReplyRow, MessageRow, MessageStatus } from "../../../../lib/admin/supabase.types";

type MessageWithReplies = MessageRow & { replies: AdminReplyRow[] };
type Ok = { ok: true; data: MessageWithReplies };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

type QueryResult<T> = { data: T | null; error: { message: string } | null };

const VALID_STATUSES: MessageStatus[] = ["new", "read", "replied", "archived"];

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ ok: false, message: "Neautorizat." });
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json({ ok: false, message: "ID invalid." });
  }

  // ── GET ──────────────────────────────────────────────────
  if (req.method === "GET") {
    const [msgRes, repliesRes] = (await Promise.all([
      supabaseAdmin.from("messages").select("*").eq("id", id).single(),
      supabaseAdmin
        .from("admin_replies")
        .select("*")
        .eq("message_id", id)
        .order("created_at", { ascending: true }),
    ])) as [QueryResult<MessageRow>, QueryResult<AdminReplyRow[]>];

    if (msgRes.error || !msgRes.data) {
      return res.status(404).json({ ok: false, message: "Mesaj negăsit." });
    }

    // Marchează automat ca „read" dacă e „new"
    if (msgRes.data.status === "new") {
      await supabaseAdmin.from("messages").update({ status: "read" }).eq("id", id);
    }

    return res.status(200).json({
      ok: true,
      data: { ...msgRes.data, replies: repliesRes.data ?? [] },
    });
  }

  // ── PATCH ─────────────────────────────────────────────────
  if (req.method === "PATCH") {
    const body = req.body as { status?: unknown };
    const status = typeof body.status === "string" ? (body.status as MessageStatus) : undefined;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ ok: false, message: "Status invalid." });
    }

    const { data, error } = (await supabaseAdmin
      .from("messages")
      .update({ status })
      .eq("id", id)
      .select()
      .single()) as QueryResult<MessageRow>;

    if (error || !data) {
      return res.status(500).json({ ok: false, message: error?.message ?? "Eroare Supabase." });
    }

    return res.status(200).json({ ok: true, data: { ...data, replies: [] } });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ ok: false, message: "Method Not Allowed" });
}
