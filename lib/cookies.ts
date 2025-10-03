// lib/cookies.ts

// ==============================
// Imports
// ==============================
// (niciun import necesar)

// ==============================
// Types
// ==============================

/** Model granular (compatibil cu CookieProvider) */
export type ConsentCategories = {
  necessary?: boolean;
  analytics?: boolean;
  marketing?: boolean;
};

export type ConsentObject = { granted: ConsentCategories } | { denied: true };

/** Compat cu banner-ul simplu */
export type ConsentValue = "granted" | "denied";

/** Return type pentru readConsent() */
export type StoredConsent = ConsentObject | null;

/** Opțiuni pentru scriere/ștergere cookie */
type SameSiteOpt = "Lax" | "Strict" | "None";
type CookieOptions = {
  days?: number; // durata în zile (folosim Max-Age + Expires)
  path?: string; // default: "/"
  sameSite?: SameSiteOpt; // default: "Lax"
  domain?: string; // ex: ".exemplu.ro" (opțional; ignorat pentru localhost)
  secure?: boolean; // dacă nu e setat, deducem din protocol + SameSite
};

/** Categorii explicite pentru verificare */
export type ConsentCategory = "necessary" | "analytics" | "marketing";

/** Patch granular pentru actualizare incrementală */
export type ConsentPatch = Partial<ConsentCategories>;

// ==============================
// Constante
// ==============================

const KEY = "cookie_consent";
export const COOKIE_KEY = KEY; // alias util în test/debug

/** Baseline reutilizabil pentru cookie-uri */
const DEFAULT_COOKIE_OPTS: Required<Pick<CookieOptions, "days" | "path" | "sameSite">> = {
  days: 365,
  path: "/",
  sameSite: "Lax",
};

// ==============================
// Utils
// ==============================

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isHttps(): boolean {
  return isBrowser() && window.location?.protocol === "https:";
}

function devWarn(message: string, ...args: unknown[]) {
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[cookies.ts] ${message}`, ...args);
  }
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isLikelyLocalhost(host: string): boolean {
  const h = host.trim().toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || /^127\.\d+\.\d+\.\d+$/.test(h);
}

function normalizeCookieDomain(domain?: string): string | undefined {
  if (typeof domain !== "string") return undefined;
  const raw = domain.trim().toLowerCase();
  if (!raw) return undefined;

  // respingem valori cu scheme/port/path/spații
  if (/[/:]/.test(raw) || /\s/.test(raw)) {
    devWarn(`Domain invalid pentru cookie (conține scheme/port/path): "${domain}" — ignor.`);
    return undefined;
  }

  // scoatem orice punct inițial (nu e necesar în browsere moderne)
  const clean = raw.replace(/^\.+/, "");

  // localhost / IP local → NU setăm Domain (browserul nu-l va accepta corect)
  if (isLikelyLocalhost(clean)) {
    devWarn(`Domain cookie ignorat pentru host local: "${domain}".`);
    return undefined;
  }

  // validăm caracterele (litere, cifre, punct, cratimă)
  if (!/^[a-z0-9.-]+$/.test(clean)) {
    devWarn(`Domain cookie conține caractere invalide: "${domain}" — ignor.`);
    return undefined;
  }

  // minim un punct pentru a evita host single-label
  if (!clean.includes(".")) {
    devWarn(`Domain cookie fără punct: "${domain}" — ignor.`);
    return undefined;
  }

  return clean;
}

/** Centralizează opțiunile și evită proprietăți prezente cu valoare `undefined`. */
function mergeCookieOpts(opts?: CookieOptions): {
  days: number;
  path: string;
  sameSite: SameSiteOpt;
  secure: boolean;
  domain?: string;
} {
  const days = typeof opts?.days === "number" ? opts.days : DEFAULT_COOKIE_OPTS.days;
  const path = opts?.path ?? DEFAULT_COOKIE_OPTS.path;
  const sameSite: SameSiteOpt = opts?.sameSite ?? DEFAULT_COOKIE_OPTS.sameSite;

  // SameSite=None necesită Secure; dacă suntem pe HTTP, browserul va ignora cookie-ul Secure
  const secure =
    sameSite === "None" ? true : typeof opts?.secure === "boolean" ? opts.secure : isHttps();

  if (sameSite === "None" && !isHttps()) {
    devWarn('Setezi SameSite="None" pe HTTP. Cookie-ul marcat "Secure" va fi ignorat de browser.');
  }

  const normalizedDomain = normalizeCookieDomain(opts?.domain);
  const base = { days, path, sameSite, secure };
  return normalizedDomain ? { ...base, domain: normalizedDomain } : base;
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const escaped = escapeRegExp(name);
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return m && m[1] !== undefined ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string, opts: CookieOptions = {}): void {
  if (!isBrowser()) return;

  const { days, path, sameSite, domain, secure } = mergeCookieOpts(opts);

  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];

  if (Number.isFinite(days)) {
    const maxAge = Math.max(0, Math.round(days * 24 * 60 * 60));
    const expires = new Date();
    expires.setTime(Date.now() + maxAge * 1000);
    parts.push(`Max-Age=${maxAge}`);
    parts.push(`Expires=${expires.toUTCString()}`);
  }

  parts.push(`Path=${path}`);
  parts.push(`SameSite=${sameSite}`);
  if (domain) parts.push(`Domain=${domain}`);
  if (secure) parts.push("Secure");

  document.cookie = parts.join("; ");
}

function removeCookie(name: string, opts: CookieOptions = {}): void {
  if (!isBrowser()) return;

  const { path, sameSite, domain, secure } = mergeCookieOpts(opts);

  const parts: string[] = [
    `${name}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `Path=${path}`,
    `SameSite=${sameSite}`,
  ];
  if (domain) parts.push(`Domain=${domain}`);
  if (secure) parts.push("Secure");

  document.cookie = parts.join("; ");
}

