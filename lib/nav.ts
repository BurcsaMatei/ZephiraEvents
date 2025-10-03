// lib/nav.ts

// ==============================
// Imports
// ==============================
import { absoluteUrl, SOCIAL_URLS, withBase } from "./config";

// ==============================
// Dev utils
// ==============================
function isDev(): boolean {
  return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
}
function devWarn(msg: string, ...args: unknown[]) {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn(`[nav.ts] ${msg}`, ...args);
  }
}

// ==============================
// Types
// ==============================
export type NavItem = { href: string; label: string };

export type SocialKind = "facebook" | "instagram" | "tiktok";
export type SocialItem = { href: string; label: string; kind: SocialKind };

/** (Opțional) Grupuri/submeniuri pentru scalare ulterioară */
export type NavGroup = {
  label: string;
  items: readonly NavItem[];
};

// ==============================
// Navigation (principal) — readonly
// ==============================
export const NAV = [
  { href: "/", label: "Acasă" },
  { href: "/galerie", label: "Galerie" },
  { href: "/services", label: "Servicii" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const satisfies readonly NavItem[];

// ==============================
// Social — din .env/CMS cu fallback-uri sigure
// ==============================
const FB_DEFAULT = "https://facebook.com/";
const IG_DEFAULT = "https://instagram.com/";
const TT_DEFAULT = "https://tiktok.com/";

const FB_URL = SOCIAL_URLS.facebook || FB_DEFAULT;
const IG_URL = SOCIAL_URLS.instagram || IG_DEFAULT;
const TT_URL = SOCIAL_URLS.tiktok || TT_DEFAULT;

export const SOCIAL = [
  { href: FB_URL, label: "Facebook", kind: "facebook" },
  { href: IG_URL, label: "Instagram", kind: "instagram" },
  { href: TT_URL, label: "TikTok", kind: "tiktok" },
] as const satisfies readonly SocialItem[];

export const SOCIAL_ICON: Record<SocialKind, "facebook" | "instagram" | "tiktok"> = {
  facebook: "facebook",
  instagram: "instagram",
  tiktok: "tiktok",
};

// ==============================
// Helpers
// ==============================
export function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("//");
}

/** Aplică BASE_PATH pe rutele interne; externele rămân intacte.
 *  Notă: al doilea argument este păstrat pentru compat, dar nu mai este folosit.
 */
export function resolveNavHref(href: string, _basePath?: string): string {
  if (!href) return href;
  return withBase(href);
}

/** Variantă absolută — utilă pentru sitemap/JSON-LD. */
export function resolveNavHrefAbsolute(href: string): string {
  if (!href) return href;
  return absoluteUrl(href);
}

// ==============================
// Dev safety (înghețăm structurile în dev)
// ==============================
if (isDev()) {
  try {
    Object.freeze(NAV as unknown as NavItem[]);
    Object.freeze(SOCIAL as unknown as SocialItem[]);
  } catch {
    // ignore
  }

  // warn dacă există href intern care nu începe cu "/" (evităm surprize)
  for (const it of NAV as readonly NavItem[]) {
    if (!isExternal(it.href) && !it.href.startsWith("/")) {
      devWarn(
        `NAV item "${it.label}" are href relativ fără "/": "${it.href}". Recomandat: prefixează cu "/".`,
      );
    }
  }
}
