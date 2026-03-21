// lib/validation/contact.ts
import { z } from "zod";

// ==============================
// Schema
// ==============================
export const contactSchema = z.object({
  name: z.string().min(1, "Nume lipsă."),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalid."),
  phone: z.string().trim().optional().default(""),
  message: z.string().min(5, "Mesaj prea scurt."),
  recaptchaToken: z.string().min(1, "reCAPTCHA lipsă."),
  _hpt: z.string().max(0, "Request invalid.").default(""),
});

export type ContactBody = z.infer<typeof contactSchema>;
