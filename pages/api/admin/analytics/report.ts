// pages/api/admin/analytics/report.ts
// GET — date GA4 Report 30 zile (vizitatori, surse, device, țări).
// Protejat cu sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";

import type { ReportData } from "../../../../lib/admin/analytics";
import { getReportData } from "../../../../lib/admin/analytics";
import { verifyAdminSession } from "../../../../lib/admin/auth";

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReportData | ErrorResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const data = await getReportData();
    // Cache 10 minute — datele de raport nu se schimbă des
    res.setHeader("Cache-Control", "private, max-age=600");
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return res.status(500).json({ error: message });
  }
}
