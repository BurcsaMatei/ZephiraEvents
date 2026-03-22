// pages/api/admin/logout.ts
// POST — șterge cookie-ul de sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";

import { COOKIE_NAME } from "../../../lib/admin/auth";

type Resp = { ok: true };

export default function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  // Accept GET și POST pentru ușurința utilizării din link-uri
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,
  );
  return res.status(200).json({ ok: true });
}
