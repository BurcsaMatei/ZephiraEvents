// pages/api/review-submit.ts
// ==============================
// Preia recenzia nouă și o trimite pe email ca notificare.
// Zero storage — recenzia se publică manual în data/reviews.json.
// ==============================

import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { z } from "zod";

// Permitem payload mai mare pentru foto base64 (max ~7MB cu header JSON)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

const schema = z.object({
  name: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(2000),
  honeypot: z.string().optional(),
  photoBase64: z.string().optional(),
  photoMime: z.string().optional(),
  photoFilename: z.string().optional(),
});

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]!,
  );
}

function getIp(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  return (xf.split(",")[0] || req.socket.remoteAddress || "0.0.0.0").trim();
}

const rateStore = new Map<string, number[]>();
const RATE_MAX = 3;
const RATE_WINDOW_MS = 3_600_000; // 1h

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = rateStore.get(ip) ?? [];
  const recent = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) return true;
  recent.push(now);
  rateStore.set(ip, recent);
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ ok: false, message: "Prea multe solicitări. Încearcă mai târziu." });
  }

  // Honeypot
  const rawBody = req.body as Record<string, unknown>;
  if (typeof rawBody?.honeypot === "string" && rawBody.honeypot.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ");
    return res.status(400).json({ ok: false, message: msg });
  }

  const { name, rating, text, photoBase64, photoMime, photoFilename } = parsed.data;

  const to = (process.env.CONTACT_TO_EMAIL || "").trim();
  const from = (process.env.CONTACT_FROM_EMAIL || "").trim();
  const smtpHost = (process.env.SMTP_HOST || "").trim();
  const smtpUser = (process.env.SMTP_USER || "").trim();

  if (!to || !from || !smtpHost || !smtpUser) {
    return res.status(500).json({ ok: false, message: "Configurare email incompletă." });
  }

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const ts = new Date().toISOString();
  const subject = `Recenzie nouă — ${name} — ${stars} — ${ts}`;

  const plain =
    `Recenzie nouă de publicat pe zephiraevents.ro\n\n` +
    `Nume: ${name}\n` +
    `Rating: ${rating}/5 ${stars}\n` +
    `Text:\n${text}\n\n` +
    `Data trimiterii: ${ts}\n` +
    `IP: ${ip}\n`;

  const html =
    `<h2>Recenzie nouă de publicat</h2>` +
    `<p><strong>Nume:</strong> ${escapeHtml(name)}</p>` +
    `<p><strong>Rating:</strong> ${rating}/5 ${stars}</p>` +
    `<p><strong>Text:</strong></p>` +
    `<pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f5;padding:12px;border-radius:4px">${escapeHtml(text)}</pre>` +
    `<hr/>` +
    `<p style="color:#888;font-size:12px">Trimis la ${ts} de la IP ${escapeHtml(ip)}</p>` +
    `<p style="color:#888;font-size:12px">Publică manual în <code>data/reviews.json</code> după verificare.</p>`;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: smtpUser, pass: process.env.SMTP_PASS! },
    authMethod: "LOGIN",
    tls: { servername: smtpHost, minVersion: "TLSv1.2" },
  });

  const attachments: nodemailer.SendMailOptions["attachments"] =
    photoBase64 && photoMime
      ? [
          {
            filename: photoFilename ?? "photo.jpg",
            content: Buffer.from(photoBase64, "base64"),
            contentType: photoMime,
          },
        ]
      : [];

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text: plain,
      html,
      attachments,
    });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, message: "Eroare la trimiterea emailului." });
  }
}
