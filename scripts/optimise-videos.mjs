// scripts/optimise-videos.mjs
//
// Utilitar SELECTIV — nu e pas obligatoriu de build.
// Rulează manual când adaugi un MP4 nou și vrei să-l re-comprimi înainte de commit.
//
// Input : fișier MP4 specificat ca argument CLI (sau toate MP4-urile din public/videos/)
// Output: fișier MP4 recomprimat cu libx264, CRF 28, preset slow, fără audio
// Backup: public/videos/_originals/ — structură identică, re-run safe (skip dacă backup există)
//
// Video-urile din repo sunt MP4 (H.264) — format nativ ales după conversia WebM eșuată
// (VP9 CRF 32 produce fișiere mai mari decât H.264 CRF 28 pe conținut deja comprimat).
//
// Rulare:
//   node scripts/optimise-videos.mjs                          # toate MP4 din public/videos/
//   node scripts/optimise-videos.mjs public/videos/tent/01.mp4  # un singur fișier
//   npm run optimise:videos

import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const VIDEOS_BASE = path.join(ROOT, "public", "videos");
const ORIGINALS_BASE = path.join(VIDEOS_BASE, "_originals");

// Profil per director
function profileFor(filePath) {
  if (filePath.includes(`${path.sep}tent${path.sep}`)) {
    // Tent gallery: re-scalate la 854×480
    return {
      args: ["-c:v", "libx264", "-crf", "28", "-vf", "scale=854:480", "-preset", "slow", "-an", "-movflags", "+faststart", "-y"],
      label: "CRF 28, scale 854×480",
    };
  }
  // Hero/banner: fără scale
  return {
    args: ["-c:v", "libx264", "-crf", "28", "-preset", "slow", "-an", "-movflags", "+faststart", "-y"],
    label: "CRF 28, fără scale",
  };
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "_originals") {
      yield* walk(full);
    } else if (entry.isFile() && full.toLowerCase().endsWith(".mp4")) {
      yield full;
    }
  }
}

function fmtBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function processFile(filePath) {
  const relToVideos = path.relative(VIDEOS_BASE, filePath);
  const backupPath = path.join(ORIGINALS_BASE, relToVideos);

  try {
    await fs.access(backupPath);
    console.log(`  [SKIP] ${relToVideos} — backup există`);
    return { processed: 0, skipped: 1, before: 0, after: 0 };
  } catch { /* ok */ }

  const before = (await fs.stat(filePath)).size;
  const { args, label } = profileFor(filePath);

  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);

  const tmpPath = filePath + ".tmp.mp4";
  try {
    await execFileAsync("ffmpeg", ["-i", filePath, ...args, tmpPath]);
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    try { await fs.unlink(tmpPath); } catch { /* ignore */ }
    await fs.copyFile(backupPath, filePath);
    console.error(`  [ERR] ${relToVideos}: ${err.message?.split("\n")[0] ?? err}`);
    return { processed: 0, skipped: 0, before: 0, after: 0 };
  }

  const after = (await fs.stat(filePath)).size;
  const pct = ((before - after) / before * 100).toFixed(1);
  const sign = after <= before ? "-" : "+";
  console.log(`  ✓ ${relToVideos.padEnd(48)} [${label}]  ${fmtBytes(before)} → ${fmtBytes(after)}  (${sign}${Math.abs(Number(pct))}%)`);
  return { processed: 1, skipped: 0, before, after };
}

async function main() {
  const arg = process.argv[2];

  console.log("════════════════════════════════════════════════════════════");
  console.log("  ZephiraEvents — Video Re-compressor (utilitar selectiv)");
  console.log("════════════════════════════════════════════════════════════");
  console.log("  Format  : MP4 (H.264, libx264)");
  console.log("  Backup  : public/videos/_originals/ (re-run safe)");
  console.log("════════════════════════════════════════════════════════════\n");

  try {
    await execFileAsync("ffmpeg", ["-version"]);
  } catch {
    console.error("  [EROARE] ffmpeg nu a fost găsit în PATH.");
    process.exit(1);
  }

  const targets = [];
  if (arg) {
    const abs = path.resolve(ROOT, arg);
    targets.push(abs);
  } else {
    for await (const f of walk(VIDEOS_BASE)) targets.push(f);
  }

  if (targets.length === 0) {
    console.log("  Niciun fișier MP4 găsit.");
    return;
  }

  let grandProcessed = 0, grandSkipped = 0, grandBefore = 0, grandAfter = 0;

  for (const t of targets) {
    const r = await processFile(t);
    grandProcessed += r.processed;
    grandSkipped += r.skipped;
    grandBefore += r.before;
    grandAfter += r.after;
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  Procesate : ${grandProcessed}   Sărite: ${grandSkipped}`);
  if (grandProcessed > 0) {
    const saved = grandBefore - grandAfter;
    console.log(`  Înainte   : ${fmtBytes(grandBefore)}`);
    console.log(`  După      : ${fmtBytes(grandAfter)}`);
    console.log(`  Economisit: ${fmtBytes(Math.abs(saved))} (${saved >= 0 ? "-" : "+"}${Math.abs(Number(((Math.abs(saved) / grandBefore) * 100).toFixed(1)))}%)`);
  }
  console.log("════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
