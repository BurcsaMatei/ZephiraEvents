// pages/site.webmanifest.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { SITE, THEME, withBase } from "../lib/config";
import { getRequestBaseUrl } from "../lib/url";

// ==============================
// Types
// ==============================
type DisplayMode = "fullscreen" | "standalone" | "minimal-ui" | "browser";
type DisplayOverrideMode = DisplayMode | "window-controls-overlay";
type Dir = "ltr" | "rtl" | "auto";
type HandleLinks = "preferred" | "auto" | "none";

interface ManifestIcon {
  src: string;
  sizes: string; // ex: "192x192"
  type: string; // ex: "image/png"
  purpose?: string; // ex: "maskable"
}

interface ManifestShortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: ManifestIcon[];
}

interface ManifestScreenshot {
  src: string;
  sizes: string; // ex: "1080x1920"
  type: string; // ex: "image/png"
  form_factor?: "narrow" | "wide";
}

interface ShareTargetFile {
  name: string;
  accept: string[]; // ex: ["image/*", "text/*"]
}

interface ShareTargetParams {
  title?: string;
  text?: string;
  url?: string;
  files?: ShareTargetFile[];
}

interface ManifestShareTarget {
  action: string; // URL
  method?: "GET" | "POST";
  enctype?: "application/x-www-form-urlencoded" | "multipart/form-data";
  params?: ShareTargetParams;
}

interface WebAppManifest {
  id?: string;
  name?: string;
  short_name?: string;
  description?: string;
  lang?: string;
  dir?: Dir;

  start_url?: string;
  scope?: string;
  display?: DisplayMode;
  display_override?: DisplayOverrideMode[];
  background_color?: string;
  theme_color?: string;
  orientation?: string;

  categories?: string[];

  icons: ManifestIcon[];
  shortcuts?: ManifestShortcut[];
  screenshots?: ManifestScreenshot[];

  // Opționale
  share_target?: ManifestShareTarget;
  handle_links?: HandleLinks;
}

// ==============================
// Component (void)
// ==============================
export default function Manifest(): JSX.Element | null {
  return null;
}

// ==============================
// Server-side manifest
// ==============================
export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  // ── PWA gating: manifest disponibil DOAR în producție + flag ON
  const IS_PROD = process.env.NODE_ENV === "production";
  const ENABLE_PWA = process.env.NEXT_PUBLIC_ENABLE_PWA === "1" && IS_PROD;

  if (!ENABLE_PWA) {
    res.statusCode = 404;
    res.setHeader("Cache-Control", "no-store");
    res.end("");
    return { props: {} };
  }

  const host = getRequestBaseUrl(req);

  // ID stabil: absolut (host + basePath)
  const appId = `${host}${withBase("/")}`;

  // Share Target doar dacă este activat explicit (și ai handler)
  const SHARE_TARGET_ENABLED = /^(1|true|yes|y)$/i.test(
    (process.env.NEXT_PUBLIC_SHARE_TARGET_ENABLED || "").trim(),
  );

  const manifest: WebAppManifest = {
    id: appId,
    name: SITE.name || "Exemplu",
    short_name: SITE.name || "Exemplu",
    description: SITE.description || "Servicii X pentru Y.",
    lang: SITE.locale || "ro-RO",
    dir: "ltr",

    start_url: withBase("/?source=pwa"),
    scope: withBase("/"),
    display: "standalone",
    display_override: ["standalone", "window-controls-overlay"],

    background_color: "#ffffff",
    theme_color: THEME.pwaThemeColor,

    orientation: "portrait",
    categories: ["business", "productivity"],

    // ANY + MASKABLE ca intrări separate
    icons: [
      { src: withBase("/icons/android-chrome-192x192.png"), sizes: "192x192", type: "image/png" },
      { src: withBase("/icons/android-chrome-256x256.png"), sizes: "256x256", type: "image/png" },
      { src: withBase("/icons/android-chrome-384x384.png"), sizes: "384x384", type: "image/png" },
      { src: withBase("/icons/android-chrome-512x512.png"), sizes: "512x512", type: "image/png" },

      {
        src: withBase("/icons/android-chrome-maskable-192x192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: withBase("/icons/android-chrome-maskable-256x256.png"),
        sizes: "256x256",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: withBase("/icons/android-chrome-maskable-384x384.png"),
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: withBase("/icons/android-chrome-maskable-512x512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },

      { src: withBase("/icons/apple-touch-icon.png"), sizes: "180x180", type: "image/png" },
    ],

    shortcuts: [
      {
        name: "Galerie",
        short_name: "Galerie",
        description: "Deschide galeria de imagini.",
        url: withBase("/galerie"),
        icons: [
          { src: withBase("/icons/shortcut-gallery.png"), sizes: "96x96", type: "image/png" },
        ],
      },
      {
        name: "Blog",
        short_name: "Blog",
        description: "Ultimele articole publicate.",
        url: withBase("/blog"),
        icons: [{ src: withBase("/icons/shortcut-blog.png"), sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Contact",
        short_name: "Contact",
        description: "Contactează-ne rapid.",
        url: withBase("/contact"),
        icons: [
          { src: withBase("/icons/shortcut-contact.png"), sizes: "96x96", type: "image/png" },
        ],
      },
    ],

    screenshots: [
      {
        src: withBase("/screenshots/home-portrait.png"),
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: withBase("/screenshots/home-landscape.png"),
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };

  if (SHARE_TARGET_ENABLED) {
    manifest.share_target = {
      action: withBase("/share-target"),
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [{ name: "files", accept: ["image/*", "text/*"] }],
      },
    };
    manifest.handle_links = "preferred";
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=600");
  res.end(JSON.stringify(manifest, null, 2));

  return { props: {} };
};
// pages/site.webmanifest.ts
