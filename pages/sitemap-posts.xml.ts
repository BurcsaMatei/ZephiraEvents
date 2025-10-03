// pages/sitemap-posts.xml.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { getAllPosts } from "../lib/blogData";
import { absoluteAssetUrl } from "../lib/config";
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
    <image:image xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
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

  const posts = getAllPosts();
  const postsXml = posts
    .map((p) => {
      const loc = joinHostPath(baseUrl, `/blog/${p.slug}`);
      const d = new Date(p.date);
      const lastmod = Number.isNaN(+d) ? nowIso : d.toISOString();

      let imagesXml = "";
      if (p.coverImage) {
        const src = toAbsoluteAsset(baseUrl, p.coverImage);
        imagesXml = imageEntry(src, p.title, p.excerpt);
      }

      return urlEntry(loc, lastmod, "monthly", "0.8", imagesXml);
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${postsXml}
</urlset>`;
}

// ==============================
// Component
// ==============================
// Acest fișier generează un sitemap pentru postările de blog ale site-ului.
export default function SiteMapPosts() {
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
