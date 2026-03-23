// pages/api/admin/sent/[id].ts
// PATCH action:delete — soft delete pentru composed_emails (kind:"new").

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { supabaseAdmin } from "../../../../lib/admin/supabase";
import type { ComposedEmailRow } from "../../../../lib/admin/supabase.types";

type Ok = { ok: true };
type Fail = { ok: false; message: string };

type QueryResult<T> = { data: T | null; error: { message: string } | null };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Fail>) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ ok: false, message: "Neautorizat." });
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json({ ok: false, message: "ID invalid." });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const body = req.body as { action?: unknown };
  if (body.action !== "delete") {
    return res.status(400).json({ ok: false, message: "Acțiune invalidă." });
  }

  const { error } = (await supabaseAdmin
    .from("composed_emails")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)) as QueryResult<ComposedEmailRow>;

  if (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }

  return res.status(200).json({ ok: true });
}
