// pages/api/admin/google-reviews/[id]/delete.ts
// DELETE — elimină o recenzie Google din data/google-reviews.json via GitHub API.
// Atomic: getFile → filtrare array → updateFile cu sha (409 la conflict concurent).

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../../lib/admin/auth";
import { errorResponse, okResponse } from "../../../../../lib/admin/response";
import { deleteGoogleReview } from "../../../../../lib/googleReviews";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json(errorResponse("ID invalid."));
  }

  try {
    const removed = await deleteGoogleReview(id);
    if (!removed) {
      return res.status(404).json(errorResponse("Recenzie negăsită."));
    }
    return res.status(200).json(okResponse());
  } catch (err) {
    console.error("[admin/google-reviews/delete] error:", err);
    return res.status(500).json(errorResponse("Eroare la ștergerea recenziei Google."));
  }
}
