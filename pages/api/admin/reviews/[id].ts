// pages/api/admin/reviews/[id].ts
// PATCH — { action: 'approve' | 'reject' } — moderare recenzie.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { errorResponse } from "../../../../lib/admin/response";
import { supabaseAdmin } from "../../../../lib/admin/supabase";
import type { ReviewRow, ReviewStatus } from "../../../../lib/admin/supabase.types";

type QuerySingle = { data: ReviewRow | null; error: { message: string } | null };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json(errorResponse("ID invalid."));
  }

  const body = req.body as { action?: unknown };
  const action = typeof body.action === "string" ? body.action : "";

  if (action !== "approve" && action !== "reject") {
    return res
      .status(400)
      .json(errorResponse("Action trebuie să fie 'approve' sau 'reject'."));
  }

  const status: ReviewStatus = action === "approve" ? "approved" : "rejected";
  const now = new Date().toISOString();

  const update =
    action === "approve"
      ? { status, published_at: now }
      : { status };

  const { data, error } = (await supabaseAdmin
    .from("reviews")
    .update(update)
    .eq("id", id)
    .select()
    .single()) as QuerySingle;

  if (error || !data) {
    return res.status(500).json(errorResponse(error?.message ?? "Eroare Supabase."));
  }

  return res.status(200).json({ ok: true, data });
}
