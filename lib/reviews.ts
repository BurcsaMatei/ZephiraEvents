// lib/reviews.ts
// ==============================
// Reviews domain helpers (KV + ZSET by date)
// ==============================

import { kv } from "../lib/kv";

export type Rating = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  authorName: string;
  rating: Rating;
  text: string;
  profilePhotoUrl?: string;
  photos?: string[];
  createdAt: number; // epoch ms
};

const ZSET_KEY = "reviews:bydate";
const ITEM_KEY = (id: string) => `review:${id}`;

export async function getLatestReviews(limit = 12): Promise<Review[]> {
  const ids = await kv.zrange<string[]>(ZSET_KEY, -limit, -1);
  ids.reverse();
  const pipeline = kv.pipeline();
  ids.forEach((id) => pipeline.get<Review>(ITEM_KEY(id)));
  const results = (await pipeline.exec()).filter(Boolean) as Review[];
  return results
    .filter((r) => r && r.createdAt && r.authorName && r.rating && r.text)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export async function createReview(input: {
  authorName: string;
  rating: Rating;
  text: string;
  profilePhotoUrl?: string;
  photos?: string[];
}): Promise<Review> {
  const id = `rv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = Date.now();

  const base = {
    id,
    authorName: input.authorName.trim(),
    rating: input.rating,
    text: input.text.trim(),
    createdAt: now,
  } as const;

  const withAvatar =
    typeof input.profilePhotoUrl === "string" && input.profilePhotoUrl.length > 0
      ? { profilePhotoUrl: input.profilePhotoUrl }
      : {};

  const photosClean = input.photos?.filter((u) => typeof u === "string" && u.length > 0) ?? [];
  const withPhotos = photosClean.length ? { photos: photosClean } : {};

  const item: Review = { ...base, ...withAvatar, ...withPhotos };

  await kv.set(ITEM_KEY(id), item);
  await kv.zadd(ZSET_KEY, { score: now, member: id });

  return item;
}
