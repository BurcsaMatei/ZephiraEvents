// scripts/migrate-reviews.ts
// One-time: convertește data/reviews.json → fișiere individuale în data/reviews/ via GitHub API.
// Rulare: npm run migrate:reviews

import reviewsRaw from "../data/reviews.json";
import { createFile } from "../lib/admin/github";

interface RawReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: string;
  profilePhotoUrl?: string;
  photos?: string[];
}

interface ReviewJson {
  id: string;
  name: string;
  rating: number;
  text: string;
  status: "approved";
  createdAt: string;
  publishedAt: string;
  profilePhotoUrl?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const reviews = reviewsRaw as RawReview[];
  console.log(`[migrate-reviews] Migrare ${reviews.length} recenzii...`);

  for (let i = 0; i < reviews.length; i++) {
    const raw = reviews[i]!;
    const ts = new Date(`${raw.date}T12:00:00Z`).getTime();
    const shortId = raw.id.slice(-5);
    const newId = `review-${ts}-${shortId}`;
    const createdAt = new Date(`${raw.date}T12:00:00Z`).toISOString();

    const payload: ReviewJson = {
      id: newId,
      name: raw.authorName,
      rating: raw.rating,
      text: raw.text,
      status: "approved",
      createdAt,
      publishedAt: createdAt,
    };

    if (raw.profilePhotoUrl) {
      payload.profilePhotoUrl = raw.profilePhotoUrl;
    }

    const filePath = `data/reviews/${newId}.json`;

    try {
      await createFile(filePath, JSON.stringify(payload, null, 2));
      console.log(`[${i + 1}/${reviews.length}] Creat: ${newId}.json`);
    } catch (err) {
      console.error(`[${i + 1}/${reviews.length}] EROARE la ${newId}:`, err);
    }

    if (i < reviews.length - 1) {
      await sleep(500);
    }
  }

  console.log("[migrate-reviews] Gata.");
}

void main();
