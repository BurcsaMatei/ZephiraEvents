// pages/api/admin/reviews/index.ts
// GET — lista recenziilor din data/reviews/, cu filtru opțional ?status=pending|approved|rejected.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, listFiles } from "../../../../lib/admin/github";
import { errorResponse } from "../../../../lib/admin/response";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewJson {
  id: string;
  name: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
  publishedAt?: string;
  profilePhotoUrl?: string;
  deleted?: boolean;
}

const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const statusParam = req.query["status"];
  const statusFilter =
    typeof statusParam === "string" && VALID_STATUSES.includes(statusParam as ReviewStatus)
      ? (statusParam as ReviewStatus)
      : undefined;

  try {
    const entries = await listFiles("data/reviews");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    const reviews = await Promise.all(
      jsonFiles.map(async (entry) => {
        const { content } = await getFile(entry.path);
        return JSON.parse(content) as ReviewJson;
      }),
    );

    const filtered = (statusFilter
      ? reviews.filter((r) => r.status === statusFilter)
      : reviews
    ).filter((r) => !r.deleted);

    const sorted = filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return res.status(200).json({ ok: true, data: sorted });
  } catch (err) {
    console.error("[admin/reviews] list error:", err);
    return res.status(500).json(errorResponse("Eroare la citirea recenziilor."));
  }
}
