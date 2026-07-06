// scripts/build-llms.ts
/**
 * Generează public/llms.txt + public/llms-full.txt din surse LIVE:
 *   - data/menus/*.json  (prețuri + feluri)   via lib/menus.server
 *   - data/blog/*.md      (articole)          via lib/blog.server
 *   - data/google-reviews.json (recenzii)     via lib/googleReviews
 *   - lib/faq.ts          (FAQ partajat cu /faq)
 *   - lib/config.ts + env (contact, operator legal)
 *
 * Model HIBRID: proză editorială fixă (constante) + secțiuni auto din date.
 * Rulare: `npm run llms:build` (rulează în `postbuild`, lângă rss:build).
 * Fișierele rezultate sunt gitignored (regenerate la fiecare build) — vezi .gitignore.
 *
 * Encoding: conținutul este Markdown, servit ca .txt (convenția llms.txt — analog robots.txt).
 * NU redenumi în .md: crawlerele caută fix /llms.txt la rădăcină.
 */

import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// ──────────────────────────────────────────────────────────
// Încarcă .env.local dacă există (dev local). Pe Vercel env-ul e deja
// injectat ca variabile reale → nu se suprascrie (real env are prioritate).
// ──────────────────────────────────────────────────────────
function loadEnvLocal(): void {
  try {
    const raw = readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // fără .env.local (ex. Vercel) — folosim env-ul real
  }
}

const env = (k: string, fallback: string): string => {
  const v = process.env[k];
  return v && v.trim().length > 0 ? v.trim() : fallback;
};

// ──────────────────────────────────────────────────────────
// Helpers de formatare
// ──────────────────────────────────────────────────────────
const RO_MONTHS = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

function roDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${RO_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function roMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${RO_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function stars(rating: number): string {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

// ──────────────────────────────────────────────────────────
// Ordine + etichete
// ──────────────────────────────────────────────────────────
const EVENT_TYPE_ORDER = [
  "Nunta",
  "Botez & Cununie",
  "Corporate & Team Building",
  "Petreceri Private & Majorate",
] as const;

const EVENT_TYPE_LABEL: Record<string, string> = {
  Nunta: "Nuntă",
  "Botez & Cununie": "Botez & Cununie",
  "Corporate & Team Building": "Corporate & Team Building",
  "Petreceri Private & Majorate": "Petreceri Private & Majorate",
};

const SECTION_LABELS: ReadonlyArray<[string, string]> = [
  ["starterRece", "Antreu rece (platouri)"],
  ["antreuCald", "Antreu cald"],
  ["felIntermediar", "Fel intermediar"],
  ["felPrincipal", "Fel principal"],
  ["pachetBar", "Pachet bar"],
];

// ──────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────
async function run(): Promise<void> {
  loadEnvLocal();

  // Import DINAMIC după loadEnvLocal — config.ts citește process.env la evaluare.
  const { COMPANY, SOCIAL_URLS } = await import("../lib/config");
  const { getAllMenus } = await import("../lib/menus.server");
  const { getAllPosts } = await import("../lib/blog.server");
  const { getGoogleReviews, getGoogleReviewsStats } = await import("../lib/googleReviews");
  const { FAQ_ITEMS, MAX_CAPACITY } = await import("../lib/faq");

  const BASE = env("NEXT_PUBLIC_SITE_URL", "https://zephiraevents.ro").replace(/\/+$/, "");
  const PHONE = env("NEXT_PUBLIC_CONTACT_PHONE", "+40 769 990 800");
  const EMAIL = env("NEXT_PUBLIC_CONTACT_EMAIL", "info@zephiraevents.ro");
  const STREET = env("NEXT_PUBLIC_CONTACT_STREET", "Calea Odobești 408");
  const CITY = env("NEXT_PUBLIC_CONTACT_CITY", "Cîmpineanca");
  const REGION = env("NEXT_PUBLIC_CONTACT_REGION", "Județul Vrancea");
  const POSTAL = env("NEXT_PUBLIC_CONTACT_POSTAL", "627055");
  const COUNTRY = env("NEXT_PUBLIC_CONTACT_COUNTRY", "România");
  const IG = env("NEXT_PUBLIC_IG_URL", "https://www.instagram.com/zephiraevents.ro/");
  const TT = env("NEXT_PUBLIC_TT_URL", "https://www.tiktok.com/@zephiraevents.ro");
  const GMAPS =
    SOCIAL_URLS.googleMaps ||
    "https://www.google.com/maps/place/ChIJqe6HRAIjtEARUT73PVztMnA";
  const GPS_LAT = env("NEXT_PUBLIC_CONTACT_LAT", "45.726749");
  const GPS_LNG = env("NEXT_PUBLIC_CONTACT_LNG", "27.125499");

  // Cod ISO (ex. "RO") pentru schema; nume lizibil pentru proza llms.
  const COUNTRY_NAME = COUNTRY.toUpperCase() === "RO" ? "România" : COUNTRY;
  const ADDRESS = `${STREET}, ${CITY}, ${REGION}, ${POSTAL}, ${COUNTRY_NAME}`;
  const GPS = `${GPS_LAT}°N, ${GPS_LNG}°E`;
  const OPERATOR_SHORT = `${COMPANY.name}, CUI ${COMPANY.cui}, ${COMPANY.regCom}, Focșani, Vrancea`;

  // ── Date live ────────────────────────────────────────────
  const menus = getAllMenus();
  const posts = getAllPosts();
  const reviews = getGoogleReviews();
  const stats = getGoogleReviewsStats(reviews);
  const RATING = stats.ratingValue.toFixed(1);

  const menusByType = (type: string) =>
    menus
      .filter((m) => m.eventType === type)
      .sort((a, b) => a.pricePerPers - b.pricePerPers || a.slug.localeCompare(b.slug));

  // ════════════════════════════════════════════════════════
  // llms.txt (index)
  // ════════════════════════════════════════════════════════
  const indexMenus = EVENT_TYPE_ORDER.map((type) => {
    const list = menusByType(type)
      .map(
        (m) =>
          `- ${BASE}/meniuri/${m.slug} — ${m.title} (${m.currency} ${m.pricePerPers}/pers)`,
      )
      .join("\n");
    return `### ${EVENT_TYPE_LABEL[type]}\n${list}`;
  }).join("\n\n");

  const indexBlog = posts
    .map((p) => `- ${BASE}/blog/${p.slug} — ${p.title}`)
    .join("\n");

  const indexTxt = `# ZephiraEvents

> Sală de evenimente premium în Focșani, județul Vrancea, România — organizare completă A–Z pentru nunți, botezuri, majorate, petreceri private, banchete și evenimente corporate. 17 meniuri personalizate, cort exterior la locația ta, catering, decor, foto-video, DJ/MC și coordonare în ziua evenimentului.

## Despre

ZephiraEvents este o sală de evenimente situată la ${STREET}, ${CITY}, ${REGION.replace(/^Județul\s+/i, "județul ")} (lângă Focșani), România. Coordonate GPS: ${GPS}.

Tipuri de evenimente organizate: nunți, botezuri, cununii civile, majorate, petreceri private, banchete, events corporate, team building.

Servicii incluse în pachetul complet: locație sală (capacitate până la ${MAX_CAPACITY} de persoane), catering & meniuri personalizate (17 variante), decor tematic, foto-video, DJ/MC, ospătari și personal de serviciu, coordonare completă în ziua evenimentului. Disponibil și serviciu cort exterior — amplasare la locația clientului, oriunde în județ.

- **Operator site:** ${OPERATOR_SHORT}
- **Telefon:** ${PHONE} (WhatsApp disponibil)
- **Email:** ${EMAIL}
- **Adresă:** ${ADDRESS}
- **Program:** Luni–Vineri 09:00–21:00 / Sâmbătă–Duminică la cerere
- **Instagram:** ${IG}
- **TikTok:** ${TT}

## Pagini principale

- ${BASE}/ — Homepage: prezentare brand, servicii, galerie, recenzii clienți
- ${BASE}/servicii — Servicii complete: sală, meniuri, catering, decor, ospătari, bar, foto-video, DJ, corporate
- ${BASE}/galerie — Galerie foto reală: nunți, botezuri, majorate, corporate
- ${BASE}/contact — Contact, hartă interactivă, formular ofertă personalizată
- ${BASE}/cort-evenimente-la-locatia-ta — Serviciu cort exterior: amplasare la locația clientului, organizare A–Z
- ${BASE}/reviews — Recenzii reale de pe Google Business Profile (${RATING}/5)
- ${BASE}/faq — Întrebări frecvente: prețuri, capacitate (până la ${MAX_CAPACITY} persoane), cort, rezervare, program, personalizare meniu
- ${BASE}/blog — Articole și ghiduri pentru organizarea evenimentelor

## Meniuri disponibile

${indexMenus}

## Articole blog

${indexBlog}

## Conținut extins

- ${BASE}/llms-full.txt — Versiunea completă cu toate meniurile detaliate, articolele blog, recenzii și FAQ

## Pagini secundare

- ${BASE}/marca — Identitate brand ZephiraEvents
- ${BASE}/cookie-policy — Politica de utilizare cookie-uri

## Sitemap

- ${BASE}/sitemap.xml
`;

  // ════════════════════════════════════════════════════════
  // llms-full.txt (extins)
  // ════════════════════════════════════════════════════════
  const renderMenu = (m: (typeof menus)[number]): string => {
    const lines: string[] = [];
    lines.push(`### ${m.title} — ${m.currency} ${m.pricePerPers}/persoană`);
    lines.push(`URL: ${BASE}/meniuri/${m.slug}`);
    lines.push("");
    const sections = m.sections as unknown as Record<string, string | string[]>;
    for (const [key, label] of SECTION_LABELS) {
      const val = sections[key];
      if (val == null) continue;
      if (Array.isArray(val)) {
        if (val.length === 0) continue;
        lines.push(`**${label}:**`);
        for (const item of val) lines.push(`- ${item}`);
      } else if (typeof val === "string" && val.trim()) {
        lines.push(`**${label}:** ${val}`);
      }
      lines.push("");
    }
    return lines.join("\n").trimEnd();
  };

  const fullMenus = EVENT_TYPE_ORDER.map((type) => {
    const rendered = menusByType(type).map(renderMenu).join("\n\n---\n\n");
    return `## Meniuri — ${EVENT_TYPE_LABEL[type]}\n\n${rendered}`;
  }).join("\n\n---\n\n");

  const fullBlog = posts
    .map((p) => {
      const tags = (p.tags ?? []).join(", ");
      const rt = p.readingTime ?? "";
      const meta = [`Data: ${roDate(p.date)}`, tags ? `Tags: ${tags}` : "", rt ? `Timp citire: ${rt}` : ""]
        .filter(Boolean)
        .join(" | ");
      return `### ${p.title}\nURL: ${BASE}/blog/${p.slug}\n${meta}\n\n${p.excerpt}`;
    })
    .join("\n\n---\n\n");

  const fullReviews = reviews
    .map(
      (r) =>
        `### ${r.authorName} — ${stars(r.rating)} (${r.rating}/5)\nData: ${roMonthYear(r.date)}\n\n„${r.text}"`,
    )
    .join("\n\n---\n\n");

  const fullFaq = FAQ_ITEMS.map((f) => `**${f.question}**\n${f.answer}`).join("\n\n");

  const fullTxt = `# ZephiraEvents — Conținut complet pentru crawlere AI

> Versiunea extinsă a llms.txt. Conține toate meniurile detaliate, articolele blog, recenzii reprezentative și FAQ.
> Versiunea index: ${BASE}/llms.txt

---

## Despre ZephiraEvents

ZephiraEvents este o sală de evenimente premium situată la ${STREET}, ${CITY}, ${REGION.replace(/^Județul\s+/i, "județul ")}, România — la câțiva kilometri de centrul orașului Focșani.

Profilul locației: sală de evenimente cu organizare completă A–Z, dedicată cuplurilor, familiilor și companiilor care doresc un eveniment fără stres, cu coordonare integrată și furnizori verificați. Echipa gestionează tot procesul: de la prima discuție, planificare meniu și decor, până la coordonarea în ziua evenimentului.

**Tipuri de evenimente organizate:**
- Nunți
- Botezuri și cununii civile
- Majorate
- Petreceri private și banchete
- Evenimente corporate și team building

**Servicii incluse în pachetul complet:**
- Locație sală (capacitate de până la ${MAX_CAPACITY} de persoane, cu configurații de așezare adaptate evenimentului)
- Catering & meniuri personalizate (17 variante, 4 categorii)
- Decor tematic (aranjamente florale, iluminat, semnalistică)
- Foto-video (echipă proprie sau coordonare cu furnizori externi)
- DJ/MC (coordonare playlist, momente artistice, anunțuri)
- Personal de serviciu (ospătari, coordonator sală)
- Coordonare completă în ziua evenimentului

**Serviciu cort exterior:** ZephiraEvents oferă și serviciu de amplasare cort la locația clientului — grădini, curți, proprietăți private — oriunde în județul Vrancea și zonele limitrofe. Organizare A–Z inclusă.

---

## Contact și localizare

- **Adresă:** ${ADDRESS}
- **Telefon:** ${PHONE}
- **WhatsApp:** ${PHONE}
- **Email:** ${EMAIL}
- **Coordonate GPS:** ${GPS}
- **Program:** Luni–Vineri 09:00–21:00 / Sâmbătă–Duminică la cerere
- **Instagram:** ${IG}
- **TikTok:** ${TT}
- **Website:** ${BASE}

---

${fullMenus}

---

## Articole blog

${fullBlog}

---

## Recenzii Google (Google Business Profile)

Profil Google: ${GMAPS}
Evaluare medie: ${RATING}/5 (${stats.ratingCount} recenzii)

${fullReviews}

---

## Întrebări frecvente (FAQ)

${fullFaq}
`;

  // ── Scriere ──────────────────────────────────────────────
  const outDir = path.resolve(process.cwd(), "public");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "llms.txt"), indexTxt, "utf8");
  await writeFile(path.join(outDir, "llms-full.txt"), fullTxt, "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `[llms] Generated public/llms.txt + public/llms-full.txt — ${menus.length} meniuri, ${posts.length} articole, ${reviews.length} recenzii, ${FAQ_ITEMS.length} FAQ (base: ${BASE})`,
  );
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
