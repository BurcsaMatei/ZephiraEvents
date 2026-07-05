// pages/api/admin/google-reviews/create.ts
// POST — adaugă o recenzie Google în data/google-reviews.json via GitHub API.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import { createGoogleReview } from "../../../../lib/googleReviews";
import { googleReviewSchema } from "../../../../lib/validation/googleReview";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const parsed = googleReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Date invalide.";
    return res.status(400).json(errorResponse(message));
  }

  const { authorName, rating, text, date, reviewUrl } = parsed.data;

  try {
    const review = await createGoogleReview({
      authorName,
      rating,
      text,
      date,
      ...(reviewUrl ? { reviewUrl } : {}),
    });
    return res.status(201).json(okResponse(review));
  } catch (err) {
    console.error("[admin/google-reviews] create error:", err);
    return res.status(500).json(errorResponse("Eroare la salvarea recenziei Google."));
  }
}
