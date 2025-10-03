import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, "components");
const STYLES_DIR = path.join(ROOT, "styles");
const OUT_DIR = path.join(ROOT, "docs", "by-component");

const EXT_OK = /\.(tsx|ts)$/i;
const EXCLUDE = /(node_modules|\.next|dist|build|coverage|\.git|docs)/i;

const fence = (filename, code) => {
  const lang = filename.endsWith(".tsx") ? "tsx" : "ts";
  return `### ${filename}\n\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
};

const readSafe = async (p) => {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
};

const kebab = (s) => s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (EXCLUDE.test(full)) continue;
    if (e.isDirectory()) yield* walk(full);
    else if (EXT_OK.test(e.name)) yield full;
  }
}

function guessStylePaths(compPath) {
  const base = path.basename(compPath).replace(/\.(tsx|ts)$/i, ""); // ex: Header
  const candidates = [
    path.join(STYLES_DIR, `${base}.css.ts`), // Header.css.ts
    path.join(STYLES_DIR, `${kebab(base)}.css.ts`), // header.css.ts
  ];
  return candidates;
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  let index = `# Documentație pe componentă\n\n`;

  for await (const compFile of walk(COMPONENTS_DIR)) {
    const relComp = path.relative(ROOT, compFile).replace(/\\/g, "/");
    const compCode = await readSafe(compFile);
    if (!compCode) continue;

    let desc = "Componentă React + stilurile aferente (Vanilla Extract), combinate.";
    // ia primul JSDoc dacă există
    const m = compCode.match(/\/\*\*([\s\S]*?)\*\//);
    if (m) {
      desc =
        m[1]
          .split("\n")
          .map((l) => l.replace(/^\s*\*\s?/, "").trim())
          .join(" ")
          .trim() || desc;
    }

    // caută stylesheet-ul
    const styles = await (async () => {
      for (const s of guessStylePaths(compFile)) {
        const code = await readSafe(s);
        if (code) return { path: s, code };
      }
      return null;
    })();

    const safe = relComp.replace(/\//g, "__") + ".md";
    const out = path.join(OUT_DIR, safe);

    let md = `# ${relComp}\n\n**Ce face:** ${desc}\n\n`;
    md += fence(relComp, compCode);
    if (styles) {
      const relStyle = path.relative(ROOT, styles.path).replace(/\\/g, "/");
      md += fence(relStyle, styles.code);
    } else {
      md += `_Nu a fost găsit un stylesheet pereche în styles/._\n`;
    }

    await fs.writeFile(out, md, "utf8");
    index += `- [${relComp}](by-component/${safe})\n`;
    console.log("✅", relComp);
  }

  await fs.writeFile(path.join(ROOT, "docs", "INDEX_COMPONENTS.md"), index, "utf8");
  console.log("\n📚 Gata: docs/INDEX_COMPONENTS.md + docs/by-component/*");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
