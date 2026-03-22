// pages/api/contact.ts

// ==============================
// Imports
// ==============================
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

import { supabaseAdmin } from "../../lib/admin/supabase";
import { contactSchema } from "../../lib/validation/contact";

type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

type EmailProvider = "resend" | "smtp";

const RATE_LIMIT = parseRateLimit(process.env.CONTACT_RATE_LIMIT || "5:600"); // 5 req / 600s
const rateStore = new Map<string, number[]>();

// ==============================
// Utils
// ==============================
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

function provider(): EmailProvider | null {
  if ((process.env.RESEND_API_KEY || "").trim()) return "resend";
  if ((process.env.SMTP_HOST || "").trim() && (process.env.SMTP_USER || "").trim()) return "smtp";
  return null;
}

function subjectLine(): string {
  const ts = new Date().toISOString();
  return `Mesaj contact — zephiraevents.ro — ${ts}`;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]!,
  );
}

// ==============================
// Email senders (adapters)
// ==============================
async function sendWithResend(opts: {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY!;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      subject: opts.subject,
      reply_to: opts.replyTo,
      text: opts.text,
      html: opts.html,
    }),
  });
  if (!res.ok) throw new Error("Resend failed");
}

async function sendWithSmtp(opts: {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const secure = String(process.env.SMTP_SECURE || "true") === "true";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // 587 → false (STARTTLS), 465 → true (SSL)
    auth: { user, pass },
    authMethod: "LOGIN", // stabil pentru cPanel/Exim
    tls: { servername: host, minVersion: "TLSv1.2" },
  });

  await transporter.sendMail({
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    replyTo: opts.replyTo,
    text: opts.text,
    html: opts.html,
  });
}

// sendAutoReply ==============================

async function sendAutoReply(to: string, from: string, originalName: string) {
  if (String(process.env.CONTACT_AUTOREPLY_ENABLED || "0") !== "1") return;

  const subject = "Am primit mesajul tău — ZephiraEvents";
  const phone = "+40 769 990 800";
  const phoneHref = "tel:+40769990800";
  const waHref = "https://wa.me/40769990800";
  const emailHref = "mailto:info@zephiraevents.ro";
  const cookieHref = "https://zephiraevents.ro/cookie-policy";
  const address = "Calea Odobești 409, Câmpineanca, Vrancea, 627055, România";

  const text =
    `Salut, ${originalName}!\n\n` +
    `Îți mulțumim pentru mesaj.\n\n` +
    `Confirmăm că l-am primit și promitem sa revenim la tine în maxim 24–48h.\n\n` +
    `Dacă e urgent, ne găsești la numarul de telefon: ${phone}\n` +
    `sau ne poti scrie direct pe WhatsApp: ${waHref}\n\n` +
    `Cu drag,\nEchipa ZephiraEvents\n\n` +
    `Adresa: ${address}\n` +
    `info@zephiraevents.ro\n` +
    `https://zephiraevents.ro/cookie-policy\n`;

  const html =
    `<p>Salut, <strong>${escapeHtml(originalName)}</strong>!</p>` +
    `<p>Îți mulțumim pentru mesaj.</p>` +
    `<p>Confirmăm că l-am primit și promitem sa revenim la tine în maxim 24–48h.</p>` +
    `<p>Dacă e urgent, ne găsești la numarul de telefon: <a href="${phoneHref}">${escapeHtml(
      phone,
    )}</a><br/>` +
    `sau ne poti scrie direct pe WhatsApp: <a href="${waHref}">${waHref}</a></p>` +
    `<p>Cu drag,<br/>Echipa <strong>ZephiraEvents</strong></p>` +
    `<p><em>Adresa:</em> ${escapeHtml(address)}<br/>` +
    `<a href="${emailHref}">info@zephiraevents.ro</a><br/>` +
    `<a href="${cookieHref}">${cookieHref}</a></p>`;

  const prov = provider();
  const fromAddr = process.env.CONTACT_FROM_EMAIL!;
  if (prov === "resend") {
    await sendWithResend({ to, from: fromAddr, replyTo: fromAddr, subject, text, html });
  } else if (prov === "smtp") {
    await sendWithSmtp({ to, from: fromAddr, replyTo: fromAddr, subject, text, html });
  }
}
// sendAutoReply ==============================

// ==============================
// Handler
// ==============================
export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ ok: false, message: "Prea multe solicitări. Încearcă mai târziu." });
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

  const to = (process.env.CONTACT_TO_EMAIL || "").trim();
  const from = (process.env.CONTACT_FROM_EMAIL || "").trim();
  const prov = provider();

  if (!to || !from || !prov) {
    return res.status(500).json({ ok: false, message: "Configurare email incompletă." });
  }

  const subject = subjectLine();
  const plain =
    `De la: ${name} <${email}>\n` +
    (phone ? `Telefon: ${phone}\n` : "") +
    `Subiect: ${subject}\n\n${message}\n`;
  const html =
    `<p><strong>De la:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>` +
    (phone ? `<p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>` : "") +
    `<p><strong>Subiect:</strong> ${escapeHtml(subject)}</p>` +
    `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`;

  try {
    if (prov === "resend") {
      await sendWithResend({ to, from, replyTo: email, subject, text: plain, html });
    } else {
      await sendWithSmtp({ to, from, replyTo: email, subject, text: plain, html });
    }

    await sendAutoReply(email, from, name);
  } catch {
    return res.status(500).json({ ok: false, message: "Eroare la trimiterea emailului." });
  }

  // Salvează în Supabase — independent de email (nu blochează răspunsul dacă Supabase pică)
  try {
    await supabaseAdmin.from("messages").insert({
      type: "contact",
      name,
      email,
      phone: phone ?? null,
      message,
    });
  } catch {
    // silențios — emailul a ajuns, Supabase e non-critic
  }

  return res.status(200).json({ ok: true });
}
