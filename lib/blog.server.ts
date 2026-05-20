// lib/blog.server.ts
// Server-only — citire articole din data/blog/*.md (fs + gray-matter + marked).
// Importă EXCLUSIV din getStaticProps / getServerSideProps sau API routes.

import fs from "fs";
import matter from "gray-matter";
import { marked } from "marked";
import path from "path";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  contentHtml: string;
  coverImage?: string;
  author?: string;
  modifiedDate?: string;
  tags?: string[];
  readingTime?: string;
  draft?: boolean;
};

export type BlogPostList = ReadonlyArray<BlogPost>;
export type BlogPostAdmin = BlogPost & { deleted?: boolean };

// ──────────────────────────────────────────────────────────
// Paths
// ──────────────────────────────────────────────────────────
function blogDir(): string {
  return path.join(process.cwd(), "data", "blog");
}

// ──────────────────────────────────────────────────────────
// HTML sanitizer (identic cu cel din blogData.ts)
// ──────────────────────────────────────────────────────────
function sanitizeBasic(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
    .replace(
      /<(\/?)h([1-5])(\b[^>]*)>/gi,
      (_, slash, level, rest) => `<${slash}h${Number(level) + 1}${rest}>`,
    );
}

// ──────────────────────────────────────────────────────────
// Parse one .md file → BlogPostAdmin | null
// ──────────────────────────────────────────────────────────
function parseFile(filePath: string): BlogPostAdmin | null {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const slug = path.basename(filePath, ".md");

    if (typeof data["title"] !== "string" || !data["title"]) return null;
    // gray-matter parses ISO dates as Date objects — normalize to string
    const rawDate = data["date"];
    if (!rawDate) return null;
    const dateStr = rawDate instanceof Date
      ? rawDate.toISOString()
      : typeof rawDate === "string" ? rawDate : String(rawDate);
    if (typeof data["excerpt"] !== "string" || !data["excerpt"]) return null;

    const htmlRaw = marked.parse(content) as string;
    const contentHtml = sanitizeBasic(htmlRaw);

    const post: BlogPostAdmin = {
      slug,
      title: String(data["title"]).trim(),
      date: dateStr.trim(),
      excerpt: String(data["excerpt"]).trim(),
      contentHtml,
    };

    if (typeof data["coverImage"] === "string" && data["coverImage"]) {
      post.coverImage = data["coverImage"];
    }
    if (typeof data["author"] === "string" && data["author"]) {
      post.author = data["author"];
    }
    if (typeof data["modifiedDate"] === "string" && data["modifiedDate"]) {
      post.modifiedDate = data["modifiedDate"];
    }
    if (Array.isArray(data["tags"])) {
      post.tags = (data["tags"] as unknown[])
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim().toLowerCase());
    }
    if (typeof data["readingTime"] === "string" && data["readingTime"]) {
      post.readingTime = data["readingTime"];
    }
    if (typeof data["draft"] === "boolean") {
      post.draft = data["draft"];
    }
    if (typeof data["deleted"] === "boolean") {
      post.deleted = data["deleted"];
    }

    return post;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// Read all posts from disk
// ──────────────────────────────────────────────────────────
function readAllFromDisk(): BlogPostAdmin[] {
  const dir = blogDir();
  let files: string[];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== ".gitkeep");
  } catch {
    return [];
  }
  const posts: BlogPostAdmin[] = [];
  for (const file of files) {
    const post = parseFile(path.join(dir, file));
    if (post) posts.push(post);
  }
  return posts;
}

function sortedByDate(posts: BlogPostAdmin[]): BlogPostAdmin[] {
  return posts.slice().sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

// ──────────────────────────────────────────────────────────
// Public API — same signatures as lib/blogData.ts
// ──────────────────────────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === "production";

export function getAllPosts(): BlogPostList {
  return sortedByDate(
    readAllFromDisk().filter((p) => p.deleted !== true && (!p.draft || !IS_PROD)),
  ).map(({ deleted, ...p }) => p as BlogPost);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const dir = blogDir();
  const post = parseFile(path.join(dir, `${slug}.md`));
  if (!post || post.deleted === true || (post.draft && IS_PROD)) return null;
  const { deleted, ...p } = post;
  return p as BlogPost;
}

export function getRecent(n: number): BlogPostList {
  return getAllPosts().slice(0, Math.max(0, n));
}

export function getPostsByTag(tag: string): BlogPostList {
  const q = tag.trim().toLowerCase();
  return getAllPosts().filter((p) => p.tags?.some((t) => t === q));
}

export function getAllTags(): readonly string[] {
  const set = new Set<string>();
  for (const p of getAllPosts()) {
    if (p.tags) for (const t of p.tags) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getRelatedByTags(slug: string, limit = 3): BlogPostList {
  const all = getAllPosts();
  const base = all.find((p) => p.slug === slug);
  if (!base || !base.tags || base.tags.length === 0) return [];
  const baseTags = new Set(base.tags);

  return all
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const overlap = p.tags?.reduce((acc, t) => acc + (baseTags.has(t) ? 1 : 0), 0) ?? 0;
      return { p, overlap };
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return Date.parse(b.p.date) - Date.parse(a.p.date);
    })
    .slice(0, Math.max(0, limit))
    .map(({ p }) => p);
}

// ──────────────────────────────────────────────────────────
// Admin API — include deleted
// ──────────────────────────────────────────────────────────
export function getAllPostsAdmin(): BlogPostAdmin[] {
  return sortedByDate(readAllFromDisk());
}

export function getPostBySlugAdmin(slug: string): BlogPostAdmin | null {
  return parseFile(path.join(blogDir(), `${slug}.md`));
}

// ──────────────────────────────────────────────────────────
// Helpers for admin write operations
// ──────────────────────────────────────────────────────────
export function buildMarkdownFile(post: {
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
  author?: string;
  tags?: string[];
  readingTime?: string;
  deleted?: boolean;
  draft?: boolean;
  content: string;
}): string {
  const lines: string[] = ["---"];
  lines.push(`title: ${yamlEscape(post.title)}`);
  lines.push(`date: ${post.date}`);
  lines.push(`excerpt: ${yamlEscape(post.excerpt)}`);
  if (post.coverImage) lines.push(`coverImage: ${post.coverImage}`);
  if (post.author) lines.push(`author: ${yamlEscape(post.author)}`);
  if (post.tags && post.tags.length > 0) {
    lines.push(`tags: [${post.tags.map((t) => yamlEscape(t)).join(", ")}]`);
  }
  if (post.readingTime) lines.push(`readingTime: ${yamlEscape(post.readingTime)}`);
  if (post.draft !== undefined) lines.push(`draft: ${post.draft}`);
  lines.push(`deleted: ${post.deleted === true ? "true" : "false"}`);
  lines.push("---");
  return `${lines.join("\n")}\n\n${post.content}\n`;
}

function yamlEscape(val: string): string {
  if (/[:#\[\]{},|>&*!'"\\]/.test(val) || val.includes("\n")) {
    return `"${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return val;
}

// ──────────────────────────────────────────────────────────
// Slug generator (admin create)
// ──────────────────────────────────────────────────────────
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ă/g, "a").replace(/â/g, "a").replace(/î/g, "i")
    .replace(/ș/g, "s").replace(/ț/g, "t")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
