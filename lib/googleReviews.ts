// lib/googleReviews.ts
// Recenzii Google Business Profile — persistență data/google-reviews.json (fișier unic).
// Server-only (import fs la nivel de modul — NU importa din componente client, doar `import type`).
// Principiu READ/WRITE: citirile publice (SSG) merg pe fs local la build-time;
// citirile admin + toate scrierile merg via GitHub Contents API (persistă pe main).

import fs from "fs";
import path from "path";

import { getFile, updateFile } from "./admin/github";

export type GoogleRating = 1 | 2 | 3 | 4 | 5;

export interface GoogleReview {
  id: string;
  authorName: string;
  rating: GoogleRating;
  text: string;
  /** Data recenziei pe Google — format YYYY-MM-DD */
  date: string;
  /** Link direct către recenzie pe Google Maps (opțional) */
  reviewUrl?: string;
  /** Momentul adăugării din admin — ISO */
  createdAt: string;
}

export interface GoogleReviewsStats {
  ratingValue: number;
  ratingCount: number;
}

const DATA_PATH = "data/google-reviews.json";

function sortByDateDesc(items: GoogleReview[]): GoogleReview[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// ── READ (fs local, build-time / SSG) ─────────────────────────────────────────

export function getGoogleReviews(): GoogleReview[] {
  const file = path.join(process.cwd(), DATA_PATH);
  const raw = fs.readFileSync(file, "utf8");
  return sortByDateDesc(JSON.parse(raw) as GoogleReview[]);
}

export function getGoogleReviewsStats(items?: GoogleReview[]): GoogleReviewsStats {
  const list = items ?? getGoogleReviews();
  const ratingCount = list.length;
  const ratingValue =
    ratingCount > 0
      ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / ratingCount) * 10) / 10
      : 5;
  return { ratingValue, ratingCount };
}

// ── READ (GitHub API, runtime admin — date fresh, ne-dependente de build) ─────

export async function getGoogleReviewsFromGit(): Promise<GoogleReview[]> {
  const { content } = await getFile(DATA_PATH);
  return sortByDateDesc(JSON.parse(content) as GoogleReview[]);
}

// ── WRITE (GitHub API) ────────────────────────────────────────────────────────

export async function createGoogleReview(
  input: Omit<GoogleReview, "id" | "createdAt">,
): Promise<GoogleReview> {
  const { content, sha } = await getFile(DATA_PATH);
  const items = JSON.parse(content) as GoogleReview[];

  const review: GoogleReview = {
    ...input,
    id: `greview-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };

  items.push(review);
  await updateFile(DATA_PATH, `${JSON.stringify(sortByDateDesc(items), null, 2)}\n`, sha);
  return review;
}

/** Șterge atomic: getFile → filtrare array → updateFile cu sha (GitHub respinge sha învechit). */
export async function deleteGoogleReview(id: string): Promise<boolean> {
  const { content, sha } = await getFile(DATA_PATH);
  const items = JSON.parse(content) as GoogleReview[];

  const next = items.filter((r) => r.id !== id);
  if (next.length === items.length) return false;

  await updateFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`, sha);
  return true;
}
