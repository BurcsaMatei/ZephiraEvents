// pages/api/admin/logout.ts
// POST — șterge cookie-ul de sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";

import { COOKIE_NAME } from "../../../lib/admin/auth";
import { okResponse } from "../../../lib/admin/response";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Accept GET și POST pentru ușurința utilizării din link-uri
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,
  );
  return res.status(200).json(okResponse());
}
