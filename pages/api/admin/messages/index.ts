// pages/api/admin/messages/index.ts
// GET — lista mesajelor din Supabase, paginate, ordonate by created_at desc.
// Query params: ?page=N (default 1), page size 50.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { supabaseAdmin } from "../../../../lib/admin/supabase";
import type { MessageRow } from "../../../../lib/admin/supabase.types";

const PAGE_SIZE = 50;

type MessagePreview = Pick<
  MessageRow,
  | "id"
  | "type"
  | "status"
  | "name"
  | "email"
  | "message"
  | "event_type"
  | "created_at"
  | "metadata"
  | "deleted_at"
>;

type Ok = {
  ok: true;
  data: MessagePreview[];
  total: number;
  page: number;
  pageSize: number;
};
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ ok: false, message: "Neautorizat." });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const pageParam = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const offset = (page - 1) * PAGE_SIZE;

  const { data, count, error } = (await supabaseAdmin
    .from("messages")
    .select(
      "id, type, status, name, email, message, event_type, created_at, metadata, deleted_at",
      { count: "exact" },
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)) as {
    data: MessagePreview[] | null;
    count: number | null;
    error: { message: string } | null;
  };

  if (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }

  return res.status(200).json({
    ok: true,
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
