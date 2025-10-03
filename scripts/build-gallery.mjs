// scripts/build-gallery.mjs
import crypto from "node:crypto";
import fssync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const GALLERY_DIR = path.join(PUBLIC_DIR, "images", "gallery");
const OUT_TS = path.join(ROOT, "lib", "gallery.data.ts");
const OUT_JSON = path.join(ROOT, "data", "gallery.json");
const CAPTIONS_JSON = path.join(ROOT, "data", "galleryCaptions.json");

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

// Title-case minimal din numele fișierului
function toTitle(s) {
  const base = s
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\d+$/, "") // taie sufixe numerice gen g-001
    .trim();
  const pretty = base.replace(/\b\w/g, (m) => m.toUpperCase());
  return pretty && pretty.length > 1 ? pretty : "Galerie";
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walk(abs)));
    } else {
      const ext = path.extname(ent.name).toLowerCase();
      if (!IMG_EXT.has(ext)) continue;
      out.push(abs);
    }
  }
  return out;
}

async function loadCaptionsIndex() {
  if (!fssync.existsSync(CAPTIONS_JSON)) return null;
  try {
    const raw = await fs.readFile(CAPTIONS_JSON, "utf8");
    const data = JSON.parse(raw);

    // Acceptăm:
    // 1) Array<{ id?, src?, filename?, alt?, caption? }>
    // 2) Record<string, { alt?, caption?, src?, filename? }>
    const list = Array.isArray(data)
      ? data
      : Object.entries(data).map(([key, v]) => ({ ...(v || {}), id: v?.id ?? key }));

    const byId = new Map();
    const bySrc = new Map();
    const byBase = new Map();

    for (const entry of list) {
      const rec = {
        alt: entry.alt,
        caption: entry.caption,
      };
      if (entry.id) byId.set(String(entry.id), rec);
      if (entry.src) {
        const normSrc = String(entry.src).replace(/\\/g, "/");
        bySrc.set(normSrc.startsWith("/") ? normSrc : `/${normSrc}`, rec);
      }
      const filename = entry.filename ?? entry.file ?? null;
      if (filename) byBase.set(String(filename).toLowerCase(), rec);
    }

    return { byId, bySrc, byBase };
  } catch (err) {
    console.warn("⚠️  Nu am putut parsa data/galleryCaptions.json:", err.message);
    return null;
  }
}

function hashId(src) {
  return crypto.createHash("sha1").update(src).digest("hex").slice(0, 10);
}

(async () => {
  try {
    await fs.mkdir(GALLERY_DIR, { recursive: true });

    const files = await walk(GALLERY_DIR);
    files.sort((a, b) => a.localeCompare(b)); // determinist

    const captionsIndex = await loadCaptionsIndex();

    const items = files.map((abs) => {
      const relFromPublic = path.relative(PUBLIC_DIR, abs).replace(/\\/g, "/"); // normalizează pe '/'
      const src = `/${relFromPublic}`;
      const base = path.basename(abs); // ex: g-001.jpg
      const baseNoExt = path.basename(abs, path.extname(abs)).toLowerCase();

      const id = hashId(src);
      let alt = toTitle(baseNoExt);
      let caption = alt;

      if (captionsIndex) {
        const override =
          captionsIndex.byId.get(id) ||
          captionsIndex.bySrc.get(src) ||
          captionsIndex.byBase.get(base) ||
          captionsIndex.byBase.get(baseNoExt);

        if (override) {
          if (override.alt) alt = override.alt;
          if (override.caption) caption = override.caption;
          else caption = alt; // fallback coerent
        }
      }
      return { id, src, alt, caption };
    });

    // Elimină eventuale duplicate după src (sau id) – ține primul
    const seen = new Set();
    const deduped = [];
    for (const it of items) {
      const key = it.src; // suficient
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(it);
    }

    // Scriere TS
    const header =
      `/* --------------\n` +
      ` * GENERATED FILE — DO NOT EDIT.\n` +
      ` * Run: npm run gallery:build\n` +
      ` * -------------- */\n\n`;
    const bodyTs = `export const GALLERY_DATA = ${JSON.stringify(deduped, null, 2)} as const;\n`;

    await fs.mkdir(path.dirname(OUT_TS), { recursive: true });
    await fs.writeFile(OUT_TS, header + bodyTs, "utf8");

    // Scriere JSON
    await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
    await fs.writeFile(OUT_JSON, JSON.stringify(deduped, null, 2), "utf8");

    console.log(
      `✅ Generated ${path.relative(ROOT, OUT_TS)} and ${path.relative(ROOT, OUT_JSON)} with ${deduped.length} items.`,
    );
  } catch (err) {
    console.error("❌ Gallery build failed:", err);
    process.exit(1);
  }
})();
