// lib/validation/googleReview.ts
// Schema Zod pentru adăugarea unei recenzii Google (admin) — client-safe.

import { z } from "zod";

const GOOGLE_REVIEW_URL_PREFIXES = [
  "https://www.google.com/maps",
  "https://maps.app.goo.gl",
] as const;

export const googleReviewInputSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă minim 2 caractere.")
    .max(80, "Numele trebuie să aibă maxim 80 de caractere."),
  rating: z
    .number()
    .int("Rating-ul trebuie să fie un număr întreg.")
    .min(1, "Rating-ul minim este 1.")
    .max(5, "Rating-ul maxim este 5."),
  text: z
    .string()
    .trim()
    .min(10, "Textul trebuie să aibă minim 10 caractere.")
    .max(2000, "Textul trebuie să aibă maxim 2000 de caractere."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data trebuie să fie în format YYYY-MM-DD."),
  reviewUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || GOOGLE_REVIEW_URL_PREFIXES.some((p) => v.startsWith(p)),
      "Linkul trebuie să înceapă cu https://www.google.com/maps sau https://maps.app.goo.gl.",
    )
    .default(""),
});

export type GoogleReviewInput = z.infer<typeof googleReviewInputSchema>;
