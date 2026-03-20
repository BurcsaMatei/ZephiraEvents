// scripts/optimise-images.mjs
//
// Optimizează imaginile JPEG/PNG din directoarele de conținut
// și suprascrie originalele cu versiuni comprimate.
//
// Backup: public/images/_originals/ — structură identică.
// Dacă backup-ul există deja, fișierul e sărit (re-run safe).
//
// Rulare: node scripts/optimise-images.mjs
//         npm run optimise:images

// ==============================
// Imports
// ==============================
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import sharp from "sharp";

// ==============================
// Constante
// ==============================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_BASE = path.join(ROOT, "public", "images");
const ORIGINALS_BASE = path.join(IMAGES_BASE, "_originals");

/**
 * TASKS — directoare de procesat.
 * type: "jpeg" | "png"
 * quality: pentru JPEG (1–100). Ignorat pentru PNG.
 * exclude: fișiere de sărit (nume exact, case-sensitive).
 */
const TASKS = [
  { rel: "public/images/current", type: "jpeg", quality: 70 },
  { rel: "public/images/gallery", type: "jpeg", quality: 70 },
  { rel: "public/images/gallery/tent", type: "jpeg", quality: 70 },
  { rel: "public/images/blog", type: "jpeg", quality: 70, exclude: ["placeholder.jpg"] },
  { rel: "public/images/servicii/meniu", type: "jpeg", quality: 70 },
  { rel: "public/images/motivationcards", type: "jpeg", quality: 70 },
];

const JPEG_EXTS = new Set([".jpg", ".jpeg"]);
const PNG_EXTS = new Set([".png"]);

// ==============================
// Helpers
// ==============================
function fmtBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function pctChange(before, after) {
  if (before === 0) return "0.0";
  return (((before - after) / before) * 100).toFixed(1);
}

// ==============================
// Core: procesar un director
// ==============================
async function processDir({ rel, type, quality, exclude = [] }) {
  const absDir = path.join(ROOT, rel);
  const validExts = type === "jpeg" ? JPEG_EXTS : PNG_EXTS;

  // Citim directorul (shallow — fără recursie, subdirectoarele sunt listate separat)
  let entries;
  try {
    entries = await fs.readdir(absDir);
  } catch {
    console.warn(`  [WARN] Director negăsit: ${rel}`);
    return { processed: 0, skipped: 0, before: 0, after: 0 };
  }

  const files = entries.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return validExts.has(ext) && !exclude.includes(f);
  });

  if (files.length === 0) {
    console.log("  (niciun fișier de procesat)");
    return { processed: 0, skipped: 0, before: 0, after: 0 };
  }

  let processed = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const srcPath = path.join(absDir, file);

    // Calea backup oglindește structura sub _originals/
    const relToImages = path.relative(IMAGES_BASE, srcPath);
    const backupPath = path.join(ORIGINALS_BASE, relToImages);

    // Verificăm dacă backup-ul există → fișier deja procesat, sărim
    try {
      await fs.access(backupPath);
      console.log(`  [SKIP] ${file} — backup există`);
      skipped++;
      continue;
    } catch {
      // backup nu există → continuăm
    }

    // Dimensiunea originală
    const statBefore = await fs.stat(srcPath);
    const before = statBefore.size;

    // Backup înainte de suprascris
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(srcPath, backupPath);

    // Optimizare cu sharp — scriem în fișier temporar, apoi rename
    // (evită lock-ul Windows când sharp citește și scrie același fișier)
    const tmpPath = srcPath + ".opt.tmp";
    try {
      if (type === "jpeg") {
        await sharp(srcPath).jpeg({ quality, mozjpeg: true }).toFile(tmpPath);
      } else {
        await sharp(srcPath).png({ compressionLevel: 9 }).toFile(tmpPath);
      }
      await fs.rename(tmpPath, srcPath);
    } catch (err) {
      // Curățăm temporarul dacă există
      try {
        await fs.unlink(tmpPath);
      } catch {
        /* ignore */
      }
      // Restaurăm backup-ul și continuăm
      await fs.copyFile(backupPath, srcPath);
      console.error(`  [ERR] ${file}: ${err.message}`);
      continue;
    }

    const after = (await fs.stat(srcPath)).size;
    const pct = pctChange(before, after);
    const sign = after <= before ? "-" : "+";
    const name = file.padEnd(32);

    console.log(
      `  ✓ ${name} ${fmtBytes(before).padStart(9)} → ${fmtBytes(after).padStart(9)}  (${sign}${Math.abs(Number(pct))}%)`,
    );

    totalBefore += before;
    totalAfter += after;
    processed++;
  }

  return { processed, skipped, before: totalBefore, after: totalAfter };
}

// ==============================
// Entry point
// ==============================
async function main() {
  console.log("════════════════════════════════════════════════════════════");
  console.log("  ZephiraEvents — Image Optimiser");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`  Backup:  public/images/_originals/`);
  console.log(`  Re-run:  fișierele cu backup sunt sărite automat`);
  console.log("════════════════════════════════════════════════════════════\n");

  let grandProcessed = 0;
  let grandSkipped = 0;
  let grandBefore = 0;
  let grandAfter = 0;

  for (const task of TASKS) {
    const label = task.quality != null ? ` (JPEG q${task.quality})` : " (PNG)";
    console.log(`\n📁 ${task.rel}${label}`);
    const result = await processDir(task);
    grandProcessed += result.processed;
    grandSkipped += result.skipped;
    grandBefore += result.before;
    grandAfter += result.after;
  }

  const totalReduction = grandBefore - grandAfter;
  const totalPct = pctChange(grandBefore, grandAfter);

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  Fișiere procesate : ${grandProcessed}`);
  console.log(`  Fișiere sărite    : ${grandSkipped}`);
  console.log(`  Dimensiune înainte: ${fmtBytes(grandBefore)}`);
  console.log(`  Dimensiune după   : ${fmtBytes(grandAfter)}`);
  console.log(`  Reducere totală   : ${fmtBytes(totalReduction)} (-${totalPct}%)`);
  console.log("════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
