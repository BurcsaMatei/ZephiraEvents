// pages/api/offer-request.ts
// ==============================
// Imports
// ==============================
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

import { buildOfferEmail, type EmailData } from "../../lib/mail/offerRequestEmail";
import { offerRequestSchema } from "../../lib/validation/offerRequest";

// ==============================
// Types
// ==============================
type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

type EmailProvider = "resend" | "smtp";

interface RateCfg {
  max: number;
  windowSec: number;
}

// ==============================
// Rate limit (in-memory)
// ==============================
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

// ==============================
// Email provider
// ==============================
function provider(): EmailProvider | null {
  if ((process.env.RESEND_API_KEY || "").trim()) return "resend";
  if ((process.env.SMTP_HOST || "").trim() && (process.env.SMTP_USER || "").trim()) return "smtp";
  return null;
}

async function sendWithResend(opts: {
  to: string[];
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  bcc?: string[];
}) {
  const apiKey = process.env.RESEND_API_KEY!;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: opts.from,
      to: opts.to,
      bcc: opts.bcc,
      subject: opts.subject,
      reply_to: opts.replyTo,
      text: opts.text,
      html: opts.html,
    }),
  });
  if (!res.ok) throw new Error("Resend failed");
}

async function sendWithSmtp(opts: {
  to: string[];
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  bcc?: string[];
}) {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const secure = String(process.env.SMTP_SECURE || "true") === "true";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // 587->false(STARTTLS), 465->true(SSL)
    auth: { user, pass },
    authMethod: "LOGIN",
    tls: { servername: host, minVersion: "TLSv1.2" },
  });

  await transporter.sendMail({
    from: opts.from,
    to: opts.to,
    bcc: opts.bcc,
    subject: opts.subject,
    replyTo: opts.replyTo,
    text: opts.text,
    html: opts.html,
  });
}

// ==============================
// reCAPTCHA verify
// ==============================
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

// ==============================
// Handler
// ==============================
export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const ip = clientIp(req);
  if (isLimited(ip)) {
    return res
      .status(429)
      .json({ ok: false, message: "Prea multe solicitări. Încearcă mai târziu." });
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

  const prov = provider();
  const from = (process.env.CONTACT_FROM_EMAIL || "").trim();
  const bcc = (process.env.OFFER_BCC_EMAIL || "").trim();
  if (!prov || !from) {
    return res.status(500).json({ ok: false, message: "Configurare email incompletă." });
  }

  // Build email (către utilizator, cu BCC intern) — normalizează sub-obiectele la câmpuri obligatorii
  const lodging: EmailData["lodging"] = {
    kind: data.lodging.kind || "proprie",
    rooms: data.lodging.rooms || "",
    nights: data.lodging.nights || "",
    notes: data.lodging.notes || "",
  };

  const music: EmailData["music"] = {
    kind: data.music.kind || "am-eu",
    prefs: data.music.prefs || "",
    genre: data.music.genre || "",
    interval: data.music.interval || "",
  };

  const photoVideo: EmailData["photoVideo"] = {
    kind: data.photoVideo.kind || "am-eu",
    package: data.photoVideo.package || "",
    duration: data.photoVideo.duration || "",
    deliverables: data.photoVideo.deliverables || "",
  };

  const emailData: EmailData = {
    name: data.name,
    address: data.address,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    eventDateYmd: data.eventDate,
    participants: data.participants,
    eventType: data.eventType,
    menu: data.menu, // slug-ul meniului, folosit pentru mapping în buildOfferEmail
    lodging,
    music,
    photoVideo,
    details: data.details || "",
  };

  const { subject, html, text } = buildOfferEmail(emailData);

  try {
    const base = {
      to: [data.email],
      from,
      replyTo: data.email,
      subject,
      text,
      html,
    };

    if (prov === "resend") {
      // IMPORTANT: cu exactOptionalPropertyTypes, omitem proprietatea când nu avem BCC
      if (bcc) {
        await sendWithResend({ ...base, bcc: [bcc] });
      } else {
        await sendWithResend(base);
      }
    } else {
      if (bcc) {
        await sendWithSmtp({ ...base, bcc: [bcc] });
      } else {
        await sendWithSmtp(base);
      }
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, message: "Eroare la trimiterea emailului." });
  }
}
