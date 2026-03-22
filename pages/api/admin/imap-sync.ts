// pages/api/admin/imap-sync.ts
// POST — declanșează sync IMAP inbox → Supabase.
// Protejat cu sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../lib/admin/auth";
import type { ImapSyncResult } from "../../../lib/admin/imap";
import { syncInboxMessages } from "../../../lib/admin/imap";

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImapSyncResult | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await syncInboxMessages();
    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return res.status(500).json({ error: message });
  }
}
