// scripts/build-rss.ts
/**
 * Generează public/rss.xml (și feed.xml) din lib/blogData.ts
 * Rulare: `npm run rss:build` (rulează și în `postbuild`)
 *
 * ⚠️ În producție .env trebuie să aibă:
 *    NEXT_PUBLIC_SITE_URL=https://zephiraevents.ro   (fără slash final)
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// ==============================
// ENV / CONFIG
// ==============================
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL.trim()
    : "https://zephiraevents.ro";

// normalize: remove trailing slashes
const NORMALIZED_SITE_URL = RAW_SITE_URL.replace(/\/+$/, "");

// validate URL
function safeBaseUrl(input: string): string {
  try {
    // throws if invalid
    const u = new URL(input);
    return `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    // eslint-disable-next-line no-console
    console.warn(
      `[RSS] NEXT_PUBLIC_SITE_URL invalid ("${input}"). Folosesc fallback https://zephiraevents.ro`,
    );
    return "https://zephiraevents.ro";
  }
}

const BASE_URL = safeBaseUrl(NORMALIZED_SITE_URL);

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "ZephiraEvents";
const SITE_DESC =
  process.env.NEXT_PUBLIC_SITE_DESC ??
  "ZephiraEvents Focșani — Sală de Evenimente. Nuntă, Botez, Petreceri private.";
const SITE_LOCALE = process.env.NEXT_PUBLIC_LOCALE ?? "ro-RO";

// ==============================
// Types locale
// ==============================
type BlogPost = {
  title: string;
  slug: string;
  excerpt?: string;
  date?: string; // ISO preferat (fallback: now)
};

// ==============================
// Import date blog
// ==============================
import * as blog from "../lib/blog.server";

type BlogModuleShape = {
  BLOG_POSTS?: unknown;
  posts?: unknown;
  default?: unknown;
  getAllPosts?: unknown;
};

function isPostArray(v: unknown): v is BlogPost[] {
  return (
    Array.isArray(v) &&
    v.every((p) => {
      if (!p || typeof p !== "object") return false;
      const r = p as Record<string, unknown>;
      return typeof r.title === "string" && typeof r.slug === "string";
    })
  );
}

function resolvePosts(mod: BlogModuleShape): BlogPost[] {
  if (isPostArray(mod.BLOG_POSTS)) return mod.BLOG_POSTS;
  if (isPostArray(mod.posts)) return mod.posts;
  if (isPostArray((mod as { default?: unknown }).default))
    return (mod as { default: BlogPost[] }).default;
  if (typeof mod.getAllPosts === "function") {
    const arr = (mod.getAllPosts as () => unknown)();
    if (isPostArray(arr)) return arr;
  }
  throw new Error(
    "[RSS] Nu am găsit un array de postări în lib/blogData.ts (accept: BLOG_POSTS, posts, default[] sau getAllPosts()).",
  );
}

// ==============================
// Helpers
// ==============================
const xmlEscape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const normalizeSlug = (slug: string): string => slug.replace(/^\/+|\/+$/g, "");

const toItemXml = (p: BlogPost, baseUrl: string) => {
  const link = `${baseUrl}/blog/${encodeURI(normalizeSlug(p.slug))}`;
  const pubDate = p.date ? new Date(p.date) : new Date();
  const desc = p.excerpt ? `<![CDATA[${p.excerpt}]]>` : "";
  return [
    "<item>",
    `  <title>${xmlEscape(p.title)}</title>`,
    `  <link>${link}</link>`,
    `  <guid>${link}</guid>`,
    `  <pubDate>${pubDate.toUTCString()}</pubDate>`,
    p.excerpt ? `  <description>${desc}</description>` : "",
    "</item>",
  ]
    .filter(Boolean)
    .join("\n");
};

// ==============================
// Main
// ==============================
async function run(): Promise<void> {
  const POSTS = resolvePosts(blog as BlogModuleShape);

  const now = new Date().toUTCString();
  const itemsXml = POSTS.map((p) => toItemXml(p, BASE_URL)).join("\n");

  // RSS 2.0 with atom self-link (best practice)
  const rssSelfHref = `${BASE_URL}/rss.xml`;
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_NAME)} — Blog</title>
    <link>${BASE_URL}</link>
    <atom:link href="${rssSelfHref}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(SITE_DESC)}</description>
    <language>${SITE_LOCALE}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>KonceptID RSS builder</generator>
${itemsXml
  .split("\n")
  .map((l) => "    " + l)
  .join("\n")}
  </channel>
</rss>
`;

  const outDir = path.resolve(process.cwd(), "public");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "rss.xml"), rssXml, "utf8");
  await writeFile(path.join(outDir, "feed.xml"), rssXml, "utf8"); // menținem aliasul feed.xml

  // eslint-disable-next-line no-console
  console.log(
    `[RSS] Generated ${POSTS.length} item(s) → public/rss.xml & public/feed.xml (base: ${BASE_URL})`,
  );
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
