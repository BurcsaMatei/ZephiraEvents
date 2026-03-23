// pages/api/admin/login.ts
// POST — verifică credențiale admin, setează cookie httpOnly admin_session.

import type { NextApiRequest, NextApiResponse } from "next";

import {
  COOKIE_NAME,
  generateSessionToken,
  SESSION_MAX_AGE_LONG,
  SESSION_MAX_AGE_SHORT,
  verifyCredentials,
} from "../../../lib/admin/auth";
import type { ErrResp } from "../../../lib/admin/response";
import { errorResponse, okResponse } from "../../../lib/admin/response";

// ──────────────────────────────────────────────────────────
// Rate limiting — in-memory, per IP
// ──────────────────────────────────────────────────────────
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minute
const RATE_MAX_FAILS = 5;

const _failedAttempts = new Map<string, { count: number; since: number }>();

function getClientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return (fwd.split(",")[0] ?? fwd).trim();
  return req.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const entry = _failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.since > RATE_WINDOW_MS) {
    _failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= RATE_MAX_FAILS;
}

function recordFailure(ip: string): void {
  const entry = _failedAttempts.get(ip);
  if (!entry || Date.now() - entry.since > RATE_WINDOW_MS) {
    _failedAttempts.set(ip, { count: 1, since: Date.now() });
  } else {
    entry.count++;
  }
}

function clearFailures(ip: string): void {
  _failedAttempts.delete(ip);
}

// ──────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────
type Ok = { ok: true };
type Resp = Ok | ErrResp;

export default function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res.status(429).json(errorResponse("Prea multe încercări. Încearcă din nou în 15 minute."));
  }

  const body = req.body as { email?: unknown; password?: unknown; rememberMe?: unknown };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rememberMe = Boolean(body.rememberMe) === true;

  if (!verifyCredentials(email, password)) {
    recordFailure(ip);
    return res.status(401).json(errorResponse("Email sau parolă incorecte."));
  }

  clearFailures(ip);

  const token = generateSessionToken();
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = rememberMe ? SESSION_MAX_AGE_LONG : SESSION_MAX_AGE_SHORT;

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${isProd ? "; Secure" : ""}`,
  );

  return res.status(200).json(okResponse());
}
