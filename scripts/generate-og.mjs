// scripts/generate-og.mjs
// ==============================
// Generează OG images (1200×630 JPEG) și PWA screenshots (PNG)
// cu Puppeteer din serverul local Next.js.
//
// Prerequisit: `npm run dev` (sau `npm run preview`) rulează pe BASE_URL.
// Rulare: node scripts/generate-og.mjs
// ==============================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BASE_URL = process.env.OG_BASE_URL || "http://localhost:3000";

// ──────────────────────────────────────────────
// OG Images — 1200×630, JPEG q95
// ──────────────────────────────────────────────
const OG_PAGES = [
  { route: "/", out: "public/images/og.jpg" },
  { route: "/servicii", out: "public/images/og-servicii.jpg" },
  { route: "/galerie", out: "public/images/og-galerie.jpg" },
  { route: "/contact", out: "public/images/og-contact.jpg" },
  { route: "/blog", out: "public/images/og-blog.jpg" },
  { route: "/cort-evenimente-la-locatia-ta", out: "public/images/og-cort.jpg" },
  { route: "/reviews", out: "public/images/og-reviews.jpg" },
];

// ──────────────────────────────────────────────
// PWA Screenshots
// ──────────────────────────────────────────────
const PWA_SCREENSHOTS = [
  {
    url: "/",
    out: "public/screenshots/home-portrait.png",
    width: 1080,
    height: 1920,
    label: "home-portrait (1080×1920)",
  },
  {
    url: "/",
    out: "public/screenshots/home-landscape.png",
    width: 1920,
    height: 1080,
    label: "home-landscape (1920×1080)",
  },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitForPage(page, url, options = {}) {
  await page.goto(url, {
    waitUntil: options.waitUntil ?? "networkidle0",
    timeout: options.timeout ?? 30_000,
  });
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  generate-og — server: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // ── OG Images ──────────────────────────────
    console.log("── OG Images (1200×630 JPEG) ─────────────────");
    const ogPage = await browser.newPage();
    await ogPage.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

    for (const { route, out } of OG_PAGES) {
      const url = `${BASE_URL}/api/og?p=${encodeURIComponent(route)}`;
      const outAbs = path.resolve(ROOT, out);
      ensureDir(outAbs);

      await waitForPage(ogPage, url, {
        // /api/og e un Edge endpoint — networkidle2 e suficient, nu așteptăm assets
        waitUntil: "networkidle2",
        timeout: 20_000,
      });

      await ogPage.screenshot({ path: outAbs, type: "jpeg", quality: 95 });
      console.log(`  ✓  ${route.padEnd(40)} → ${out}`);
    }

    await ogPage.close();

    // ── PWA Screenshots ────────────────────────
    console.log("\n── PWA Screenshots (PNG) ─────────────────────");
    for (const { url, out, width, height, label } of PWA_SCREENSHOTS) {
      const fullUrl = `${BASE_URL}${url}`;
      const outAbs = path.resolve(ROOT, out);
      ensureDir(outAbs);

      const screenshotPage = await browser.newPage();
      await screenshotPage.setViewport({ width, height, deviceScaleFactor: 1 });

      await waitForPage(screenshotPage, fullUrl, {
        waitUntil: "networkidle0",
        timeout: 45_000,
      });

      // Scurtă pauză pentru animații CSS care rulează la load
      await new Promise((r) => setTimeout(r, 800));

      await screenshotPage.screenshot({ path: outAbs, type: "png" });
      await screenshotPage.close();

      console.log(`  ✓  ${label.padEnd(40)} → ${out}`);
    }
  } finally {
    await browser.close();
    console.log("\n✅  Done. Browser închis.\n");
  }
}

main().catch((err) => {
  console.error("\n❌  Eroare:", err.message);
  process.exit(1);
});
