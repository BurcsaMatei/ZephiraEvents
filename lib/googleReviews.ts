// lib/googleReviews.ts
// Recenzii Google (GBP) — READ din fs la build-time, WRITE via GitHub Contents API.
// NU importa din componente client sau din pagini fără getStaticProps/getServerSideProps.

import fs from "fs";
import path from "path";

import type { GoogleReview, GoogleReviewsStats } from "../types/googleReview";
import { createFile, getFile, updateFile } from "./admin/github";

const FILE_PATH = "data/google-reviews.json";

function reviewsFile(): string {
  return path.join(process.cwd(), "data", "google-reviews.json");
}

function devWarn(msg: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[lib/googleReviews] ${msg}`, ...args);
  }
}

function sortByDateDesc(items: GoogleReview[]): GoogleReview[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ── READ (fs, build-time SSG) ─────────────────────────────────────────────────

export function getGoogleReviews(): GoogleReview[] {
  try {
    const raw = fs.readFileSync(reviewsFile(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return sortByDateDesc(Array.isArray(parsed) ? (parsed as GoogleReview[]) : []);
  } catch {
    devWarn("Nu am putut citi %s", reviewsFile());
    return [];
  }
}

export function getGoogleReviewsStats(items?: GoogleReview[]): GoogleReviewsStats {
  const list = items ?? getGoogleReviews();
  const ratingCount = list.length;
  if (ratingCount === 0) return { ratingValue: 0, ratingCount: 0 };
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return { ratingValue: Math.round((sum / ratingCount) * 10) / 10, ratingCount };
}

// ── READ (GitHub API, runtime admin) ─────────────────────────────────────────

export async function getGoogleReviewsFromGit(): Promise<{
  items: GoogleReview[];
  sha: string;
}> {
  const { content, sha } = await getFile(FILE_PATH);
  const parsed = JSON.parse(content) as unknown;
  return { items: sortByDateDesc(Array.isArray(parsed) ? (parsed as GoogleReview[]) : []), sha };
}

// ── WRITE (GitHub API) ────────────────────────────────────────────────────────

export type NewGoogleReview = Omit<GoogleReview, "id" | "createdAt">;

export async function createGoogleReview(input: NewGoogleReview): Promise<GoogleReview> {
  const review: GoogleReview = {
    ...input,
    id: `greview-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const { items, sha } = await getGoogleReviewsFromGit();
    const next = sortByDateDesc([...items, review]);
    await updateFile(FILE_PATH, JSON.stringify(next, null, 2), sha);
  } catch (err) {
    // Fișier inexistent în repo → îl creăm cu prima recenzie
    if (err instanceof Error && err.message.includes("404")) {
      await createFile(FILE_PATH, JSON.stringify([review], null, 2));
    } else {
      throw err;
    }
  }

  return review;
}

export async function deleteGoogleReview(id: string): Promise<boolean> {
  const { items, sha } = await getGoogleReviewsFromGit();
  const next = items.filter((r) => r.id !== id);
  if (next.length === items.length) return false;
  await updateFile(FILE_PATH, JSON.stringify(next, null, 2), sha);
  return true;
}
