import { promises as fs } from "fs";
import path from "path";

// convertor minimal MD->HTML fără dependențe (simplu, nu perfect):
function mdToHtml(md) {
  // atenție: asta e o conversie foarte simplă; pentru rezultate mai bune folosește "marked" sau "markdown-it"
  return md
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(
      /```(\w+)?\n([\s\S]*?)```/gm,
      (m, lang, code) =>
        `<pre><code class="language-${lang || "text"}">${code.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch])}</code></pre>`,
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>") // slab, dar suficient pt. liste simple
    .replace(/^(.+)$/gm, "<p>$1</p>");
}

const ROOT = process.cwd();
const SRC_DIRS = [path.join(ROOT, "docs", "by-file"), path.join(ROOT, "docs", "by-component")];
const OUT_DIR = path.join(ROOT, "docs", "site");

function layout(title, body) {
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; max-width: 1100px; }
  pre { background:#0b1020; color:#e6edf3; padding:16px; overflow:auto; border-radius:8px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.95rem; }
  h1,h2,h3 { margin-top: 1.2em; }
  a { color:#0b6bf2; text-decoration:none; }
  a:hover { text-decoration:underline; }
  ul { margin-left: 1.2rem; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  let links = [];

  for (const dir of SRC_DIRS) {
    const exists = await fs.stat(dir).catch(() => null);
    if (!exists) continue;

    for (const file of await fs.readdir(dir)) {
      if (!file.endsWith(".md")) continue;
      const src = await fs.readFile(path.join(dir, file), "utf8");
      const html = mdToHtml(src);
      const outName = file.replace(/\.md$/, ".html");
      const outPath = path.join(OUT_DIR, outName);
      await fs.writeFile(outPath, layout(file, html), "utf8");
      links.push(`<li><a href="${outName}">${file}</a></li>`);
      console.log("✅", outName);
    }
  }

  const indexHtml = layout("Documentație", `<h1>Documentație</h1><ul>${links.join("")}</ul>`);
  await fs.writeFile(path.join(OUT_DIR, "index.html"), indexHtml, "utf8");
  console.log("\n📚 Site generat: docs/site/index.html");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
