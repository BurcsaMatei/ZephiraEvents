import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "by-file");

// Include directoarele pe care vrei să le documentezi
const INCLUDE_DIRS = [
  "components",
  "styles",
  "pages",
  "lib",
  "data",
  "interfaces",
  "types",
  "utils",
  "scripts",
  "src/assets",
];

// Excluderi (build/cache/media grele)
const EXCLUDE_REGEX =
  /(\/|\\)(node_modules|\.next|dist|build|coverage|\.git|docs)(\/|\\)|public(\/|\\)(images|icons)/i;

// Extensii acceptate
const EXT_REGEX = /\.(tsx?|css\.ts|js|json|mdx)$/i;

function fenceLang(file) {
  if (/\.css\.ts$/i.test(file)) return "ts";
  if (/\.tsx$/i.test(file)) return "tsx";
  if (/\.ts$/i.test(file)) return "ts";
  if (/\.js$/i.test(file)) return "js";
  if (/\.json$/i.test(file)) return "json";
  if (/\.mdx$/i.test(file)) return "mdx";
  return "";
}

// Ia primul JSDoc dacă există
function extractJsDoc(src) {
  const m = src.match(/\/\*\*([\s\S]*?)\*\//);
  if (!m) return null;
  const raw = m[1]
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return raw || null;
}

// Heuristici pt descriere dacă nu există JSDoc
function inferDescription(relPath, jsdoc) {
  if (jsdoc) return jsdoc;

  const lower = relPath.toLowerCase();

  if (lower.includes("styles/header.css.ts"))
    return "Stilurile pentru header (desktop + mobil) în Vanilla Extract.";
  if (lower.includes("styles/footer.css.ts")) return "Stilurile pentru footer.";
  if (lower.includes("styles/globals.css"))
    return "Reset global + reguli de accesibilitate și font.";
  if (lower.includes("styles/tokens"))
    return "Design tokens (culori, spacing, font sizes) pentru întreg proiectul.";
  if (lower.includes("components/header.tsx"))
    return "Header global + navigație (desktop + mobil).";
  if (lower.includes("components/footer.tsx")) return "Footer global.";
  if (lower.includes("components/cookies/cookieprovider.tsx"))
    return "Provider pentru consimțământ cookie-uri (stare + context).";
  if (lower.includes("components/cookieconsent.tsx"))
    return "UI pentru banner de consimțământ cookie-uri.";
  if (lower.includes("components/seo.tsx"))
    return "Setare meta SEO (title, description, OG, Twitter).";
  if (lower.includes("components/skiplink.tsx")) return "Link accesibilitate: „sari la conținut”.";
  if (lower.includes("/pages/_app.tsx"))
    return "Punct de intrare Next.js: providers + layout global.";
  if (lower.includes("/pages/_document.tsx")) return "Document HTML personalizat (Html/Head/Body).";
  if (lower.includes("/pages/index.tsx")) return "Homepage.";
  if (lower.includes("/pages/services.tsx")) return "Pagina Servicii.";
  if (lower.includes("/pages/galerie.tsx")) return "Pagina Galerie.";
  if (lower.includes("/pages/contact.tsx")) return "Pagina Contact.";
  if (lower.includes("/pages/sitemap.xml.ts")) return "Generator sitemap.xml dinamic.";
  if (lower.includes("/lib/cookies.ts")) return "Helperi pentru consimțământ cookies.";
  if (lower.includes("/lib/dates.ts")) return "Helperi pentru date/calendar.";
  if (lower.includes("/lib/gallery.ts")) return "Helperi pentru galerie (imagini/colecții).";
  if (lower.includes("/lib/images.ts")) return "Centralizare resurse imagine (hero/OG/favicons).";
  if (lower.includes("/data/gallerycaptions.json")) return "Captions pentru imaginile din galerie.";
  if (lower.includes("/interfaces/")) return "Interfețe/Tipuri TypeScript utilizate în proiect.";
  if (lower.includes("/types/svg.d.ts"))
    return "Declarație TypeScript pentru importul fișierelor SVG ca module.";
  if (lower.includes("/utils/sample-data.ts")) return "Date demo (mock) pentru test.";
  if (lower.includes("/scripts/gengalleryjson.js"))
    return "Script Node: generează JSON-ul galeriei pe baza imaginilor.";

  return "Fișier de cod parte din aplicație.";
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (EXCLUDE_REGEX.test(full)) continue;
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (EXT_REGEX.test(entry.name)) {
      yield full;
    }
  }
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = [];
  for (const d of INCLUDE_DIRS) {
    const abs = path.join(ROOT, d);
    if (!(await fs.stat(abs).catch(() => false))) continue;
    for await (const f of walk(abs)) files.push(f);
  }

  let indexMd = `# Documentație per fișier (auto-generată)\n\n`;

  for (const file of files.sort()) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const src = await fs.readFile(file, "utf8");
    const jsdoc = extractJsDoc(src);
    const desc = inferDescription(rel, jsdoc);
    const lang = fenceLang(file);
    const safeName = rel.replace(/\//g, "__");
    const outFile = path.join(OUT_DIR, `${safeName}.md`);

    const md = [
      `# ${rel}`,
      ``,
      `**Ce face:** ${desc}`,
      ``,
      `\`\`\`${lang}`,
      src,
      `\`\`\``,
      ``,
    ].join("\n");

    await fs.writeFile(outFile, md, "utf8");
    indexMd += `- [${rel}](by-file/${safeName}.md) — ${desc}\n`;
    console.log("✅", rel);
  }

  await fs.mkdir(path.join(ROOT, "docs"), { recursive: true });
  await fs.writeFile(path.join(ROOT, "docs", "INDEX.md"), indexMd, "utf8");
  console.log("\n📚 Gata! Vezi docs/INDEX.md și docs/by-file/*.md");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
