// types/googleReview.ts
// Tipuri pentru sistemul de recenzii Google Business Profile (GBP).
// Persistență: data/google-reviews.json (un singur fișier JSON, array).

export type GoogleRating = 1 | 2 | 3 | 4 | 5;

export interface GoogleReview {
  id: string;
  authorName: string;
  rating: GoogleRating;
  text: string;
  /** Data recenziei pe Google — format "YYYY-MM-DD" */
  date: string;
  /** Link direct către recenzie pe Google Maps (opțional) */
  reviewUrl?: string;
  /** Momentul adăugării în admin — ISO string */
  createdAt: string;
}

export interface GoogleReviewsStats {
  /** Media rating-urilor, rotunjită la o zecimală; 0 când nu există recenzii */
  ratingValue: number;
  ratingCount: number;
}
