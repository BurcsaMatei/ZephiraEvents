// pages/api/review-submit.ts

import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import { z } from "zod";

import { createFile, uploadImage } from "../../lib/admin/github";

type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB

const schema = z.object({
  name: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(2000),
  honeypot: z.string().optional(),
  photoBase64: z.string().optional(),
  photoMime: z.string().optional(),
  photoFilename: z.string().optional(),
});

function getIp(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  return (xf.split(",")[0] || req.socket.remoteAddress || "0.0.0.0").trim();
}

const rateStore = new Map<string, number[]>();
const RATE_MAX = 3;
const RATE_WINDOW_MS = 3_600_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = rateStore.get(ip) ?? [];
  const recent = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) return true;
  recent.push(now);
  rateStore.set(ip, recent);
  return false;
}

function nanoid8(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, message: "Prea multe solicitări. Încearcă mai târziu." });
  }

  const rawBody = req.body as Record<string, unknown>;
  if (typeof rawBody?.honeypot === "string" && rawBody.honeypot.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ");
    return res.status(400).json({ ok: false, message: msg });
  }

  const { name, rating, text, photoBase64, photoMime } = parsed.data;

  const now = new Date().toISOString();
  const ts = Date.now();
  const id = `review-${ts}-${nanoid8()}`;
  const filePath = `data/reviews/${id}.json`;

  let profilePhotoUrl: string | undefined;

  if (photoBase64) {
    if (!photoMime?.startsWith("image/")) {
      return res.status(400).json({ ok: false, message: "Fișierul trebuie să fie o imagine." });
    }
    const rawBytes = Buffer.from(photoBase64, "base64");
    if (rawBytes.byteLength > MAX_PHOTO_BYTES) {
      return res.status(400).json({ ok: false, message: "Imaginea depășește 2MB." });
    }
    try {
      const webpBuffer = await sharp(rawBytes)
        .resize(400, 400, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      const webpBase64 = webpBuffer.toString("base64");
      const imagePath = `public/images/profiles/profile-${id}.webp`;
      await uploadImage(imagePath, webpBase64);
      profilePhotoUrl = `/images/profiles/profile-${id}.webp`;
    } catch (err) {
      console.error("[review-submit] sharp/upload error:", err);
      return res.status(500).json({ ok: false, message: "Eroare la procesarea imaginii." });
    }
  }

  const reviewData: Record<string, unknown> = {
    id,
    name,
    rating,
    text,
    status: "pending",
    createdAt: now,
  };
  if (profilePhotoUrl) reviewData.profilePhotoUrl = profilePhotoUrl;

  const payload = JSON.stringify(reviewData, null, 2);

  try {
    await createFile(filePath, payload);
  } catch (err) {
    console.error("[review-submit] GitHub createFile error:", err);
    return res.status(500).json({ ok: false, message: "Eroare la salvarea recenziei." });
  }

  return res.status(200).json({ ok: true });
}
