// scripts/build-menus-index.mjs
// Prebuild: citește data/menus/*.json și generează data/menus-index.json
// cu câmpuri minimale pentru client-side (menus.public.ts).

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const menusDir = resolve(__dirname, "../data/menus");
const outFile = resolve(__dirname, "../data/menus-index.json");

const files = readdirSync(menusDir).filter(
  (f) => f.endsWith(".json") && f !== ".gitkeep",
);

const index = [];

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(menusDir, file), "utf8"));
  if (raw.deleted === true) continue;
  index.push({
    slug: raw.slug,
    title: raw.title,
    eventType: raw.eventType,
  });
}

writeFileSync(outFile, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(`[build-menus-index] ${index.length} meniuri → data/menus-index.json`);
