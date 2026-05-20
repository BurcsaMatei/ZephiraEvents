// pages/api/admin/menus/index.ts
// GET  — listează toate meniurile din data/menus/ via GitHub API
// POST — creează meniu nou

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyAdminSession } from "../../../../lib/admin/auth";
import { createFile } from "../../../../lib/admin/github";
import { errorResponse, okResponse } from "../../../../lib/admin/response";
import { getAllMenusAdmin } from "../../../../lib/menus.server";
import type { Menu } from "../../../../types/menu";

function toKebab(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }

  if (req.method === "GET") {
    try {
      // Admin vede și meniurile șterse (soft delete)
      const menus = getAllMenusAdmin();
      const sorted = menus.sort((a, b) => a.slug.localeCompare(b.slug));
      return res.status(200).json(okResponse(sorted));
    } catch (err) {
      console.error("[admin/menus] list error:", err);
      return res.status(500).json(errorResponse("Eroare la citirea meniurilor."));
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body as Partial<Menu> & { slug?: string };

      if (!body.title?.trim()) {
        return res.status(400).json(errorResponse("Câmpul title este obligatoriu."));
      }
      if (!body.eventType) {
        return res.status(400).json(errorResponse("Câmpul eventType este obligatoriu."));
      }

      const slug = body.slug?.trim() || toKebab(body.title);
      if (!slug) {
        return res.status(400).json(errorResponse("Nu s-a putut genera slug-ul."));
      }

      const menu: Menu = {
        slug,
        title: body.title.trim(),
        pricePerPers: Number(body.pricePerPers) || 0,
        currency: body.currency?.trim() || "EUR",
        image: body.image?.trim() || "",
        imageAlt: body.imageAlt?.trim() || "",
        eventType: body.eventType,
        deleted: false,
        sections: {
          starterRece: Array.isArray(body.sections?.starterRece)
            ? body.sections.starterRece.filter(Boolean)
            : [],
          antreuCald: body.sections?.antreuCald?.trim() ?? "",
          felIntermediar: body.sections?.felIntermediar?.trim() ?? "",
          felPrincipal: Array.isArray(body.sections?.felPrincipal)
            ? body.sections.felPrincipal.filter(Boolean)
            : [],
          pachetBar: Array.isArray(body.sections?.pachetBar)
            ? body.sections.pachetBar.filter(Boolean)
            : [],
        },
      };

      await createFile(`data/menus/${slug}.json`, JSON.stringify(menu, null, 2) + "\n");
      return res.status(201).json(okResponse(menu));
    } catch (err) {
      console.error("[admin/menus] create error:", err);
      return res.status(500).json(errorResponse("Eroare la crearea meniului."));
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json(errorResponse("Method Not Allowed"));
}