/** Normalizează valori vechi (string) sau JSON parțial la formatul granular */
function normalizeToObject(input: unknown): ConsentObject | null {
  if (input == null) return null;

  // helper sigur pentru obiecte
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

  // 1) String (plain sau JSON)
  if (typeof input === "string") {
    const raw = input.trim();
    const s = raw.toLowerCase();

    if (s === "denied" || s === "refused" || s === "no" || s === "false") {
      return { denied: true };
    }
    if (s === "granted" || s === "all" || s === "yes" || s === "true") {
      // grant total → toate categoriile true
      return { granted: { necessary: true, analytics: true, marketing: true } };
    }

    // poate fi JSON string → încercăm să-l parse-ăm și relansăm normalizarea
    try {
      const parsed = JSON.parse(raw);
      return normalizeToObject(parsed);
    } catch {
      return null;
    }
  }

  // 2) Obiect – formate noi/legacy
  if (isRecord(input)) {
    const obj = input;

    // 2.a) explicit denied
    if ((obj as Record<string, unknown>).denied === true) return { denied: true };

    // 2.b) format nou: { granted: { necessary?, analytics?, marketing? } }
    if ("granted" in obj && isRecord((obj as Record<string, unknown>).granted)) {
      const g = (obj as Record<string, unknown>).granted as Record<string, unknown>;
      return {
        granted: {
          // în granular NU presupunem implicit true
          necessary: g.necessary === true,
          analytics: g.analytics === true,
          marketing: g.marketing === true,
        },
      };
    }

    // 2.c) legacy: { necessary?, analytics?, marketing? } direct pe rădăcină
    if ("analytics" in obj || "marketing" in obj || "necessary" in obj) {
      return {
        granted: {
          necessary: (obj as Record<string, unknown>).necessary === true,
          analytics: (obj as Record<string, unknown>).analytics === true,
          marketing: (obj as Record<string, unknown>).marketing === true,
        },
      };
    }
  }

  // 3) nimic recunoscut
  return null;
}

/** Rezumă un ConsentObject la "granted"/"denied".
 *  "granted" DOAR dacă cel puțin o categorie este true. */
function summarizeConsent(obj: ConsentObject): ConsentValue {
  if ("denied" in obj) return "denied";
  const g = obj.granted;
  return g.necessary === true || g.analytics === true || g.marketing === true
    ? "granted"
    : "denied";
}

// ==============================
// API public
// ==============================

/** Citește din localStorage/cookie și normalizează la ConsentObject.
 *  Dacă găsim doar cookie, sincronizăm localStorage. */
