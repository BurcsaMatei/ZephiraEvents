// pages/api/admin/messages/index.ts
// GET — lista mesajelor din data/messages/, sortate descrescător după createdAt.

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, listFiles } from "../../../../lib/admin/github";
import { errorResponse } from "../../../../lib/admin/response";

export interface MessageJson {
  id: string;
  type: "contact" | "offer";
  name: string;
  email: string;
  phone: string | null;
  message?: string;
  eventType?: string;
  eventDate?: string;
  guests?: number;
  createdAt: string;
  read: boolean;
  deleted?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  try {
    const entries = await listFiles("data/messages");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    const messages = await Promise.all(
      jsonFiles.map(async (entry) => {
        const { content } = await getFile(entry.path);
        return JSON.parse(content) as MessageJson;
      }),
    );

    const sorted = messages
      .filter((m) => !m.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ ok: true, data: sorted, total: sorted.length });
  } catch (err) {
    console.error("[admin/messages] list error:", err);
    return res.status(500).json(errorResponse("Eroare la citirea mesajelor."));
  }
}
