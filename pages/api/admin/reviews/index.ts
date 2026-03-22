// pages/api/admin/reviews/index.ts
// GET — lista recenziilor din Supabase, cu filtru opțional ?status=pending|approved|rejected.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { supabaseAdmin } from "../../../../lib/admin/supabase";
import type { ReviewRow, ReviewStatus } from "../../../../lib/admin/supabase.types";

type Ok = { ok: true; data: ReviewRow[] };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

type QueryResult = { data: ReviewRow[] | null; error: { message: string } | null };

const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ ok: false, message: "Neautorizat." });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const statusParam = req.query["status"];
  const status =
    typeof statusParam === "string" && VALID_STATUSES.includes(statusParam as ReviewStatus)
      ? (statusParam as ReviewStatus)
      : undefined;

  let query = supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = (await query) as QueryResult;

  if (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }

  return res.status(200).json({ ok: true, data: data ?? [] });
}
