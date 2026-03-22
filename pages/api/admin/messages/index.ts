// pages/api/admin/messages/index.ts
// GET — lista mesajelor din Supabase, ordonate by created_at desc.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { supabaseAdmin } from "../../../../lib/admin/supabase";
import type { MessageRow } from "../../../../lib/admin/supabase.types";

type Ok = { ok: true; data: MessageRow[] };
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

  const { data, error } = (await supabaseAdmin
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })) as {
    data: MessageRow[] | null;
    error: { message: string } | null;
  };

  if (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }

  return res.status(200).json({ ok: true, data: data ?? [] });
}
