// pages/api/reviews.ts
// ==============================
// API Reviews: GET latest; POST create; POST ?upload=1 => signed Blob URL
// ==============================

import type { NextApiRequest, NextApiResponse } from "next";

import { createReview, getLatestReviews, type Rating } from "../../lib/reviews";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

type GetQuery = {
  limit?: string;
};

type CreateBodyJSON = {
  authorName: string;
  rating: Rating | number | string;
  text: string;
  profilePhotoUrl?: string;
  photos?: string[];
  honeypot?: string;
};

type UploadBodyJSON = {
  filename: string;
  contentType: string;
  prefix?: string;
};

const inMemoryHits: Record<string, { n: number; t: number }> = {};
const RATE_WINDOW_MS = 60_000; // 1m
const RATE_MAX = 8;

function deny(msg: string, res: NextApiResponse, code = 400) {
  return res.status(code).json({ ok: false, error: msg });
}

function ipFromReq(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  const ip = xf.split(",")[0]?.trim() || (req.socket?.remoteAddress ?? "0");
  return ip;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Signed upload URL (no file parsing server-side)
  if (req.method === "POST" && req.query.upload === "1") {
    if (!BLOB_TOKEN) {
      return deny("Missing BLOB_READ_WRITE_TOKEN", res, 500);
    }
    const body = req.body as UploadBodyJSON;
    if (!body || typeof body.filename !== "string" || typeof body.contentType !== "string") {
      return deny("Invalid upload body", res);
    }
    const prefix = typeof body.prefix === "string" ? body.prefix : "reviews";
    const resp = await fetch("https://api.vercel.com/v2/blobs/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BLOB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mimeType: body.contentType,
        clientPayload: { filename: body.filename },
        addRandomSuffix: true,
        contentDisposition: "inline; filename=" + encodeURIComponent(`${prefix}-${body.filename}`),
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return deny(`Blob create failed: ${text}`, res, 500);
    }
    const data = (await resp.json()) as {
      url: string; // public URL after PUT
      uploadUrl: string; // pre-signed PUT URL
    };
    return res.status(200).json({ ok: true, ...data });
  }

  if (req.method === "GET") {
    const { limit } = (req.query as unknown as GetQuery) || {};
    const n = Math.max(1, Math.min(24, Number(limit) || 12));
    const items = await getLatestReviews(n);
    return res.status(200).json({ ok: true, items });
  }

  if (req.method === "POST") {
    // Honeypot anti-bot
    const body = req.body as CreateBodyJSON;
    if (typeof body?.honeypot === "string" && body.honeypot.trim() !== "") {
      return res.status(200).json({ ok: true, item: null });
    }

    // Rate limit by IP
    const ip = ipFromReq(req);
    const now = Date.now();
    const entry = inMemoryHits[ip] ?? { n: 0, t: now };
    if (now - entry.t > RATE_WINDOW_MS) {
      entry.n = 0;
      entry.t = now;
    }
    entry.n += 1;
    inMemoryHits[ip] = entry;
    if (entry.n > RATE_MAX) {
      return deny("Too many requests, please try again later.", res, 429);
    }

    // Validate
    const parsedRating = Number(body?.rating);
    if (
      !body ||
      typeof body.authorName !== "string" ||
      typeof body.text !== "string" ||
      ![1, 2, 3, 4, 5].includes(parsedRating)
    ) {
      return deny("Invalid payload", res);
    }

    // Photos (max 4) — nu setăm undefined explicit
    const photosClean =
      Array.isArray(body.photos) && body.photos.length ? body.photos.slice(0, 4) : null;

    // Construim payload-ul fără a seta proprietăți cu `undefined`
    const base = {
      authorName: body.authorName,
      rating: parsedRating as Rating,
      text: body.text,
    } as const;

    const withAvatar =
      typeof body.profilePhotoUrl === "string" && body.profilePhotoUrl.length > 0
        ? { profilePhotoUrl: body.profilePhotoUrl }
        : {};

    const withPhotos = photosClean ? { photos: photosClean } : {};

    const payload = {
      ...base,
      ...withAvatar,
      ...withPhotos,
    };

    const created = await createReview(payload);

    return res.status(200).json({ ok: true, item: created });
  }

  res.setHeader("Allow", "GET, POST");
  return deny("Method not allowed", res, 405);
}
