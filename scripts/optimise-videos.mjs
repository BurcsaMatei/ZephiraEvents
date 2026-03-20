// scripts/optimise-videos.mjs
//
// Recomprimă toate MP4-urile din public/videos/ cu ffmpeg.
//
// Profile:
//   A — Hero/banner (public/videos/current/) : CRF 30, fără scale, preset slow
//   B — Tent gallery (public/videos/tent/)   : CRF 30, scale 854×480, preset slow
//
// Audio       : eliminat (-an) — video-uri de fundal, fără sunet
// Faststart   : -movflags +faststart (streaming web-friendly)
//
// Backup: public/videos/_originals/ — structură identică.
// Dacă backup-ul există deja → [SKIP] automat (re-run safe).
//
// Rulare: node scripts/optimise-videos.mjs
//         npm run optimise:videos

// ==============================
// Imports
// ==============================
import { execFile } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);

// ==============================
// Constante
// ==============================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const VIDEOS_BASE = path.join(ROOT, "public", "videos");
const ORIGINALS_BASE = path.join(VIDEOS_BASE, "_originals");

/**
 * TASKS — directoare de procesat cu profilul corespunzător.
 * profile: "A" | "B"
 * rel: calea relativă față de ROOT
 */
const TASKS = [
  { rel: "public/videos/current", profile: "A" },
  { rel: "public/videos/tent", profile: "B" },
];

/**
 * Argumente ffmpeg per profil.
 * Profil A — Hero/banner: CRF 30, fără scale, preset slow
 * Profil B — Tent gallery: CRF 30, scale 854×480, preset slow
 */
const FFMPEG_ARGS = {
  A: ["-c:v", "libx264", "-crf", "32", "-preset", "slow", "-an", "-movflags", "+faststart", "-y"],
  B: [
    "-c:v",
    "libx264",
    "-crf",
    "32",
    "-vf",
    "scale=854:480",
    "-preset",
    "slow",
    "-an",
    "-movflags",
    "+faststart",
    "-y",
  ],
};

const PROFILE_LABEL = {
  A: "CRF 30, fără scale (hero/banner)",
  B: "CRF 30, scale 854×480 (tent gallery)",
};

// ==============================
// Helpers
// ==============================
function fmtBytes(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function pctChange(before, after) {
  if (before === 0) return "0.0";
  return (((before - after) / before) * 100).toFixed(1);
}

// ==============================
// Verificare ffmpeg în PATH
// ==============================
async function checkFfmpeg() {
  const cmd = os.platform() === "win32" ? "ffmpeg.exe" : "ffmpeg";
  try {
    await execFileAsync(cmd, ["-version"]);
    return cmd;
  } catch {
    // Încearcă ffmpeg fără extensie (cross-platform fallback)
    try {
      await execFileAsync("ffmpeg", ["-version"]);
      return "ffmpeg";
    } catch {
      return null;
    }
  }
}

// ==============================
// Core: procesare un director
// ==============================
async function processDir(relDir, profile, ffmpegCmd) {
  const absDir = path.join(ROOT, relDir);
  const args = FFMPEG_ARGS[profile];

  let entries;
  try {
    entries = await fs.readdir(absDir);
  } catch {
    console.warn(`  [WARN] Director negăsit: ${relDir}`);
    return { processed: 0, skipped: 0, before: 0, after: 0 };
  }

  const files = entries.filter((f) => f.toLowerCase().endsWith(".mp4"));

  if (files.length === 0) {
    console.log("  (niciun fișier .mp4 găsit)");
    return { processed: 0, skipped: 0, before: 0, after: 0 };
  }

  let processed = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const srcPath = path.join(absDir, file);

    // Calea backup oglindește structura sub _originals/
    const relToVideos = path.relative(VIDEOS_BASE, srcPath);
    const backupPath = path.join(ORIGINALS_BASE, relToVideos);

    // Dacă backup există → fișier deja procesat, sărim
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

    // ffmpeg scrie în fișier temporar, apoi îl mutăm (evită corupere dacă se întrerupe)
    const tmpPath = srcPath + ".tmp.mp4";

    try {
      await execFileAsync(ffmpegCmd, ["-i", srcPath, ...args, tmpPath]);

      // Înlocuim originalul cu fișierul optimizat
      await fs.rename(tmpPath, srcPath);
    } catch (err) {
      // Curățăm temporarul dacă există
      try {
        await fs.unlink(tmpPath);
      } catch {
        /* ignore */
      }
      // Restaurăm backup-ul
      await fs.copyFile(backupPath, srcPath);
      console.error(`  [ERR] ${file}: ${err.message?.split("\n")[0] ?? err}`);
      continue;
    }

    const statAfter = await fs.stat(srcPath);
    const after = statAfter.size;
    const pct = pctChange(before, after);
    const sign = after <= before ? "-" : "+";
    const name = file.padEnd(36);

    console.log(
      `  ✓ [Profil ${profile}] ${name} ${fmtBytes(before).padStart(9)} → ${fmtBytes(after).padStart(9)}  (${sign}${Math.abs(Number(pct))}%)`,
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
  console.log("  ZephiraEvents — Video Optimiser");
  console.log("════════════════════════════════════════════════════════════");
  console.log("  Profil A : CRF 30, fără scale     → public/videos/current/");
  console.log("  Profil B : CRF 30, scale 854×480  → public/videos/tent/");
  console.log("  Audio    : eliminat (-an)");
  console.log("  Web      : -movflags +faststart");
  console.log(`  Backup   : public/videos/_originals/`);
  console.log(`  Re-run   : fișierele cu backup sunt sărite automat`);
  console.log("════════════════════════════════════════════════════════════\n");

  // Verificare ffmpeg
  process.stdout.write("  Verificare ffmpeg... ");
  const ffmpegCmd = await checkFfmpeg();
  if (!ffmpegCmd) {
    console.error(
      "\n\n  [EROARE] ffmpeg nu a fost găsit în PATH.\n" +
        "  Instalează ffmpeg și asigură-te că e accesibil din terminal:\n" +
        "    Windows : https://www.gyan.dev/ffmpeg/builds/  (adaugă bin/ la PATH)\n" +
        "    macOS   : brew install ffmpeg\n" +
        "    Linux   : sudo apt install ffmpeg\n",
    );
    process.exit(1);
  }
  console.log(`OK (${ffmpegCmd})\n`);

  let grandProcessed = 0;
  let grandSkipped = 0;
  let grandBefore = 0;
  let grandAfter = 0;

  for (const { rel, profile } of TASKS) {
    console.log(`\n📁 ${rel}  [Profil ${profile} — ${PROFILE_LABEL[profile]}]`);
    const result = await processDir(rel, profile, ffmpegCmd);
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