export function readConsent(): StoredConsent {
  if (!isBrowser()) return null;

  // întâi încercăm JSON din localStorage
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      try {
        const json = JSON.parse(raw);
        const normalized = normalizeToObject(json);
        if (normalized) return normalized;
      } catch {
        // poate fi string "granted"/"denied"
        const normalized = normalizeToObject(raw);
        if (normalized) return normalized;
      }
    }
  } catch (err) {
    devWarn("Eroare la citirea din localStorage:", err);
  }

  // fallback cookie (string) + sincronizare LS
  const c = readCookie(KEY);
  const normalized = normalizeToObject(c);
  if (normalized) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(normalized));
    } catch (err) {
      devWarn("Nu am putut sincroniza localStorage din cookie:", err);
    }
  }
  return normalized;
}

/** Scrie consent – acceptă obiect granular sau string simplu.
 *  Scriem granular în localStorage și un rezumat ('granted'/'denied') în cookie. */
export function writeConsent(
  value: ConsentObject | ConsentValue,
  cookieOpts?: CookieOptions,
): void {
  if (!isBrowser()) return;

  const normalized = normalizeToObject(value);
  if (!normalized) return;

  // localStorage JSON (granular)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(normalized));
  } catch (err) {
    devWarn("Eroare la scrierea în localStorage:", err);
  }

  // cookie – păstrăm un rezumat corect (granted doar dacă există vreo categorie true)
  const cookieValue = summarizeConsent(normalized);
  writeCookie(KEY, cookieValue, cookieOpts);
}

/** Actualizează granular consimțământul (merge peste starea curentă). */
export function updateConsent(patch: ConsentPatch, cookieOpts?: CookieOptions): StoredConsent {
  // obținem baza
  const current = readConsent();
  const base: ConsentCategories = current && "granted" in current ? { ...current.granted } : {};

  // aplicăm patch-ul fără a introduce proprietăți 'undefined'
  const merged: ConsentCategories = {};
  if ("necessary" in patch) merged.necessary = patch.necessary === true ? true : false;
  else if (base.necessary === true) merged.necessary = true;

  if ("analytics" in patch) merged.analytics = patch.analytics === true ? true : false;
  else if (base.analytics === true) merged.analytics = true;

  if ("marketing" in patch) merged.marketing = patch.marketing === true ? true : false;
  else if (base.marketing === true) merged.marketing = true;

  const next: ConsentObject = { granted: merged };
  writeConsent(next, cookieOpts);
  return next;
}

/** Șterge ambele stocări (cu opțiuni cookie opționale pentru domeniu/path). */
export function removeConsent(opts?: CookieOptions): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch (err) {
    devWarn("Eroare la ștergerea din localStorage:", err);
  }
  removeCookie(KEY, opts);
}

/** API simplu pentru banner minimalist — sumarul curent sau null. */
export function getConsentSummary(): ConsentValue | null {
  const data = readConsent();
  if (!data) return null;
  return summarizeConsent(data);
}

/** API simplu compat: păstrează semnătura veche. */
export function getStoredConsent(): ConsentValue | null {
  return getConsentSummary();
}

export function saveConsent(value: ConsentValue, cookieOpts?: CookieOptions) {
  writeConsent(value, cookieOpts);
}

/** True dacă avem vreun tip de grant (necessary/analytics/marketing). */
export function hasConsent(): boolean {
  const data = readConsent();
  if (!data || "denied" in data) return false;
  const g = data.granted;
  return !!g.necessary || !!g.analytics || !!g.marketing;
}

/** Verifică dacă există consimțământ explicit pentru o categorie. */
export function hasConsentFor(category: ConsentCategory): boolean {
  const data = readConsent();
  if (!data || "denied" in data) return false;
  const g = data.granted;
  return g[category] === true;
}

/** Type guard – verifică dacă StoredConsent are granted */
export function isGrantedConsent(x: StoredConsent): x is { granted: ConsentCategories } {
  return !!x && typeof x === "object" && "granted" in x;
}

// ==============================
// Exporturi (compatibilitate)
// ==============================

/* Alias pentru compatibilitate cu cod existent */
export const clearConsent = removeConsent;
