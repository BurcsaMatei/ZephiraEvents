// pages/api/admin/login.ts
// POST — verifică credențiale admin, setează cookie httpOnly admin_session.

import type { NextApiRequest, NextApiResponse } from "next";

import {
  COOKIE_NAME,
  generateSessionToken,
  SESSION_MAX_AGE,
  verifyCredentials,
} from "../../../lib/admin/auth";

type Ok = { ok: true };
type Fail = { ok: false; message: string };
type Resp = Ok | Fail;

export default function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const body = req.body as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyCredentials(email, password)) {
    return res.status(401).json({ ok: false, message: "Email sau parolă incorecte." });
  }

  const token = generateSessionToken();
  const isProd = process.env.NODE_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}${isProd ? "; Secure" : ""}`,
  );

  return res.status(200).json({ ok: true });
}
