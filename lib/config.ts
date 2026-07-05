// lib/config.ts

// ==============================
// Dev utils
// ==============================
const IS_DEV = typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

function devWarn(msg: string, ...args: unknown[]) {
  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[config.ts] ${msg}`, ...args);
  }
}

// ==============================
// Helpers (parsing & normalize)
// ==============================
function parseBool(val: string | undefined, fallback = false): boolean {
  if (!val) return fallback;
  const v = val.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "y";
}

function normalizeUrl(
  val: string | undefined,
  { requireProtocol = false }: { requireProtocol?: boolean } = {},
): string {
  if (!val) return "";
  const s = val.trim();
  if (!s) return "";
  const hasProtocol = /^https?:\/\//i.test(s) || s.startsWith("//");
  if (requireProtocol && !hasProtocol) {
    devWarn(`URL fără protocol: "${s}". Așteptăm http(s)://…`);
    return "";
  }
  if (hasProtocol) return s.replace(/\/+$/, "");
  return s;
}

function normalizeBasePath(val: string | undefined): string {
  const raw = (val || "").trim();
  if (!raw) return "";
  if (!raw.startsWith("/")) {
    devWarn(`BASE_PATH ar trebui să înceapă cu "/". Corectez automat: "/${raw}"`);
  }
  return `/${raw.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function ensureLeadingSlash(s: string): string {
  if (!s) return "/";
  return s.startsWith("/") ? s : `/${s}`;
}

function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("//");
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p = ensureLeadingSlash(path);
  return `${b}${p}`;
}

function applyBasePath(path: string, basePath: string): string {
  if (isExternal(path)) return path;
  const base = basePath && basePath !== "/" ? basePath : "";
  const normalized = ensureLeadingSlash(path);
  return (base + normalized).replace(/\/\/+/g, "/");
}

function isSpecialProtocol(url: string): boolean {
  return /^(mailto:|tel:|sms:|data:|javascript:)/i.test(url);
}
function isQueryOrHash(path: string): boolean {
  return path.startsWith("?") || path.startsWith("#");
}

// ==============================
// Site
// ==============================
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const PREFER_TRAILING = /\/$/.test(RAW_SITE_URL ?? "");
const SITE_URL = normalizeUrl(RAW_SITE_URL, { requireProtocol: true });

// Guard strict pentru producție: fără SITE_URL valid nu lansăm
if (process.env.NODE_ENV === "production" && !SITE_URL) {
  throw new Error(
    'NEXT_PUBLIC_SITE_URL este obligatoriu în producție și trebuie să fie un URL absolut cu protocol (ex: "https://zephiraevents.ro").',
  );
}

export const SITE = {
  url: SITE_URL,
  name: (process.env.NEXT_PUBLIC_SITE_NAME || "").trim(),
  titleTemplate: (process.env.NEXT_PUBLIC_SITE_TITLE_TEMPLATE || "").trim(),
  defaultTitle: (process.env.NEXT_PUBLIC_DEFAULT_TITLE || "").trim(),
  description: (process.env.NEXT_PUBLIC_SITE_DESC || "").trim(),
  ogImage: (process.env.NEXT_PUBLIC_OG_IMAGE || "").trim(),
  twitterHandle: (process.env.NEXT_PUBLIC_TWITTER_HANDLE || "").trim(),
  locale: (process.env.NEXT_PUBLIC_LOCALE || "").trim(),
} as const;

// ==============================
// Theme (centralizat)
// ==============================
const RAW_PWA_LIGHT = (
  process.env.NEXT_PUBLIC_PWA_THEME_COLOR ||
  process.env.NEXT_PUBLIC_THEME_COLOR ||
  ""
).trim();
const RAW_PWA_DARK = (process.env.NEXT_PUBLIC_PWA_THEME_COLOR_DARK || "").trim();
const RAW_UI_LIGHT = (process.env.NEXT_PUBLIC_UI_THEME_COLOR_LIGHT || "").trim();
const RAW_UI_DARK = (process.env.NEXT_PUBLIC_UI_THEME_COLOR_DARK || "").trim();

const DEFAULTS = {
  pwaLight: "#5561F2", // accent (manifest)
  pwaDark: "#7b84ff", // accent pentru dark (opțional)
  uiLight: "#ffffff", // culoare bară UI în light
  uiDark: "#0b0b0d", // culoare bară UI în dark
};

export const THEME = {
  /**
   * @deprecated Folosește `pwaThemeColorLight` — păstrat doar pentru compatibilitate
   * cu consumatorii vechi care importau `THEME.pwaThemeColor`.
   */
  pwaThemeColor: RAW_PWA_LIGHT || DEFAULTS.pwaLight,
  /** Culoare accent PWA (manifest + theme-color) pentru tema light — valoarea oficială. */
  pwaThemeColorLight: RAW_PWA_LIGHT || DEFAULTS.pwaLight,
  /** Culoare accent PWA pentru tema dark (opțional). */
  pwaThemeColorDark: RAW_PWA_DARK || DEFAULTS.pwaDark,

  // Browser UI (meta theme-color)
  uiThemeColorLight: RAW_UI_LIGHT || DEFAULTS.uiLight,
  uiThemeColorDark: RAW_UI_DARK || DEFAULTS.uiDark,
} as const;

// ==============================
// Contact
// ==============================
export const CONTACT = {
  enabled: parseBool(process.env.NEXT_PUBLIC_CONTACT_ENABLED, false),
  email: (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim(),
  phone: (process.env.NEXT_PUBLIC_CONTACT_PHONE || "").trim(),
  address: {
    street: (process.env.NEXT_PUBLIC_CONTACT_STREET || "").trim(),
    city: (process.env.NEXT_PUBLIC_CONTACT_CITY || "").trim(),
    /** Folosit doar pentru afișare UI; nu are corespondent în Schema.org PostalAddress */
    commune: (process.env.NEXT_PUBLIC_CONTACT_COMMUNE || "").trim(),
    region: (process.env.NEXT_PUBLIC_CONTACT_REGION || "").trim(),
    postal: (process.env.NEXT_PUBLIC_CONTACT_POSTAL || "").trim(),
    country: (process.env.NEXT_PUBLIC_CONTACT_COUNTRY || "").trim(),
  },
  /**
   * Coordonate GPS — folosite în JSON-LD (Schema.org GeoCoordinates).
   * Derivate din NEXT_PUBLIC_CONTACT_MAP_EMBED dar stocate explicit
   * pentru a evita parsarea URL-ului la runtime.
   */
  geo: {
    lat: 45.7267486405454,
    lng: 27.12549853325499,
  },
  mapEmbed: (process.env.NEXT_PUBLIC_CONTACT_MAP_EMBED || "").trim(),
} as const;

// ==============================
// Social
// ==============================
export const SOCIAL_URLS = {
  facebook: normalizeUrl(process.env.NEXT_PUBLIC_FB_URL, { requireProtocol: true }),
  instagram: normalizeUrl(process.env.NEXT_PUBLIC_IG_URL, { requireProtocol: true }),
  tiktok: normalizeUrl(process.env.NEXT_PUBLIC_TT_URL, { requireProtocol: true }),
  /** Google Business Profile — sursă unică pentru sameAs (JSON-LD) și link-urile „Vezi pe Google" */
  googleMaps: "https://www.google.com/maps/place/ChIJqe6HRAIjtEARUT73PVztMnA",
} as const;

// ==============================
// Path / Assets
// ==============================
export const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
export const ASSET_BASE = normalizeUrl(process.env.NEXT_PUBLIC_ASSET_BASE, {
  requireProtocol: true,
}); // ex: https://cdn.exemplu.com

export function withBase(path: string): string {
  if (!path) return path;
  if (isExternal(path) || isSpecialProtocol(path) || isQueryOrHash(path)) return path;
  return applyBasePath(path, BASE_PATH);
}

// ==============================
// Trailing slash & Canonical
// ==============================
function alignTrailingSlash(pathname: string): string {
  if (!pathname) return "/";
  const ensureLeading = ensureLeadingSlash(pathname);
  if (PREFER_TRAILING) return ensureLeading.endsWith("/") ? ensureLeading : `${ensureLeading}/`;
  if (ensureLeading !== "/" && ensureLeading.endsWith("/"))
    return ensureLeading.replace(/\/+$/, "");
  return ensureLeading;
}

export function canonical(pathname: string): string {
  if (!SITE.url) {
    devWarn("SITE.url este gol — nu pot construi canonical absolut.");
    return pathname;
  }
  if (isExternal(pathname)) return pathname;
  const pathWithBase = withBase(pathname);
  const normalized = alignTrailingSlash(pathWithBase);
  return joinUrl(SITE.url, normalized);
}

// ==============================
// SEO / URL Helpers
// ==============================
export function absoluteUrl(path: string): string {
  if (!path) return path;
  if (!SITE.url) {
    devWarn("SITE.url este gol — nu pot construi URL absolut.");
    return path;
  }
  if (isExternal(path)) return path;

  const idxQ = path.indexOf("?");
  const idxH = path.indexOf("#");
  const cut =
    idxQ === -1 && idxH === -1
      ? -1
      : idxQ === -1
        ? idxH
        : idxH === -1
          ? idxQ
          : Math.min(idxQ, idxH);

  const main: string = cut === -1 ? path : path.slice(0, cut);
  const suffix: string = cut === -1 ? "" : path.slice(cut);

  const withBaseNoQuery = (p: string): string => applyBasePath(p, BASE_PATH);
  const mainWithBase = alignTrailingSlash(withBaseNoQuery(main));
  return joinUrl(SITE.url, mainWithBase) + suffix;
}

/**
 * Returnează URL-ul unui asset cu prefix CDN (dacă ASSET_BASE e setat).
 * Fallback (fără CDN): returnează path RELATIV prefixat cu BASE_PATH.
 * Folosit pentru atribute `src` în componente client (nu necesită URL absolut).
 */
export function assetUrl(path: string): string {
  if (!path) return path;
  if (isExternal(path)) return path;
  if (ASSET_BASE) return joinUrl(ASSET_BASE, ensureLeadingSlash(path));
  return withBase(path);
}

/**
 * Returnează URL-ul ABSOLUT al unui asset cu prefix CDN (dacă ASSET_BASE e setat).
 * Fallback (fără CDN): returnează URL absolut construit cu SITE.url.
 * Folosit pentru JSON-LD, OG tags, sitemaps — oriunde e necesar un URL absolut.
 * @see assetUrl — varianta relativă, fără SITE.url în fallback
 */
export function absoluteAssetUrl(path: string): string {
  if (!path) return path;
  if (isExternal(path)) return path;
  if (ASSET_BASE) return joinUrl(ASSET_BASE, ensureLeadingSlash(path));
  return absoluteUrl(path);
}

export function absoluteOgImage(src?: string): string {
  const img = (src && src.trim()) || SITE.ogImage;
  if (!img) return "";
  return absoluteAssetUrl(img);
}

export const SEO_DEFAULTS = {
  siteName: SITE.name,
  titleTemplate: SITE.titleTemplate,
  defaultTitle: SITE.defaultTitle,
  description: SITE.description,
  ogImage: SITE.ogImage,
  twitterHandle: SITE.twitterHandle,
} as const;

// ==============================
// Sitemap / Routes / Limits
// ==============================
export const SITEMAPS = [
  "/sitemap.xml", // index
  "/sitemap-pages.xml", // pagini non-blog
  "/sitemap-posts.xml", // articole blog
  "/sitemap-gallery.xml", // galerie
  "/sitemap-menus.xml", // pagini meniuri
] as const;

export const STATIC_ROUTES = [
  "/",
  "/servicii",
  "/cort-evenimente-la-locatia-ta",
  "/contact",
  "/blog",
  "/reviews",
  "/marca",
  "/cookie-policy",
] as const;


