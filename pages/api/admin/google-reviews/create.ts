// pages/api/admin/google-reviews/create.ts
// POST — adaugă o recenzie Google în data/google-reviews.json via GitHub API.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import { createGoogleReview, type NewGoogleReview } from "../../../../lib/googleReviews";
import { googleReviewInputSchema } from "../../../../lib/validation/googleReview";
import type { GoogleRating } from "../../../../types/googleReview";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const parsed = googleReviewInputSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return res.status(400).json(errorResponse(first?.message ?? "Date invalide."));
  }

  const { authorName, rating, text, date, reviewUrl } = parsed.data;
  const input: NewGoogleReview = {
    authorName,
    rating: rating as GoogleRating,
    text,
    date,
    ...(reviewUrl ? { reviewUrl } : {}),
  };

  try {
    const review = await createGoogleReview(input);
    return res.status(201).json(okResponse(review));
  } catch (err) {
    console.error("[admin/google-reviews/create] error:", err);
    return res.status(500).json(errorResponse("Eroare la salvarea recenziei Google."));
  }
}
