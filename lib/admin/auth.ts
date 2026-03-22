// lib/admin/auth.ts
// Autentificare admin simplă bazată pe cookie httpOnly + HMAC.
// Folosit exclusiv în API routes — nu importa din componente client-side.

import crypto from "crypto";
import type { NextApiRequest } from "next";

// ──────────────────────────────────────────────────────────
// Constante
// ──────────────────────────────────────────────────────────
export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 8 * 3600; // 8 ore în secunde

// ──────────────────────────────────────────────────────────
// Token derivat din credențiale + secret
// Token-ul este stabil (nu expiră server-side) — expirarea e gestionată de cookie max-age.
// Schimbarea ADMIN_PASSWORD sau ADMIN_SESSION_SECRET invalidează toate sesiunile active.
// ──────────────────────────────────────────────────────────
function buildExpectedToken(): string {
  const email = process.env.ADMIN_EMAIL ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "fallback-insecure-please-change";
  return crypto
    .createHmac("sha256", secret)
    .update(`${email}:${password}`)
    .digest("hex");
}

export function generateSessionToken(): string {
  return buildExpectedToken();
}

// ──────────────────────────────────────────────────────────
// Verificare sesiune din cookie
// ──────────────────────────────────────────────────────────
function parseCookieValue(header: string, name: string): string | undefined {
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (key === name) return trimmed.slice(eqIdx + 1);
  }
  return undefined;
}

export function verifyAdminSession(req: NextApiRequest): boolean {
  const cookieHeader = req.headers.cookie ?? "";
  const token = parseCookieValue(cookieHeader, COOKIE_NAME);
  if (!token) return false;

  try {
    const expected = buildExpectedToken();
    const a = Buffer.from(token, "hex");
    const b = Buffer.from(expected, "hex");
    // timingSafeEqual necesită aceeași lungime
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────
// Verificare credențiale la login
// ──────────────────────────────────────────────────────────
export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPassword) return false;
  return email === adminEmail && password === adminPassword;
}
