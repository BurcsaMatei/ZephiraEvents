// lib/dates.ts

// ==============================
// Imports
// ==============================
// (niciun import necesar)

// ==============================
// Types
// ==============================

export type FormatOptions = {
  /** Include oră și minute (default: false) */
  withTime?: boolean;
  /** Fus orar (default: "Europe/Bucharest") */
  timeZone?: string;
  /** Granularitate dată (override-uri opționale, non-breaking) */
  day?: "2-digit" | "numeric";
  month?: "long" | "short" | "numeric" | "2-digit";
  year?: "numeric" | "2-digit";
  /** Ziua săptămânii (ex.: "luni") */
  weekday?: "long" | "short" | "narrow";
  /** Setare explicită format 12/24h; ro-RO este 24h, dar expunem opțiunea */
  hour12?: boolean;
};

// ==============================
// Constante
// ==============================

const DEFAULT_LOCALE = "ro-RO";
const DEFAULT_TZ = "Europe/Bucharest";

// ==============================
// Utils
// ==============================

function devWarn(message: string, ...args: unknown[]) {
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[dates.ts] ${message}`, ...args);
  }
}

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !Number.isNaN(d.valueOf());
}

/** Detectează format YYYY-MM-DD (date-only, fără timp). */
function isDateOnlyString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
}

/** Parsează sigur YYYY-MM-DD cu regex (compatibil strict/noUncheckedIndexedAccess). */
function parseDateOnlyParts(dateOnly: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly.trim());
  if (!m || m[1] === undefined || m[2] === undefined || m[3] === undefined) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d)) return null;
  return { y, m: mo, d };
}

/** Extrage offsetul TZ pentru o anumită dată ca string ±HH:MM. */
function getTzOffsetStringAt(date: Date, timeZone: string): string {
  // Încercăm 'shortOffset' (unde este disponibil)
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset" as Intl.DateTimeFormatOptions["timeZoneName"],
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const part = dtf.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "";
    const m = part.match(/([+-])(\d{1,2}):?(\d{2})/);
    if (m && m[1] !== undefined && m[2] !== undefined && m[3] !== undefined) {
      const sign = m[1] as "-" | "+";
      const hh = String(parseInt(m[2], 10)).padStart(2, "0");
      const mm = m[3];
      return `${sign}${hh}:${mm}`;
    }
  } catch {
    // fallback mai jos
  }

  // Fallback: 'short' -> "GMT+3" / "UTC-2"
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const part = dtf.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "";
    const m = part.match(/([+-]\d{1,2})/);
    if (m && m[1] !== undefined) {
      const hoursInt = parseInt(m[1], 10);
      if (!Number.isNaN(hoursInt)) {
        const sign = hoursInt < 0 ? "-" : "+";
        const hh = String(Math.abs(hoursInt)).padStart(2, "0");
        return `${sign}${hh}:00`;
      }
    }
  } catch {
    // ignore
  }

  // Ultim fallback
  return "+00:00";
}

/** Construiește un Date pentru 00:00 în TZ țintă pornind dintr-un string YYYY-MM-DD. */
function dateOnlyToDateAtTzMidnight(dateOnly: string, timeZone: string): Date {
  const parts = parseDateOnlyParts(dateOnly);
  if (!parts) return new Date(NaN);

  const { y, m, d } = parts;

  // Obținem offset-ul corect pentru data respectivă
  const probeUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const off = getTzOffsetStringAt(probeUtc, timeZone); // ±HH:MM
  const isoWithOffset = `${dateOnly}T00:00:00${off}`;
  const result = new Date(isoWithOffset);
  return isValidDate(result) ? result : new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

/** Normalizează orice intrare la Date valid sau null (tratează corect date-only). */
export function ensureDate(input: string | Date, timeZone: string): Date | null {
  if (input instanceof Date) {
    return isValidDate(input) ? input : null;
  }
  if (typeof input === "string") {
    if (isDateOnlyString(input)) {
      return dateOnlyToDateAtTzMidnight(input, timeZone);
    }
    const d = new Date(input);
    return isValidDate(d) ? d : null;
  }
  return null;
}

/** Cache pentru Intl.DateTimeFormat */
const dtfCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  // Încercăm cu opțiunile furnizate
  try {
    const key = `${locale}:${JSON.stringify(options)}`;
    let fmt = dtfCache.get(key);
    if (!fmt) {
      fmt = new Intl.DateTimeFormat(locale, options);
      dtfCache.set(key, fmt);
    }
    return fmt;
  } catch (err) {
    // Fallback: dacă timeZone este invalid, revenim la DEFAULT_TZ
    const fallbackOptions: Intl.DateTimeFormatOptions = {
      ...options,
      timeZone: DEFAULT_TZ,
    };
    const key2 = `${locale}:${JSON.stringify(fallbackOptions)}`;
    let fmt2 = dtfCache.get(key2);
    if (!fmt2) {
      fmt2 = new Intl.DateTimeFormat(locale, fallbackOptions);
      dtfCache.set(key2, fmt2);
    }
    devWarn("getFormatter: options invalid (probabil timeZone). Am folosit DEFAULT_TZ.", err);
    return fmt2;
  }
}

// ==============================
// API public
// ==============================

/**
 * Formatează o dată în ro-RO (implicit Europe/Bucharest).
 * Acceptă fie ISO string, fie Date.
 * Parametrul 2 acceptă fie boolean (compat), fie opțiuni detaliate.
 *
 * Exemplu compat:
 *   formatDateRo(isoString, true)
 *
 * Exemplu cu opțiuni:
 *   formatDateRo(isoString, { withTime: true, month: "short", weekday: "long" })
 */
export function formatDateRo(
  input: string | Date,
  withTimeOrOpts: boolean | FormatOptions = false,
): string {
  const opts: FormatOptions =
    typeof withTimeOrOpts === "boolean" ? { withTime: withTimeOrOpts } : withTimeOrOpts;

  const timeZone = opts.timeZone ?? DEFAULT_TZ;
  const d = ensureDate(input, timeZone);

  if (!d) {
    devWarn("formatDateRo: input invalid", input);
    return "";
  }

  const fmtOptions: Intl.DateTimeFormatOptions = {
    year: opts.year ?? "numeric",
    month: opts.month ?? "long",
    day: opts.day ?? "2-digit",
    ...(opts.weekday ? { weekday: opts.weekday } : {}),
    ...(opts.withTime ? { hour: "2-digit", minute: "2-digit", hour12: opts.hour12 ?? false } : {}),
    timeZone,
  };

  return getFormatter(DEFAULT_LOCALE, fmtOptions).format(d);
}

/** Compat: alias pentru codul existent care cerea formatDateISOtoRo */
export function formatDateISOtoRo(iso: string, withTime = false): string {
  return formatDateRo(iso, withTime);
}

/** Opțional: utilitar dacă ai nevoie de Date din ISO (fără corecții TZ). */
export function parseISO(iso: string): Date {
  return new Date(iso);
}

/** Format range RO cu fallback dacă `formatRange` nu e disponibil. */
export function formatRangeRo(
  start: string | Date,
  end: string | Date,
  opts: FormatOptions = {},
): string {
  const timeZone = opts.timeZone ?? DEFAULT_TZ;
  const d1 = ensureDate(start, timeZone);
  const d2 = ensureDate(end, timeZone);
  if (!d1 || !d2) {
    devWarn("formatRangeRo: start/end invalid", { start, end });
    return "";
  }

  const fmtOptions: Intl.DateTimeFormatOptions = {
    year: opts.year ?? "numeric",
    month: opts.month ?? "long",
    day: opts.day ?? "2-digit",
    ...(opts.weekday ? { weekday: opts.weekday } : {}),
    ...(opts.withTime ? { hour: "2-digit", minute: "2-digit", hour12: opts.hour12 ?? false } : {}),
    timeZone,
  };
  const fmt = getFormatter(DEFAULT_LOCALE, fmtOptions) as Intl.DateTimeFormat & {
    formatRange?: (startDate: Date, endDate: Date) => string;
  };

  if (typeof fmt.formatRange === "function") {
    try {
      return fmt.formatRange(d1, d2);
    } catch {
      // continuă spre fallback
    }
  }

  // Fallback: "12–14 august 2025" / cu oră dacă e cazul
  const sameDay =
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (sameDay) {
    if (opts.withTime) {
      const left = formatDateRo(d1, { ...opts, withTime: true, timeZone });
      const right = getFormatter(DEFAULT_LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: opts.hour12 ?? false,
        timeZone,
      }).format(d2);
      // ex: "12 august 2025, 10:00–12:00"
      const datePart = formatDateRo(d1, { ...opts, withTime: false, timeZone });
      return `${datePart}, ${left.split(", ").pop() ?? ""}–${right}`;
    }
    return formatDateRo(d1, { ...opts, withTime: false, timeZone });
  }

  const left = formatDateRo(d1, { ...opts, timeZone });
  const right = formatDateRo(d2, { ...opts, timeZone });
  return `${left} – ${right}`;
}

/** Returnează "YYYY-MM-DD" în funcție de fusul indicat. */
export function toISODateOnly(input: string | Date, timeZone: string = DEFAULT_TZ): string {
  const d = ensureDate(input, timeZone);
  if (!d) {
    devWarn("toISODateOnly: input invalid", input);
    return "";
  }
  // extragem y/m/d în TZ dorit
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  // parts: day, month, year, literal, …
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const da = parts.find((p) => p.type === "day")?.value ?? "";
  if (!y || !m || !da) {
    devWarn("toISODateOnly: nu am putut extrage părțile de dată", parts);
    return "";
  }
  return `${y}-${m}-${da}`;
}
