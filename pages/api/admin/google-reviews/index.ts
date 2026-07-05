// pages/api/admin/google-reviews/index.ts
// GET — lista recenziilor Google din data/google-reviews.json (GitHub API — stare fresh după write-uri).

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import { getGoogleReviewsFromGit } from "../../../../lib/googleReviews";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  try {
    const { items } = await getGoogleReviewsFromGit();
    return res.status(200).json(okResponse(items));
  } catch (err) {
    console.error("[admin/google-reviews] list error:", err);
    return res.status(500).json(errorResponse("Eroare la citirea recenziilor Google."));
  }
}
