// pages/api/admin/sent/[id].ts
// PATCH action:delete — soft delete pentru composed_emails (kind:"new").

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import { supabaseAdmin } from "../../../../lib/admin/supabase";
import type { ComposedEmailRow } from "../../../../lib/admin/supabase.types";

type QueryResult<T> = { data: T | null; error: { message: string } | null };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json(errorResponse("ID invalid."));
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const body = req.body as { action?: unknown };
  if (body.action !== "delete") {
    return res.status(400).json(errorResponse("Acțiune invalidă."));
  }

  const { error } = (await supabaseAdmin
    .from("composed_emails")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)) as QueryResult<ComposedEmailRow>;

  if (error) {
    return res.status(500).json(errorResponse(error.message));
  }

  return res.status(200).json(okResponse());
}
