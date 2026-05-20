// scripts/migrate-menus.ts
// One-time migration: data/menus.json → data/menus/<slug>.json (local fs, no GitHub API)
// Run: npx ts-node --project tsconfig.json scripts/migrate-menus.ts

import * as fs from "fs";
import * as path from "path";

interface MenuSections {
  starterRece: string[];
  antreuCald: string;
  felIntermediar: string;
  felPrincipal: string | string[];
  pachetBar: string[];
}

interface RawMenu {
  slug: string;
  title: string;
  pricePerPers: number;
  currency: string;
  image: string;
  imageAlt: string;
  images?: string[];
  eventType: string;
  sections: MenuSections;
}

interface MenuJson extends Omit<RawMenu, "sections"> {
  deleted: boolean;
  sections: Omit<MenuSections, "felPrincipal"> & { felPrincipal: string[] };
}

const srcPath = path.resolve(__dirname, "../data/menus.json");
const destDir = path.resolve(__dirname, "../data/menus");

const raw: RawMenu[] = JSON.parse(fs.readFileSync(srcPath, "utf8")) as RawMenu[];

let created = 0;
let skipped = 0;

for (const menu of raw) {
  const destFile = path.join(destDir, `${menu.slug}.json`);

  if (fs.existsSync(destFile)) {
    console.log(`  skip  ${menu.slug}.json (already exists)`);
    skipped++;
    continue;
  }

  // Standardize felPrincipal → string[]
  const felPrincipal: string[] = Array.isArray(menu.sections.felPrincipal)
    ? menu.sections.felPrincipal
    : menu.sections.felPrincipal.trim() !== ""
      ? [menu.sections.felPrincipal]
      : [];

  const output: MenuJson = {
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

  fs.writeFileSync(destFile, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`  create ${menu.slug}.json`);
  created++;
}

console.log(`\nDone: ${created} created, ${skipped} skipped.`);
