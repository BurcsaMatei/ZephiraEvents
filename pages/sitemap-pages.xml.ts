// pages/sitemap-pages.xml.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { STATIC_ROUTES } from "../lib/config";
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
  const nowIso = new Date().toISOString();

  const urls = STATIC_ROUTES.map((path) => {
    const priority = path === "/" ? "1.0" : path === "/blog" ? "0.8" : "0.7";
    const loc = joinHostPath(baseUrl, path);
    return urlEntry(loc, nowIso, "weekly", priority);
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ==============================
// Component
// ==============================
// Acest fișier generează un sitemap pentru paginile statice ale site-ului.
export default function SiteMapPages() {
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
