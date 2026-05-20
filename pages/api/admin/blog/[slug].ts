// pages/api/admin/blog/[slug].ts
// GET   — detaliu articol (fs, include deleted)
// PATCH — editare câmpuri | { action: "delete" } | { action: "restore" } | upload cover

import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, updateFile, uploadImage } from "../../../../lib/admin/github";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import { buildMarkdownFile, getPostBySlugAdmin } from "../../../../lib/blog.server";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  const slug = Array.isArray(req.query["slug"]) ? req.query["slug"][0] : req.query["slug"];
  if (!slug) return res.status(400).json(errorResponse("Slug lipsă."));

  const filePath = `data/blog/${slug}.md`;

  if (req.method === "GET") {
    const post = getPostBySlugAdmin(slug);
    if (!post) return res.status(404).json(errorResponse("Articol negăsit."));
    return res.status(200).json(okResponse(post));
  }

  if (req.method === "PATCH") {
    try {
      const { content: rawFile, sha } = await getFile(filePath);
      const body = req.body as Record<string, unknown>;

      // ── Soft delete ──────────────────────────────────────
      if (body["action"] === "delete") {
        const post = getPostBySlugAdmin(slug);
        if (!post) return res.status(404).json(errorResponse("Articol negăsit."));
        const updated = buildMarkdownFile({
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          ...(post.coverImage ? { coverImage: post.coverImage } : {}),
          ...(post.author ? { author: post.author } : {}),
          ...(post.tags ? { tags: post.tags } : {}),
          ...(post.readingTime ? { readingTime: post.readingTime } : {}),
          ...(post.draft !== undefined ? { draft: post.draft } : {}),
          deleted: true,
          content: extractBody(rawFile),
        });
        await updateFile(filePath, updated, sha);
        return res.status(200).json(okResponse({ slug, deleted: true }));
      }

      // ── Restore ──────────────────────────────────────────
      if (body["action"] === "restore") {
        const post = getPostBySlugAdmin(slug);
        if (!post) return res.status(404).json(errorResponse("Articol negăsit."));
        const updated = buildMarkdownFile({
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          ...(post.coverImage ? { coverImage: post.coverImage } : {}),
          ...(post.author ? { author: post.author } : {}),
          ...(post.tags ? { tags: post.tags } : {}),
          ...(post.readingTime ? { readingTime: post.readingTime } : {}),
          ...(post.draft !== undefined ? { draft: post.draft } : {}),
          deleted: false,
          content: extractBody(rawFile),
        });
        await updateFile(filePath, updated, sha);
        return res.status(200).json(okResponse({ slug, deleted: false }));
      }

      // ── Upload cover ─────────────────────────────────────
      if (body["action"] === "uploadCover") {
        const b64 = body["photoBase64"];
        const mime = body["photoMime"];
        if (typeof b64 !== "string" || typeof mime !== "string" || !mime.startsWith("image/")) {
          return res.status(400).json(errorResponse("Date imagine invalide."));
        }
        const inputBuf = Buffer.from(b64, "base64");
        const webpBuf = await sharp(inputBuf)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
        const imagePath = `public/images/blog/cover-${slug}.webp`;
        await uploadImage(imagePath, webpBuf.toString("base64"));
        const coverImage = `/images/blog/cover-${slug}.webp`;

        const post = getPostBySlugAdmin(slug);
        if (!post) return res.status(404).json(errorResponse("Articol negăsit."));
        const { sha: sha2 } = await getFile(filePath);
        const updated = buildMarkdownFile({
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          coverImage,
          ...(post.author ? { author: post.author } : {}),
          ...(post.tags ? { tags: post.tags } : {}),
          ...(post.readingTime ? { readingTime: post.readingTime } : {}),
          ...(post.draft !== undefined ? { draft: post.draft } : {}),
          deleted: post.deleted === true,
          content: extractBody(rawFile),
        });
        await updateFile(filePath, updated, sha2);
        return res.status(200).json(okResponse({ coverImage }));
      }

      // ── Editare câmpuri ──────────────────────────────────
      const post = getPostBySlugAdmin(slug);
      if (!post) return res.status(404).json(errorResponse("Articol negăsit."));

      const tags = Array.isArray(body["tags"])
        ? (body["tags"] as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : typeof body["tags"] === "string"
        ? body["tags"].split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : post.tags;

      const updated = buildMarkdownFile({
        title: typeof body["title"] === "string" && body["title"].trim() ? body["title"].trim() : post.title,
        date: typeof body["date"] === "string" && body["date"] ? body["date"] : post.date,
        excerpt: typeof body["excerpt"] === "string" ? body["excerpt"].trim() : post.excerpt,
        ...(typeof body["coverImage"] === "string" && body["coverImage"]
          ? { coverImage: body["coverImage"] }
          : post.coverImage ? { coverImage: post.coverImage } : {}),
        ...(typeof body["author"] === "string" && body["author"]
          ? { author: body["author"].trim() }
          : post.author ? { author: post.author } : {}),
        ...(tags && tags.length > 0 ? { tags } : {}),
        ...(typeof body["readingTime"] === "string" && body["readingTime"]
          ? { readingTime: body["readingTime"].trim() }
          : post.readingTime ? { readingTime: post.readingTime } : {}),
        ...(post.draft !== undefined ? { draft: post.draft } : {}),
        deleted: post.deleted === true,
        content: typeof body["content"] === "string" ? body["content"] : extractBody(rawFile),
      });

      await updateFile(filePath, updated, sha);
      return res.status(200).json(okResponse({ slug }));
    } catch (err) {
      console.error("[admin/blog/slug] patch error:", err);
      return res.status(500).json(errorResponse("Eroare la actualizarea articolului."));
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json(errorResponse("Method Not Allowed"));
}

// Extrage body-ul fișierului .md după frontmatter (după al doilea ---)
function extractBody(raw: string): string {
  const parts = raw.split(/^---\s*$/m);
  // parts[0] = "" (înainte de primul ---), parts[1] = frontmatter, parts[2+] = body
  if (parts.length >= 3) {
    return parts.slice(2).join("---").trim();
  }
  return raw.trim();
}
