// scripts/optimise-images.mjs
//
// Utilitar SELECTIV — nu e pas obligatoriu de build.
// Rulează manual când adaugi un asset WebP nou și vrei să-l re-comprimi.
//
// Input : fișiere .webp existente din public/images/ (excl. excepțiile de mai jos)
// Output: re-compresie WebP în același fișier (suprascris)
// Backup: public/images/_originals/ — structură identică, re-run safe (skip dacă backup există)
//
// Excepții (nu se procesează):
//   og*.jpg          — OG images, rămân JPG
//   public/icons/    — PWA icons, rămân PNG
//   public/screenshots/ — PWA screenshots, rămân PNG
//   favicon*.png / favicon.png — favicon, rămân PNG
//   logo-dedicat.png — JSON-LD logo, rămâne PNG
//
// Rulare: node scripts/optimise-images.mjs
//         npm run optimise:images

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_BASE = path.join(ROOT, "public", "images");
const ORIGINALS_BASE = path.join(IMAGES_BASE, "_originals");

// Directoare excluse complet
const EXCLUDED_DIRS = [
  path.join(ROOT, "public", "icons"),
  path.join(ROOT, "public", "screenshots"),
];

// Calitate WebP per director (mai sus = mai bun detaliu, mai jos = fișier mai mic)
const QUALITY_MAP = [
  { dir: "servicii/meniu", quality: 85 },
  { dir: "servicii/servicii", quality: 90 }, // detalii fine (PNG origine)
  { dir: "current", quality: 85 },
  { dir: "gallery", quality: 82 },
  { dir: "blog", quality: 82 },
  { dir: "motivationcards", quality: 80 },
  { dir: "profiles", quality: 80 },
];

function qualityFor(relPath) {
  for (const { dir, quality } of QUALITY_MAP) {
    if (relPath.includes(`/${dir}/`) || relPath.includes(`\\${dir}\\`)) return quality;
  }
  return 82; // default
}

function isExcluded(filePath) {
  for (const dir of EXCLUDED_DIRS) {
    if (filePath.startsWith(dir + path.sep)) return true;
  }
  const base = path.basename(filePath);
  if (/^og.*\.jpg$/i.test(base)) return true;
  if (/^favicon.*\.(png|jpg)$/i.test(base)) return true;
  if (base === "logo-dedicat.png") return true;
  return false;
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "_originals") {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function fmtBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  console.log("════════════════════════════════════════════════════════════");
  console.log("  ZephiraEvents — WebP Re-compressor (utilitar selectiv)");
  console.log("════════════════════════════════════════════════════════════");
  console.log("  Input : fișiere .webp din public/images/");
  console.log("  Backup: public/images/_originals/ (re-run safe)");
  console.log("════════════════════════════════════════════════════════════\n");

  let processed = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for await (const filePath of walk(IMAGES_BASE)) {
    if (isExcluded(filePath)) continue;
    if (path.extname(filePath).toLowerCase() !== ".webp") continue;

    const relToImages = path.relative(IMAGES_BASE, filePath);
    const backupPath = path.join(ORIGINALS_BASE, relToImages);

    // Re-run safe: sari dacă backup există
    try {
      await fs.access(backupPath);
      console.log(`  [SKIP] ${relToImages} — backup există`);
      skipped++;
      continue;
    } catch {
      // ok, continuăm
    }

    const before = (await fs.stat(filePath)).size;
    const quality = qualityFor(filePath);

    // Backup
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(filePath, backupPath);

    const tmpPath = filePath + ".opt.tmp";
    try {
      await sharp(filePath).webp({ quality }).toFile(tmpPath);
      await fs.rename(tmpPath, filePath);
    } catch (err) {
      try { await fs.unlink(tmpPath); } catch { /* ignore */ }
      await fs.copyFile(backupPath, filePath);
      console.error(`  [ERR] ${relToImages}: ${err.message}`);
      continue;
    }

    const after = (await fs.stat(filePath)).size;
    const pct = before > 0 ? ((before - after) / before * 100).toFixed(1) : "0.0";
    const sign = after <= before ? "-" : "+";
    console.log(`  ✓ ${relToImages.padEnd(50)} q${quality}  ${fmtBytes(before)} → ${fmtBytes(after)}  (${sign}${Math.abs(Number(pct))}%)`);

    totalBefore += before;
    totalAfter += after;
    processed++;
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  Procesate : ${processed}   Sărite: ${skipped}`);
  if (processed > 0) {
    const saved = totalBefore - totalAfter;
    console.log(`  Înainte   : ${fmtBytes(totalBefore)}`);
    console.log(`  După      : ${fmtBytes(totalAfter)}`);
    console.log(`  Economisit: ${fmtBytes(Math.abs(saved))} (${saved >= 0 ? "-" : "+"}${Math.abs(Number(((Math.abs(saved) / totalBefore) * 100).toFixed(1)))}%)`);
  }
  console.log("════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
