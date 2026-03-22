// pages/api/admin/analytics/realtime.ts
// GET — date GA4 Realtime (vizitatori activi, pe pagini).
// Protejat cu sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";

import type { RealtimeData } from "../../../../lib/admin/analytics";
import { getRealtimeData } from "../../../../lib/admin/analytics";
import { verifyAdminSession } from "../../../../lib/admin/auth";

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RealtimeData | ErrorResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const data = await getRealtimeData();
    // Cache scurt — date fresh la fiecare 15 secunde
    res.setHeader("Cache-Control", "private, max-age=15");
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return res.status(500).json({ error: message });
  }
}
