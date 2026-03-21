// pages/sitemap-menus.xml.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { getAllMenus } from "../lib/menus";
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
const urlEntry = (loc: string, lastmod: string, changefreq: ChangeFreq, priority: string) => `
  <url>
    <loc>${XML_ESC(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

function generate(baseUrl: string): string {
  const buildTimestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? new Date().toISOString();

  const menus = getAllMenus();
  const urls = menus
    .map((menu) => {
      const loc = joinHostPath(baseUrl, `/meniuri/${menu.slug}`);
      return urlEntry(loc, buildTimestamp, "monthly", "0.8");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
  const xml = generate(SITE_URL);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=600");
  res.end(xml);

  return { props: {} };
};
