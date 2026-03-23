// pages/api/admin/sent.ts
// GET — returnează union composed_emails + admin_replies ordonate după sent_at DESC.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../lib/admin/auth";
import { supabaseAdmin } from "../../../lib/admin/supabase";
import type {
  AdminReplyRow,
  ComposedEmailRow,
  MessageRow,
} from "../../../lib/admin/supabase.types";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export type SentKind = "new" | "reply";

export interface SentItem {
  id: string;
  kind: SentKind;
  to_email: string;
  to_name: string | null;
  subject: string;
  body: string;
  sent_at: string;
}

type Ok = { ok: true; data: SentItem[] };
type Fail = { ok: false; message: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Fail>) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ ok: false, message: "Neautorizat." });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  // ── composed_emails ───────────────────────────────────────
  const { data: emailRows } = (await supabaseAdmin
    .from("composed_emails")
    .select("id, to_email, to_name, subject, body, sent_at")
    .eq("status", "sent")
    .order("sent_at", { ascending: false })
    .limit(200)) as {
    data: Pick<ComposedEmailRow, "id" | "to_email" | "to_name" | "subject" | "body" | "sent_at">[] | null;
  };

  const fromEmails: SentItem[] = (emailRows ?? [])
    .filter((r) => r.sent_at !== null)
    .map((r) => ({
      id: r.id,
      kind: "new",
      to_email: r.to_email,
      to_name: r.to_name ?? null,
      subject: r.subject,
      body: r.body,
      sent_at: r.sent_at as string,
    }));

  // ── admin_replies + join messages pentru email/subiect ────
  const { data: replyRows } = (await supabaseAdmin
    .from("admin_replies")
    .select("id, message_id, body, sent_at")
    .not("sent_at", "is", null)
    .order("sent_at", { ascending: false })
    .limit(200)) as {
    data: Pick<AdminReplyRow, "id" | "message_id" | "body" | "sent_at">[] | null;
  };

  const replies = replyRows ?? [];
  let fromReplies: SentItem[] = [];

  if (replies.length > 0) {
    const msgIds = [...new Set(replies.map((r) => r.message_id))];
    const { data: msgRows } = (await supabaseAdmin
      .from("messages")
      .select("id, email, name, metadata")
      .in("id", msgIds)) as { data: Pick<MessageRow, "id" | "email" | "name" | "metadata">[] | null };

    const msgMap = new Map<string, Pick<MessageRow, "id" | "email" | "name" | "metadata">>();
    for (const m of msgRows ?? []) msgMap.set(m.id, m);

    fromReplies = replies.map((r) => {
      const msg = msgMap.get(r.message_id);
      const meta = msg?.metadata as Record<string, unknown> | null;
      const subject =
        typeof meta?.["subject"] === "string" ? `Re: ${meta["subject"]}` : `Re: mesaj de la ${msg?.name ?? r.message_id}`;
      return {
        id: r.id,
        kind: "reply",
        to_email: msg?.email ?? "",
        to_name: msg?.name ?? null,
        subject,
        body: r.body,
        sent_at: r.sent_at as string,
      };
    });
  }

  // ── Union + sortare ───────────────────────────────────────
  const all = [...fromEmails, ...fromReplies].sort(
    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
  );

  return res.status(200).json({ ok: true, data: all });
}
