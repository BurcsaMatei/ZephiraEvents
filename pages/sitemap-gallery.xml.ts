// pages/sitemap-gallery.xml.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { absoluteAssetUrl, GALLERY_ATTACH_LIMIT } from "../lib/config";
import { getGalleryItems } from "../lib/gallery";
import { getRequestBaseUrl, joinHostPath } from "../lib/url";

// ==============================
// Types
// ==============================
type ChangeFreq = "daily" | "weekly" | "monthly";

// ==============================
// Constante
// ==============================
const XML_ESC = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ==============================
// Utils
// ==============================
const urlEntry = (
  loc: string,
  lastmod: string,
  changefreq: ChangeFreq,
  priority: string,
  imagesXml = "",
) => `
  <url>
    <loc>${XML_ESC(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imagesXml}
  </url>`;

const imageEntry = (loc: string, title?: string, caption?: string) => `
    <image:image>
      <image:loc>${XML_ESC(loc)}</image:loc>${
        title ? `\n      <image:title>${XML_ESC(title)}</image:title>` : ""
      }${caption ? `\n      <image:caption>${XML_ESC(caption)}</image:caption>` : ""}
    </image:image>`;

const isAbs = (s: string) => /^https?:\/\//i.test(s);
const toAbsoluteAsset = (baseUrl: string, pathOrUrl: string): string =>
  !pathOrUrl
    ? pathOrUrl
    : isAbs(pathOrUrl)
      ? pathOrUrl
      : (() => {
          const viaCdn = absoluteAssetUrl(pathOrUrl);
          return isAbs(viaCdn) ? viaCdn : joinHostPath(baseUrl, pathOrUrl);
        })();

function generate(baseUrl: string): string {
  const nowIso = new Date().toISOString();
  const loc = joinHostPath(baseUrl, "/galerie");

  const galleryItems = getGalleryItems();
  const imagesXml = galleryItems
    .slice(0, GALLERY_ATTACH_LIMIT)
    .map((it) => {
      if (!it?.src) return "";
      const abs = toAbsoluteAsset(baseUrl, it.src);
      return imageEntry(abs, it.alt, it.caption ?? it.alt);
    })
    .filter(Boolean)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntry(loc, nowIso, "weekly", "0.7", imagesXml)}
</urlset>`;
}

// ==============================
// Component
// ==============================
// Acest fișier generează un sitemap pentru galeria de imagini a site-ului.
export default function SiteMapGallery() {
  return null;
}

// ==============================
// Exporturi
// ==============================
export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const SITE_URL = getRequestBaseUrl(req);
  const xml = generate(SITE_URL);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=600");
  res.end(xml);

  return { props: {} };
};
