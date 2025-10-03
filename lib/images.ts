// lib/images.ts

// ==============================
// Imports
// ==============================
import { absoluteAssetUrl, assetUrl } from "./config";

// ==============================
// Dev utils
// ==============================
function isDev(): boolean {
  return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
}
function devWarn(msg: string, ...args: unknown[]) {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn(`[images.ts] ${msg}`, ...args);
  }
}

// ==============================
// Constante
// ==============================

/**
 * Un singur loc unde DEFINIM căile către imaginile servite din /public
 * sau URL-uri absolute. Pentru logo folosește /public/logo.svg (simplu).
 *
 * NOTĂ: Valorile pot fi:
 *  - căi relative (ex. "/images/foo.jpg") → vor fi trecute prin BASE_PATH/CDN
 *  - URL-uri http(s) absolute → vor fi lăsate neschimbate
 */
export const IMAGES = {
  hero: "/images/current/hero.jpg",
  card: "/images/current/card.jpg",
  contactMap: "/images/current/contact-map.jpg",
  og: "/images/og.jpg", // pentru Open Graph (share)
  favicon: "/favicon.ico", // favicon trebuie să rămână în /public
  heroServices: "/images/current/hero-services.jpg",
  heroGallery: "/images/current/hero-gallery.jpg",
  heroContact: "/images/current/hero-contact.jpg",
} as const;

export type ImageKey = keyof typeof IMAGES;

// ==============================
// Helpers interni (validare doar în dev)
// ==============================
function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("//");
}
function isRelativePath(p: string): boolean {
  return /^\/(?!\/)/.test(p) || /^\.\.?\/.*/.test(p);
}

// Validări non-breaking în dev
if (isDev()) {
  Object.freeze(IMAGES as unknown as Record<string, unknown>);
  for (const [k, v] of Object.entries(IMAGES)) {
    if (typeof v !== "string" || !v.trim()) {
      devWarn(`IMAGES.${k} trebuie să fie string non-gol. Valoare curentă:`, v);
      continue;
    }
    if (!isAbsoluteHttpUrl(v) && !isRelativePath(v)) {
      devWarn(
        `IMAGES.${k} ar trebui să fie cale relativă care începe cu "/" sau URL absolut http(s). Valoare curentă:`,
        v,
      );
    }
  }
}

// ==============================
// API public
// ==============================

/**
 * Returnează URL-ul pentru o cheie din IMAGES.
 * - Folosește config.assetUrl → aplică BASE_PATH când nu există CDN,
 *   sau prefixează cu ASSET_BASE când CDN este setat.
 * - Pentru URL absolut existent (http/https///), îl întoarce neschimbat.
 */
export function resolveImage(key: ImageKey): string {
  const path = IMAGES[key];
  if (!path) {
    if (isDev()) devWarn(`Cheia "${String(key)}" nu există în IMAGES.`);
    return "";
  }
  return assetUrl(path);
}

/**
 * Helper pentru orice path (nu doar chei din IMAGES) cu aceeași logică ca resolveImage.
 */
export function resolvePath(path: string): string {
  if (!path) return "";
  return assetUrl(path);
}

/**
 * Variantă ABSOLUTĂ (util pentru OG/share).
 * - Dacă este URL absolut deja → return neschimbat.
 * - Dacă există CDN → absolut pe CDN.
 * - Altfel → absolut pe SITE_URL + BASE_PATH.
 */
export function resolveImageAbsolute(key: ImageKey): string {
  const path = IMAGES[key];
  if (!path) {
    if (isDev()) devWarn(`Cheia "${String(key)}" nu există în IMAGES (abs).`);
    return "";
  }
  return absoluteAssetUrl(path);
}

/** Variantă absolută pentru ORICE path (nu doar din IMAGES). */
export function resolvePathAbsolute(path: string): string {
  if (!path) return "";
  return absoluteAssetUrl(path);
}
