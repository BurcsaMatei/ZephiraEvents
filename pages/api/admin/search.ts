// pages/api/admin/search.ts
// GET ?q= — caută simultan în messages și reviews.
// Protejat cu sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { verifyAdminSession } from "../../../lib/admin/auth";
import { errorResponse, okResponse } from "../../../lib/admin/response";
import { supabaseAdmin } from "../../../lib/admin/supabase";
import type { MessageType, ReviewStatus } from "../../../lib/admin/supabase.types";

// ──────────────────────────────────────────────────────────
// Tipuri publice — importate via `import type` în AdminSearch
// ──────────────────────────────────────────────────────────
export interface SearchMessage {
  id: string;
  name: string;
  email: string;
  preview: string;
  type: MessageType;
  created_at: string;
}

export interface SearchReview {
  id: string;
  name: string;
  preview: string;
  rating: number;
  status: ReviewStatus;
  created_at: string;
}

export interface SearchResults {
  messages: SearchMessage[];
  reviews: SearchReview[];
}

type Resp = { ok: true; data: SearchResults } | { ok: false; error: string };

// ──────────────────────────────────────────────────────────
// Validare
// ──────────────────────────────────────────────────────────
const querySchema = z.object({
  q: z.string().min(2).max(100),
});

// Elimină caractere care pot sparge sintaxa filterului PostgREST .or()
function sanitize(s: string): string {
  return s.replace(/[%_\\,()'"/]/g, "").trim();
}

// ──────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Unauthorized"));
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json(errorResponse(parsed.error.issues.map((i) => i.message).join(" ")));
  }

  const q = sanitize(parsed.data.q);
  if (q.length < 2) {
    return res.status(200).json(okResponse({ messages: [], reviews: [] }));
  }

  const p = `%${q}%`;

  const [msgRes, revRes] = await Promise.all([
    supabaseAdmin
      .from("messages")
      .select("id, name, email, message, type, created_at")
      .or(`name.ilike.${p},email.ilike.${p},message.ilike.${p}`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("reviews")
      .select("id, name, text, rating, status, created_at")
      .or(`name.ilike.${p},text.ilike.${p}`)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const messages: SearchMessage[] = (msgRes.data ?? []).map((m) => ({
    id: String(m.id),
    name: String(m.name),
    email: String(m.email),
    preview: String(m.message ?? "").slice(0, 80),
    type: m.type as MessageType,
    created_at: String(m.created_at),
  }));

  const reviews: SearchReview[] = (revRes.data ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.name),
    preview: String(r.text ?? "").slice(0, 80),
    rating: Number(r.rating),
    status: r.status as ReviewStatus,
    created_at: String(r.created_at),
  }));

  return res.status(200).json(okResponse({ messages, reviews }));
}
