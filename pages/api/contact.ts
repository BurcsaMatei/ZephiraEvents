// pages/api/contact.ts

import type { NextApiRequest, NextApiResponse } from "next";

import { createFile } from "../../lib/admin/github";
import { contactSchema } from "../../lib/validation/contact";

type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

const RATE_LIMIT = parseRateLimit(process.env.CONTACT_RATE_LIMIT || "5:600");
const rateStore = new Map<string, number[]>();

function parseRateLimit(v: string): { max: number; windowSec: number } {
  const [maxStr, winStr] = v.split(":");
  const max = Math.max(1, Number(maxStr || 5));
  const windowSec = Math.max(30, Number(winStr || 600));
  return { max, windowSec };
}

function getIp(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  return (xf.split(",")[0] || req.socket.remoteAddress || "0.0.0.0").trim();
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

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const win = RATE_LIMIT.windowSec * 1000;
  const arr = rateStore.get(ip) || [];
  const recent = arr.filter((t) => now - t < win);
  if (recent.length >= RATE_LIMIT.max) return true;
  recent.push(now);
  rateStore.set(ip, recent);
  return false;
}

function nanoid8(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, message: "Prea multe solicitări. Încearcă mai târziu." });
  }

  const body = req.body as unknown;
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join(" ");
    return res.status(400).json({ ok: false, message: msg });
  }
  const { name, email, phone, message, recaptchaToken } = result.data;

  const recOk = await verifyRecaptcha(recaptchaToken, ip);
  if (!recOk) {
    return res.status(400).json({ ok: false, message: "Verificarea reCAPTCHA a eșuat." });
  }

  const now = new Date().toISOString();
  const ts = Date.now();
  const id = `contact-${ts}-${nanoid8()}`;
  const filePath = `data/messages/${id}.json`;

  const payload = JSON.stringify(
    {
      id,
      type: "contact",
      name,
      email,
      phone: phone || null,
      message,
      createdAt: now,
      read: false,
    },
    null,
    2,
  );

  try {
    await createFile(filePath, payload);
  } catch (err) {
    console.error("[contact] GitHub createFile error:", err);
    return res.status(500).json({ ok: false, message: "Eroare la salvarea mesajului." });
  }

  return res.status(200).json({ ok: true });
}
