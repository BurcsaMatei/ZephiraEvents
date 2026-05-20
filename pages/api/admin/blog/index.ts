// pages/api/admin/blog/index.ts
// GET  — lista articole (fs, include deleted)
// POST — creare articol nou via GitHub API

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { createFile } from "../../../../lib/admin/github";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import {
  buildMarkdownFile,
  getAllPostsAdmin,
  titleToSlug,
} from "../../../../lib/blog.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method === "GET") {
    try {
      const posts = getAllPostsAdmin();
      return res.status(200).json(okResponse(posts));
    } catch (err) {
      console.error("[admin/blog] list error:", err);
      return res.status(500).json(errorResponse("Eroare la citirea articolelor."));
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body as Record<string, unknown>;

      const title = typeof body["title"] === "string" ? body["title"].trim() : "";
      if (!title) return res.status(400).json(errorResponse("Titlul este obligatoriu."));

      const now = new Date().toISOString();
      const slug = titleToSlug(title);
      if (!slug) return res.status(400).json(errorResponse("Titlul nu generează un slug valid."));

      const tags = Array.isArray(body["tags"])
        ? (body["tags"] as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : typeof body["tags"] === "string"
        ? body["tags"].split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];

      const fileContent = buildMarkdownFile({
        title,
        date: typeof body["date"] === "string" && body["date"] ? body["date"] : now,
        excerpt: typeof body["excerpt"] === "string" ? body["excerpt"].trim() : "",
        ...(typeof body["coverImage"] === "string" && body["coverImage"] ? { coverImage: body["coverImage"] } : {}),
        ...(typeof body["author"] === "string" && body["author"] ? { author: body["author"].trim() } : {}),
        ...(tags.length > 0 ? { tags } : {}),
        ...(typeof body["readingTime"] === "string" && body["readingTime"] ? { readingTime: body["readingTime"].trim() } : {}),
        deleted: false,
        content: typeof body["content"] === "string" ? body["content"] : "",
      });

      const filePath = `data/blog/${slug}.md`;
      await createFile(filePath, fileContent);

      return res.status(201).json(okResponse({ slug }));
    } catch (err) {
      console.error("[admin/blog] create error:", err);
      return res.status(500).json(errorResponse("Eroare la crearea articolului."));
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json(errorResponse("Method Not Allowed"));
}
