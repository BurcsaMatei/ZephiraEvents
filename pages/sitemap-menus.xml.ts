// pages/sitemap-menus.xml.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { absoluteAssetUrl } from "../lib/config";
import { getAllMenusFromGit } from "../lib/menus.server";
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

const imageEntry = (loc: string, title?: string) => `
    <image:image>
      <image:loc>${XML_ESC(loc)}</image:loc>${
        title ? `\n      <image:title>${XML_ESC(title)}</image:title>` : ""
      }
    </image:image>`;

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

async function generate(baseUrl: string): Promise<string> {
  const buildTimestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? new Date().toISOString();

  const menus = await getAllMenusFromGit();
  const urls = menus
    .map((menu) => {
      const loc = joinHostPath(baseUrl, `/meniuri/${menu.slug}`);
      const imagesXml = menu.image
        ? imageEntry(toAbsoluteAsset(baseUrl, menu.image), menu.imageAlt)
        : "";
      return urlEntry(loc, buildTimestamp, "monthly", "0.8", imagesXml);
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

// ==============================
// Component
// ==============================
// Acest fișier generează un sitemap pentru paginile de meniuri ale site-ului.
export default function SiteMapMenus() {
  return null;
}

// ==============================
// Exporturi
// ==============================
export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const SITE_URL = getRequestBaseUrl(req);
  const xml = await generate(SITE_URL);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=600");
  res.end(xml);

  return { props: {} };
};
