// lib/gallery/schema.ts

// ==============================
// Imports
// ==============================
import { z } from "zod";

// ==============================
// Helpers
// ==============================
const isAbsoluteHttpUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};
// /foo.jpg, ./foo.jpg, ../foo.jpg (nu //foo)
const isRelativePath = (s: string) => /^\/(?!\/)|^\.\.?\/.*/.test(s);
const isValidImgSrc = (s: string) => isAbsoluteHttpUrl(s) || isRelativePath(s);

// ==============================
// Schema
// ==============================
export const GalleryItemSchema = z
  .object({
    /** ID intern stabil (ex: slug sau uuid) */
    id: z.string().trim().min(1),
    /** Sursa imaginii (URL absolut http(s) sau path relativ) */
    src: z.string().trim().refine(isValidImgSrc, {
      message: "src trebuie să fie URL http(s) sau cale relativă.",
    }),
    /** Text alternativ accesibilitate */
    alt: z.string().trim().min(1).max(200).optional(),
    /** Dimensiuni opționale (pt. layout) */
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    /** Thumbnail/fallback opțional (relativ sau absolut) */
    thumb: z.string().trim().refine(isValidImgSrc, { message: "thumb invalid." }).optional(),
    /** Tag-uri opționale (filtrare) */
    tags: z.array(z.string().trim().min(1)).optional(),
    /** Caption opțional (HTML simplu sau text) */
    caption: z.string().trim().optional(),
  })
  .strict();

export const GalleryItemListSchema = z.array(GalleryItemSchema).superRefine((items, ctx) => {
  const byId = new Set<string>();
  const bySrc = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it) continue;
    if (byId.has(it.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `ID duplicat: ${it.id}`,
        path: [i, "id"],
      });
    }
    if (bySrc.has(it.src)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `SRC duplicat: ${it.src}`,
        path: [i, "src"],
      });
    }
    byId.add(it.id);
    bySrc.add(it.src);
  }
});

// ==============================
// Types
// ==============================
export type GalleryItem = z.infer<typeof GalleryItemSchema>;
export type GalleryItemList = ReadonlyArray<GalleryItem>;

// ==============================
// Helpers de validare/normalizare (opțional)
// ==============================
export function parseGalleryItems(raw: unknown): GalleryItem[] {
  const arr = Array.isArray(raw) ? raw : [];

  // normalizăm în obiecte „safe” înainte de validare
  const normalized: Array<Record<string, unknown>> = arr.map((it) => {
    if (it && typeof it === "object") {
      const rec = it as Record<string, unknown>;
      const out: Record<string, unknown> = { ...rec };

      const tags = rec["tags"];
      if (Array.isArray(tags)) {
        out["tags"] = tags.map((t) => String(t).trim().toLowerCase());
      }
      return out;
    }
    // elemente non-obiect -> obiect gol, va pica la schema dacă e invalid
    return {};
  });

  return GalleryItemListSchema.parse(normalized);
}
