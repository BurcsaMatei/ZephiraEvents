// lib/validation/offerRequest.ts
// ==============================
// Imports
// ==============================

// ==============================
// Types
// ==============================
export type MenuSlug = "basic" | "gold" | "traditional" | "platinum" | "diamond" | "nu-sigur";
export type LodgingKind = "proprie" | "oferta";
export type MusicKind = "am-eu" | "oferta";
export type PhotoVideoKind = "am-eu" | "oferta";

export interface OfferRequestBody {
  name?: string;
  address?: string;
  eventDate?: string; // YYYY-MM-DD (native input)
  participants?: number;
  phone?: string;
  whatsapp?: boolean;
  email?: string;
  menu?: MenuSlug;
  lodging?: { kind?: LodgingKind; rooms?: string; nights?: string; notes?: string };
  music?: { kind?: MusicKind; prefs?: string; genre?: string; interval?: string };
  photoVideo?: {
    kind?: PhotoVideoKind;
    package?: string;
    duration?: string;
    deliverables?: string;
  };
  details?: string;
  recaptchaToken?: string;
  _hpt?: string;
}

// ==============================
// Utils
// ==============================
function emailLike(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

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

export function ddmmyyyyFromYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}.${m[2]}.${m[1]}`;
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

function isYmdOnOrAfterTodayBucharest(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const today = todayYmdEuropeBucharest();
  return ymd >= today;
}

const MENU_ALLOWED: readonly MenuSlug[] = [
  "basic",
  "gold",
  "traditional",
  "platinum",
  "diamond",
  "nu-sigur",
] as const;

// ==============================
// Main validator
// ==============================
export function validateOfferRequest(b: unknown): {
  valid: boolean;
  errors: string[];
  data?: Required<OfferRequestBody>;
} {
  const body = (b ?? {}) as OfferRequestBody;
  const errors: string[] = [];

  const name = String(body.name || "").trim();
  const address = String(body.address || "").trim();
  const eventDate = String(body.eventDate || "").trim(); // YYYY-MM-DD
  const participants = Number(body.participants ?? NaN);
  const phoneNorm = normalizePhoneRO(String(body.phone || "").trim());
  const whatsapp = !!body.whatsapp;
  const email = String(body.email || "").trim();
  const menu = (String(body.menu || "nu-sigur") as MenuSlug) || "nu-sigur";
  const details = String(body.details || "").trim();
  const recaptchaToken = String(body.recaptchaToken || "").trim();
  const _hpt = String(body._hpt || "");

  // required
  if (!name) errors.push("Nume lipsă.");
  if (!address) errors.push("Adresă lipsă.");
  if (!eventDate) errors.push("Dată eveniment lipsă.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) errors.push("Format dată invalid.");
  if (eventDate && !isYmdOnOrAfterTodayBucharest(eventDate))
    errors.push("Data evenimentului nu poate fi în trecut.");
  if (!Number.isInteger(participants) || participants < 20 || participants > 250)
    errors.push("Număr participanți invalid.");
  if (!email || !emailLike(email)) errors.push("Email invalid.");
  if (!phoneNorm || !isValidRoE164(phoneNorm)) errors.push("Telefon invalid (RO).");
  if (!recaptchaToken) errors.push("reCAPTCHA lipsă.");
  if (_hpt) errors.push("Request invalid.");

  // menu
  if (!MENU_ALLOWED.includes(menu)) errors.push("Meniu invalid.");

  // lodging
  const lodgingKind = (body.lodging?.kind || "proprie") as LodgingKind;
  const rooms = lodgingKind === "oferta" ? String(body.lodging?.rooms || "").trim() : "";
  const nights = lodgingKind === "oferta" ? String(body.lodging?.nights || "").trim() : "";
  const lodgingNotes = lodgingKind === "oferta" ? String(body.lodging?.notes || "").trim() : "";

  // music
  const musicKind = (body.music?.kind || "am-eu") as MusicKind;
  const musicPrefs = musicKind === "oferta" ? String(body.music?.prefs || "").trim() : "";
  const musicGenre = musicKind === "oferta" ? String(body.music?.genre || "").trim() : "";
  const musicInterval = musicKind === "oferta" ? String(body.music?.interval || "").trim() : "";

  // photo-video
  const pvKind = (body.photoVideo?.kind || "am-eu") as PhotoVideoKind;
  const pvPackage = pvKind === "oferta" ? String(body.photoVideo?.package || "").trim() : "";
  const pvDuration = pvKind === "oferta" ? String(body.photoVideo?.duration || "").trim() : "";
  const pvDeliverables =
    pvKind === "oferta" ? String(body.photoVideo?.deliverables || "").trim() : "";

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    data: {
      name,
      address,
      eventDate,
      participants,
      phone: phoneNorm,
      whatsapp,
      email,
      menu,
      lodging: { kind: lodgingKind, rooms, nights, notes: lodgingNotes },
      music: { kind: musicKind, prefs: musicPrefs, genre: musicGenre, interval: musicInterval },
      photoVideo: {
        kind: pvKind,
        package: pvPackage,
        duration: pvDuration,
        deliverables: pvDeliverables,
      },
      details,
      recaptchaToken,
      _hpt,
    },
  };
}
