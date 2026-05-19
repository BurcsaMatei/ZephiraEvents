// pages/api/offer-request.ts

import type { NextApiRequest, NextApiResponse } from "next";

import { createFile } from "../../lib/admin/github";
import { offerRequestSchema } from "../../lib/validation/offerRequest";

type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

interface RateCfg {
  max: number;
  windowSec: number;
}

const RATE_LIMIT = parseRate(process.env.OFFER_RATE_LIMIT || "3:3600");
const rlStore = new Map<string, number[]>();

function parseRate(v: string): RateCfg {
  const [a, b] = v.split(":");
  const max = Math.max(1, Number(a || 3));
  const windowSec = Math.max(60, Number(b || 3600));
  return { max, windowSec };
}

function clientIp(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  return (xf.split(",")[0] || req.socket.remoteAddress || "0.0.0.0").trim();
}

function isLimited(ip: string): boolean {
  const now = Date.now();
  const win = RATE_LIMIT.windowSec * 1000;
  const arr = rlStore.get(ip) || [];
  const recent = arr.filter((t) => now - t < win);
  if (recent.length >= RATE_LIMIT.max) return true;
  recent.push(now);
  rlStore.set(ip, recent);
  return false;
}

async function verifyRecaptcha(token: string, ip: string): Promise<boolean> {
  const secret = (process.env.RECAPTCHA_SECRET_KEY || "").trim();
  if (!secret) return false;
  const params = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = (await res.json()) as { success?: boolean };
  return !!data?.success;
}

function nanoid8(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const ip = clientIp(req);
  if (isLimited(ip)) {
    return res.status(429).json({ ok: false, message: "Prea multe solicitări. Încearcă mai târziu." });
  }

  const body = req.body as unknown;
  const result = offerRequestSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(" ");
    return res.status(400).json({ ok: false, message });
  }
  const data = result.data;

  const recOk = await verifyRecaptcha(data.recaptchaToken, ip);
  if (!recOk) {
    return res.status(400).json({ ok: false, message: "Verificarea reCAPTCHA a eșuat." });
  }

  const now = new Date().toISOString();
  const ts = Date.now();
  const id = `offer-${ts}-${nanoid8()}`;
  const filePath = `data/messages/${id}.json`;

  const payload = JSON.stringify(
    {
      id,
      type: "offer",
      name: data.name,
      email: data.email,
      phone: data.phone,
      eventType: data.eventType,
      eventDate: data.eventDate,
      guests: data.participants,
      address: data.address,
      whatsapp: data.whatsapp,
      details: data.details || "",
      lodging: {
        kind: data.lodging.kind,
        rooms: data.lodging.rooms || "",
        nights: data.lodging.nights || "",
        notes: data.lodging.notes || "",
      },
      music: {
        kind: data.music.kind,
        prefs: data.music.prefs || "",
        genre: data.music.genre || "",
        interval: data.music.interval || "",
      },
      photoVideo: {
        kind: data.photoVideo.kind,
        package: data.photoVideo.package || "",
        duration: data.photoVideo.duration || "",
        deliverables: data.photoVideo.deliverables || "",
      },
      createdAt: now,
      read: false,
    },
    null,
    2,
  );

  try {
    await createFile(filePath, payload);
  } catch (err) {
    console.error("[offer-request] GitHub createFile error:", err);
    return res.status(500).json({ ok: false, message: "Eroare la salvarea solicitării." });
  }

  return res.status(200).json({ ok: true });
}
