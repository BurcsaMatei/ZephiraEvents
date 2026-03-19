// lib/reviews.ts
// ==============================
// Reviews — sursă statică (data/reviews.json)
// ==============================

import reviewsRaw from "../data/reviews.json";

export type Rating = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  authorName: string;
  rating: Rating;
  text: string;
  createdAt: number; // epoch ms, derivat din câmpul date din JSON
  profilePhotoUrl?: string;
  photos?: string[];
};

type RawReview = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: string; // "YYYY-MM-DD"
  profilePhotoUrl?: string;
  photos?: string[];
};

function rawToReview(r: RawReview): Review {
  return {
    id: r.id,
    authorName: r.authorName,
    rating: r.rating as Rating,
    text: r.text,
    createdAt: new Date(`${r.date}T12:00:00Z`).getTime(),
    ...(typeof r.profilePhotoUrl === "string" ? { profilePhotoUrl: r.profilePhotoUrl } : {}),
    ...(Array.isArray(r.photos) && r.photos.length > 0 ? { photos: r.photos } : {}),
  };
}

// JSON e static — transformăm o singură dată la import
const ALL_REVIEWS: Review[] = (reviewsRaw as RawReview[]).map(rawToReview);

export function getLatestReviews(limit = 12): Review[] {
  return ALL_REVIEWS.slice(0, limit);
}

export function getAllReviews(): Review[] {
  return ALL_REVIEWS;
}
