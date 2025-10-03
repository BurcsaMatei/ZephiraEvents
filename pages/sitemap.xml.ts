// pages/sitemap.xml.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { getAllPosts } from "../lib/blogData";
import { SITEMAPS } from "../lib/config";
import { getRequestBaseUrl, joinHostPath } from "../lib/url";

// ==============================
// Utils
// ==============================
function iso(d: Date | string): string {
  return (d instanceof Date ? d : new Date(d)).toISOString();
}

function generateIndex(baseUrl: string): string {
  const nowIso = new Date().toISOString();

  // Derivăm celelalte sitemap-uri din config (excludem indexul însuși)
  const children = (SITEMAPS as readonly string[]).filter((p) => p !== "/sitemap.xml");

  // Heuristic: folosim lastmod specific pentru posts; restul = now
  let postsLastmod = nowIso;
  try {
    const posts = getAllPosts();
    const latest = posts
      .map((p) => +new Date(p.date))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => b - a)[0];
    if (latest) postsLastmod = iso(new Date(latest));
  } catch {
    /* no-op */
  }

  const lastmodFor = (path: string): string => {
    if (path.includes("posts")) return postsLastmod;
    return nowIso;
  };

  const entries = children
    .map((path) => {
      const loc = joinHostPath(baseUrl, path);
      const lastmod = lastmodFor(path);
      return `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

// ==============================
// Component
// ==============================
// Acest fișier generează un sitemap index care listează alte sitemap-uri.
export default function SiteMapIndex() {
  return null;
}

// ==============================
// Exporturi
// ==============================
export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const SITE_URL = getRequestBaseUrl(req);
  const xml = generateIndex(SITE_URL);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=600");
  res.end(xml);

  return { props: {} };
};
