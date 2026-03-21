// lib/validation/offerRequest.ts
// ==============================
// Imports
// ==============================
import { z } from "zod";

import { type EventTypeSlug, isMenuValidForEventType } from "../menus.public";

// ==============================
// Utilities (exportate — folosite în lib/mail/offerRequestEmail.ts)
// ==============================
export function ddmmyyyyFromYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

// ==============================
// Utils interne
// ==============================
function normalizePhoneRO(input: string): string {
  const raw = (input || "").replace(/\s+/g, "");
  if (raw.startsWith("+407")) return raw;
  if (raw.startsWith("00407")) return `+${raw.slice(2)}`;
  if (raw.startsWith("07")) return `+4${raw}`;
  return raw;
}

function isValidRoE164(v: string): boolean {
  return /^\+407\d{8}$/.test(v);
}

function todayYmdEuropeBucharest(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

// ==============================
// Constante
// ==============================
const EVENT_TYPES = ["nunta", "botez-cununie", "private-majorate", "corporate"] as const;

// ==============================
// Sub-schemas
// ==============================
const lodgingSchema = z
  .object({
    kind: z.enum(["proprie", "oferta"]).default("proprie"),
    rooms: z.string().default(""),
    nights: z.string().default(""),
    notes: z.string().default(""),
  })
  .superRefine((val, ctx) => {
    if (val.kind === "oferta") {
      if (!val.rooms.trim()) ctx.addIssue({ code: "custom", message: "Număr camere lipsă." });
      if (!val.nights.trim()) ctx.addIssue({ code: "custom", message: "Număr nopți lipsă." });
    }
  });

const musicSchema = z.object({
  kind: z.enum(["am-eu", "oferta"]).default("am-eu"),
  prefs: z.string().default(""),
  genre: z.string().default(""),
  interval: z.string().default(""),
});

const photoVideoSchema = z.object({
  kind: z.enum(["am-eu", "oferta"]).default("am-eu"),
  package: z.string().default(""),
  duration: z.string().default(""),
  deliverables: z.string().default(""),
});

// ==============================
// Schema principal
// ==============================
export const offerRequestSchema = z
  .object({
    name: z.string().min(1, "Nume lipsă."),
    address: z.string().min(1, "Adresă lipsă."),
    eventDate: z
      .string()
      .refine((ymd) => /^\d{4}-\d{2}-\d{2}$/.test(ymd), "Format dată invalid.")
      .refine(
        (ymd) => !/^\d{4}-\d{2}-\d{2}$/.test(ymd) || ymd >= todayYmdEuropeBucharest(),
        "Data evenimentului nu poate fi în trecut.",
      ),
    participants: z
      .number()
      .int("Număr participanți invalid.")
      .min(20, "Număr participanți invalid.")
      .max(250, "Număr participanți invalid."),
    phone: z
      .string()
      .transform((v) => normalizePhoneRO(v.trim()))
      .refine(isValidRoE164, "Telefon invalid (RO)."),
    whatsapp: z.boolean().default(false),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalid."),
    eventType: z.enum(EVENT_TYPES),
    menu: z.string().default("nu-sigur"),
    lodging: lodgingSchema,
    music: musicSchema,
    photoVideo: photoVideoSchema,
    details: z.string().default(""),
    recaptchaToken: z.string().min(1, "reCAPTCHA lipsă."),
    _hpt: z.string().max(0, "Request invalid.").default(""),
  })
  .superRefine((val, ctx) => {
    if (!isMenuValidForEventType(val.eventType as EventTypeSlug, val.menu)) {
      ctx.addIssue({
        code: "custom",
        message: "Combinație tip eveniment / meniu invalidă.",
        path: ["menu"],
      });
    }
  });

export type OfferRequestData = z.infer<typeof offerRequestSchema>;
