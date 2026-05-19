// pages/api/admin/messages/[id].ts
// GET — detaliu mesaj din data/messages/, marchează read: true.
// PATCH { action: "delete" } — soft delete (deleted: true în fișier).

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, listFiles, updateFile } from "../../../../lib/admin/github";
import { errorResponse } from "../../../../lib/admin/response";
import type { MessageJson } from "./index";

async function findMessageFile(id: string): Promise<{ path: string; sha: string; msg: MessageJson } | null> {
  const entries = await listFiles("data/messages");
  const entry = entries.find((e) => e.name === `${id}.json`);
  if (!entry) return null;
  const { content, sha } = await getFile(entry.path);
  const msg = JSON.parse(content) as MessageJson;
  return { path: entry.path, sha, msg };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json(errorResponse("ID invalid."));
  }

  // ── GET ──────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const found = await findMessageFile(id);
      if (!found) return res.status(404).json(errorResponse("Mesaj negăsit."));

      const { path, sha, msg } = found;

      if (!msg.read) {
        const updated = { ...msg, read: true };
        await updateFile(path, JSON.stringify(updated, null, 2), sha);
        return res.status(200).json({ ok: true, data: updated });
      }

      return res.status(200).json({ ok: true, data: msg });
    } catch (err) {
      console.error("[admin/messages/[id]] GET error:", err);
      return res.status(500).json(errorResponse("Eroare la citirea mesajului."));
    }
  }

  // ── PATCH ─────────────────────────────────────────────────
  if (req.method === "PATCH") {
    const body = req.body as { action?: unknown };

    if (body.action !== "delete") {
      return res.status(400).json(errorResponse("Acțiune invalidă."));
    }

    try {
      const found = await findMessageFile(id);
      if (!found) return res.status(404).json(errorResponse("Mesaj negăsit."));

      const { path, sha, msg } = found;
      const updated = { ...msg, deleted: true };
      await updateFile(path, JSON.stringify(updated, null, 2), sha);
      return res.status(200).json({ ok: true, data: updated });
    } catch (err) {
      console.error("[admin/messages/[id]] PATCH error:", err);
      return res.status(500).json(errorResponse("Eroare la ștergerea mesajului."));
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json(errorResponse("Method Not Allowed"));
}
