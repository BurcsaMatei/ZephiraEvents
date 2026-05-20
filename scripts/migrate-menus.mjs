// scripts/migrate-menus.mjs
// One-time migration: data/menus.json → data/menus/<slug>.json (local fs, no GitHub API)
// Run: node scripts/migrate-menus.mjs

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const srcPath = resolve(__dirname, "../data/menus.json");
const destDir = resolve(__dirname, "../data/menus");

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

const raw = JSON.parse(readFileSync(srcPath, "utf8"));

let created = 0;
let skipped = 0;

for (const menu of raw) {
  const destFile = join(destDir, `${menu.slug}.json`);

  if (existsSync(destFile)) {
    console.log(`  skip  ${menu.slug}.json (already exists)`);
    skipped++;
    continue;
  }

  // Standardize felPrincipal → string[]
  const felPrincipal = Array.isArray(menu.sections.felPrincipal)
    ? menu.sections.felPrincipal
    : menu.sections.felPrincipal.trim() !== ""
      ? [menu.sections.felPrincipal]
      : [];

  const output = {
    slug: menu.slug,
    title: menu.title,
    pricePerPers: menu.pricePerPers,
    currency: menu.currency,
    image: menu.image,
    imageAlt: menu.imageAlt,
    ...(menu.images ? { images: menu.images } : {}),
    eventType: menu.eventType,
    deleted: false,
    sections: {
      starterRece: menu.sections.starterRece,
      antreuCald: menu.sections.antreuCald,
      felIntermediar: menu.sections.felIntermediar,
      felPrincipal,
      pachetBar: menu.sections.pachetBar,
    },
  };

  writeFileSync(destFile, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`  create ${menu.slug}.json`);
  created++;
}

console.log(`\nDone: ${created} created, ${skipped} skipped.`);
