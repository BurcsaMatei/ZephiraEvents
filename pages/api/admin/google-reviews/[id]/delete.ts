// pages/api/admin/google-reviews/[id]/delete.ts
// DELETE — șterge atomic o recenzie Google (getFile → filtrare → updateFile cu sha).

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
  if (typeof id !== "string" || id.length === 0) {
    return res.status(400).json(errorResponse("ID recenzie invalid."));
  }

  try {
    const removed = await deleteGoogleReview(id);
    if (!removed) {
      return res.status(404).json(errorResponse("Recenzia nu există."));
    }
    return res.status(200).json(okResponse());
  } catch (err) {
    console.error("[admin/google-reviews] delete error:", err);
    return res.status(500).json(errorResponse("Eroare la ștergerea recenziei Google."));
  }
}
