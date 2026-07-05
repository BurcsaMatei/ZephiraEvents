// lib/validation/googleReview.ts
// Validare Zod pentru recenzii Google Business Profile adăugate din admin.

import { z } from "zod";

const REVIEW_URL_PREFIXES = ["https://www.google.com/maps", "https://maps.app.goo.gl"] as const;

export const googleReviewSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "Numele autorului trebuie să aibă minim 2 caractere.")
    .max(80, "Numele autorului trebuie să aibă maxim 80 de caractere."),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  text: z
    .string()
    .trim()
    .min(5, "Textul recenziei trebuie să aibă minim 5 caractere.")
    .max(3000, "Textul recenziei trebuie să aibă maxim 3000 de caractere."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data trebuie să fie în format YYYY-MM-DD."),
  reviewUrl: z
    .string()
    .trim()
    .refine(
      (u) => REVIEW_URL_PREFIXES.some((p) => u.startsWith(p)),
      "Link-ul trebuie să înceapă cu https://www.google.com/maps sau https://maps.app.goo.gl.",
    )
    .optional(),
});

export type GoogleReviewInput = z.infer<typeof googleReviewSchema>;
