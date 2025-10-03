// pages/robots.txt.ts

// ==============================
// Imports
// ==============================
import type { GetServerSideProps } from "next";

import { SITEMAPS } from "../lib/config";
import { parseEnvBool } from "../lib/env";
import { getRequestBaseUrl, joinHostPath } from "../lib/url";

// ==============================
// Utils
// ==============================
function generateRobots(host: string, disallowAll: boolean, sitemaps: readonly string[]) {
  const lines = ["User-agent: *"];
  lines.push(disallowAll ? "Disallow: /" : "Allow: /");

  // Sitemap-uri multiple
  for (const sm of sitemaps) {
    lines.push(`Sitemap: ${joinHostPath(host, sm)}`);
  }

  lines.push(""); // linie goală finală
  return lines.join("\n");
}

// ==============================
// Component
// ==============================
export default function Robots() {
  return null;
}

// ==============================
// Exporturi
// ==============================
export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const SITE_URL = getRequestBaseUrl(req);
  const disallowAll = parseEnvBool(process.env.DISABLE_INDEXING, false);

  const robots = generateRobots(SITE_URL, disallowAll, SITEMAPS);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  // Header robots mai strict:
  // - dacă DISABLE_INDEXING=true => blocăm puternic
  // - altfel, pe non-prod evităm indexarea accidentală
  if (disallowAll) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  } else if (process.env.NODE_ENV !== "production") {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }

  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=600");
  res.write(robots);
  res.end();

  return { props: {} };
};
