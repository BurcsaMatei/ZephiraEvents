// pages/api/admin/search.ts
// GET ?q= — caută simultan în messages și reviews din Git.
// Filtrare în memorie după query.

import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { verifyAdminSession } from "../../../lib/admin/auth";
import { getFile, listFiles } from "../../../lib/admin/github";
import { errorResponse, okResponse } from "../../../lib/admin/response";
import type { MessageJson } from "./messages/index";
import type { ReviewJson, ReviewStatus } from "./reviews/index";

// ──────────────────────────────────────────────────────────
// Tipuri publice
// ──────────────────────────────────────────────────────────
export interface SearchMessage {
  id: string;
  name: string;
  email: string;
  preview: string;
  type: MessageJson["type"];
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

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
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
    return res.status(400).json(errorResponse(parsed.error.issues.map((i) => i.message).join(" ")));
  }

  const q = parsed.data.q.trim();
  if (q.length < 2) {
    return res.status(200).json(okResponse({ messages: [], reviews: [] }));
  }

  try {
    const [msgEntries, revEntries] = await Promise.all([
      listFiles("data/messages"),
      listFiles("data/reviews"),
    ]);

    const msgFiles = msgEntries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );
    const revFiles = revEntries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    const [allMessages, allReviews] = await Promise.all([
      Promise.all(msgFiles.map(async (e) => JSON.parse((await getFile(e.path)).content) as MessageJson)),
      Promise.all(revFiles.map(async (e) => JSON.parse((await getFile(e.path)).content) as ReviewJson)),
    ]);

    const messages: SearchMessage[] = allMessages
      .filter(
        (m) =>
          !m.deleted &&
          (matches(m.name, q) || matches(m.email, q) || matches(m.message ?? "", q)),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        preview: (m.message ?? m.eventType ?? "").slice(0, 80),
        type: m.type,
        created_at: m.createdAt,
      }));

    const reviews: SearchReview[] = allReviews
      .filter((r) => matches(r.name, q) || matches(r.text, q))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: r.name,
        preview: r.text.slice(0, 80),
        rating: r.rating,
        status: r.status,
        created_at: r.createdAt,
      }));

    return res.status(200).json(okResponse({ messages, reviews }));
  } catch (err) {
    console.error("[admin/search] error:", err);
    return res.status(500).json(errorResponse("Eroare la căutare."));
  }
}
