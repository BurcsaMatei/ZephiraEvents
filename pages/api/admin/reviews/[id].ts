// pages/api/admin/reviews/[id].ts
// PATCH — { action: 'approve' | 'reject' } — moderare recenzie via GitHub API.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, listFiles, updateFile } from "../../../../lib/admin/github";
import { errorResponse } from "../../../../lib/admin/response";
import type { ReviewJson, ReviewStatus } from "./index";

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

  if (action !== "approve" && action !== "reject" && action !== "delete") {
    return res.status(400).json(errorResponse("Action trebuie să fie 'approve', 'reject' sau 'delete'."));
  }

  try {
    const entries = await listFiles("data/reviews");
    const entry = entries.find((e) => e.name === `${id}.json`);
    if (!entry) return res.status(404).json(errorResponse("Recenzie negăsită."));

    const { content, sha } = await getFile(entry.path);
    const review = JSON.parse(content) as ReviewJson;

    if (action === "delete") {
      const updated: ReviewJson = { ...review, deleted: true };
      await updateFile(entry.path, JSON.stringify(updated, null, 2), sha);
      return res.status(200).json({ ok: true, data: updated });
    }

    const status: ReviewStatus = action === "approve" ? "approved" : "rejected";
    const now = new Date().toISOString();
    const updated: ReviewJson = {
      ...review,
      status,
      ...(action === "approve" ? { publishedAt: now } : {}),
    };

    await updateFile(entry.path, JSON.stringify(updated, null, 2), sha);
    return res.status(200).json({ ok: true, data: updated });
  } catch (err) {
    console.error("[admin/reviews/[id]] PATCH error:", err);
    return res.status(500).json(errorResponse("Eroare la moderarea recenziei."));
  }
}
