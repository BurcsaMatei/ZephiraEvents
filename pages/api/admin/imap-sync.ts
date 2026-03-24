// pages/api/admin/imap-sync.ts
// POST — declanșează sync IMAP inbox → Supabase via Edge Function.
// Protejat cu sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../lib/admin/auth";
import { errorResponse } from "../../../lib/admin/response";

interface ImapSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

type ErrorResponse = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImapSyncResult | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Unauthorized"));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const syncSecret = process.env.SYNC_SECRET?.trim();

  if (!supabaseUrl || !syncSecret) {
    return res
      .status(500)
      .json(errorResponse("NEXT_PUBLIC_SUPABASE_URL sau SYNC_SECRET lipsesc."));
  }

  const edgeFnUrl = `${supabaseUrl}/functions/v1/sync-imap`;

  try {
    const edgeRes = await fetch(edgeFnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${syncSecret}`,
      },
      body: "{}",
    });

    if (!edgeRes.ok) {
      const text = await edgeRes.text().catch(() => "răspuns necunoscut");
      return res
        .status(502)
        .json(errorResponse(`Edge Function a returnat ${edgeRes.status}: ${text}`));
    }

    const result = (await edgeRes.json()) as ImapSyncResult;
    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return res.status(500).json(errorResponse(message));
  }
}
