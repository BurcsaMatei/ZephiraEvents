// pages/api/admin/menus/[slug].ts
// GET   — detaliu meniu
// PATCH — editare câmpuri | { action: "delete" } soft delete | upload imagine

import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, updateFile, uploadImage } from "../../../../lib/admin/github";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import { getMenuBySlug } from "../../../../lib/menus.server";
import type { Menu } from "../../../../types/menu";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  const slug = Array.isArray(req.query["slug"]) ? req.query["slug"][0] : req.query["slug"];
  if (!slug) return res.status(400).json(errorResponse("Slug lipsă."));

  const filePath = `data/menus/${slug}.json`;

  if (req.method === "GET") {
    // Admin poate vedea și meniurile soft-deleted — citim raw de pe disk
    const menu = getMenuBySlug(slug, { includeDeleted: true });
    if (!menu) return res.status(404).json(errorResponse("Meniu negăsit."));
    return res.status(200).json(okResponse(menu));
  }

  if (req.method === "PATCH") {
    try {
      const { content, sha } = await getFile(filePath);
      const current = JSON.parse(content) as Menu;
      const body = req.body as Record<string, unknown>;

      // ── Soft delete ───────────────────────────────────────
      if (body["action"] === "delete") {
        const updated: Menu = { ...current, deleted: true };
        await updateFile(filePath, JSON.stringify(updated, null, 2) + "\n", sha);
        return res.status(200).json(okResponse(updated));
      }

      // ── Upload imagine ────────────────────────────────────
      if (body["action"] === "uploadImage") {
        const b64 = body["photoBase64"];
        const mime = body["photoMime"];
        if (typeof b64 !== "string" || typeof mime !== "string" || !mime.startsWith("image/")) {
          return res.status(400).json(errorResponse("Date imagine invalide."));
        }
        const inputBuf = Buffer.from(b64, "base64");
        const webpBuf = await sharp(inputBuf).resize(1200, null, { withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
        const imagePath = `public/images/servicii/meniu/${slug}.webp`;
        await uploadImage(imagePath, webpBuf.toString("base64"));
        const imageUrl = `/images/servicii/meniu/${slug}.webp`;
        const updated: Menu = { ...current, image: imageUrl };
        const { sha: sha2 } = await getFile(filePath);
        await updateFile(filePath, JSON.stringify(updated, null, 2) + "\n", sha2);
        return res.status(200).json(okResponse({ imageUrl }));
      }

      // ── Editare câmpuri ───────────────────────────────────
      const updated: Menu = {
        ...current,
        title: typeof body["title"] === "string" ? body["title"].trim() : current.title,
        pricePerPers:
          typeof body["pricePerPers"] === "number"
            ? body["pricePerPers"]
            : current.pricePerPers,
        currency:
          typeof body["currency"] === "string" ? body["currency"].trim() : current.currency,
        imageAlt:
          typeof body["imageAlt"] === "string" ? body["imageAlt"].trim() : current.imageAlt,
        eventType:
          typeof body["eventType"] === "string"
            ? (body["eventType"] as Menu["eventType"])
            : current.eventType,
        sections: {
          starterRece: Array.isArray(body["starterRece"])
            ? (body["starterRece"] as string[]).filter(Boolean)
            : current.sections.starterRece,
          antreuCald:
            typeof body["antreuCald"] === "string"
              ? body["antreuCald"].trim()
              : current.sections.antreuCald,
          felIntermediar:
            typeof body["felIntermediar"] === "string"
              ? body["felIntermediar"].trim()
              : current.sections.felIntermediar,
          felPrincipal: Array.isArray(body["felPrincipal"])
            ? (body["felPrincipal"] as string[]).filter(Boolean)
            : current.sections.felPrincipal,
          pachetBar: Array.isArray(body["pachetBar"])
            ? (body["pachetBar"] as string[]).filter(Boolean)
            : current.sections.pachetBar,
        },
      };

      await updateFile(filePath, JSON.stringify(updated, null, 2) + "\n", sha);
      return res.status(200).json(okResponse(updated));
    } catch (err) {
      console.error("[admin/menus/slug] patch error:", err);
      return res.status(500).json(errorResponse("Eroare la actualizarea meniului."));
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json(errorResponse("Method Not Allowed"));
}
