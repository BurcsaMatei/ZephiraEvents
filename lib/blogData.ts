// lib/blogData.ts

// ==================================================
// Imports
// ==================================================
import { z } from "zod";

// ==================================================
// Helpers URL & HTML
// ==================================================
const isAbsoluteHttpUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};
// /foo.jpg, ./foo.jpg, ../foo.jpg (nu //foo)
const isRelativePath = (s: string) => /^\/(?!\/)|^\.\.?\/.*/.test(s);
const isValidImgSrc = (s: string) => isAbsoluteHttpUrl(s) || isRelativePath(s);

function sanitizeBasic(html: string): string {
  return (
    html
      // elimină script tags
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      // elimină event handlers inline: onclick=, onerror= etc.
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // blochează javascript: în href/src
      .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
      // (4) elimină stiluri inline
      .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
  );
}

// ==================================================
// Zod schema & tipuri inferate (strict + exactOptionalPropertyTypes)
// ==================================================
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const BlogPostSchema = z
  .object({
    slug: z.string().trim().regex(slugRegex, {
      message: "Slug invalid (doar litere mici, cifre și cratime).",
    }),
    title: z.string().trim().min(1).max(140),
    // (5) validare mai strictă (RFC 3339/ISO) pentru date
    date: z.string().trim().datetime({ offset: true }),
    excerpt: z.string().trim().min(80).max(170),
    coverImage: z
      .string()
      .trim()
      .refine((s) => isValidImgSrc(s), {
        message:
          "coverImage trebuie să fie URL http(s) absolut sau cale relativă (/… , ./… , ../…).",
      })
      .optional(),
    author: z.string().trim().min(1).max(80).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    contentHtml: z.string().trim().min(1),
    readingTime: z.string().trim().min(1).max(20).optional(),
    draft: z.boolean().optional(),
  })
  .strict();

export const BlogPostListSchema = z.array(BlogPostSchema).superRefine((items, ctx) => {
  const seen = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it) continue;
    const s = it.slug;
    if (seen.has(s)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Slug duplicat: "${s}"`,
        path: [i, "slug"],
      });
    }
    seen.add(s);
  }
});

/** Tipurile publice — aliniate 100% cu schema (inclusiv undefined pe opționale). */
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogPostList = ReadonlyArray<BlogPost>;

// ==================================================
// Config SITE_URL (canonical/JSON-LD)
// ==================================================
// (1) Fix: preferința trailing slash se citește din valoarea BRUTĂ a env-ului
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PREFER_TRAILING = /\/$/.test(process.env.NEXT_PUBLIC_SITE_URL ?? "");
// fără slash final pentru baza absolută
export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, "");

function alignTrailingSlash(pathname: string): string {
  if (!pathname) return "/";
  const ensureLeading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (PREFER_TRAILING) {
    return ensureLeading.endsWith("/") ? ensureLeading : `${ensureLeading}/`;
  }
  if (ensureLeading !== "/" && ensureLeading.endsWith("/")) {
    return ensureLeading.replace(/\/+$/, "");
  }
  return ensureLeading;
}

// ==================================================
// 📝 BLOG DATA — AICI SE EDITEAZĂ/ADAUGĂ ARTICOLELE
// ==================================================
const POSTS_RAW = [
  {
    slug: "tendinte-design-2025",
    title: "Tendințe de design 2025 pentru site-uri de prezentare",
    date: "2025-08-12T09:00:00Z",
    excerpt:
      "Minimalism, viteză și mesaje clare. Ce funcționează acum pentru conversii pe site-urile de tip prezentare.",
    coverImage: "/images/blog/cover-2.jpg",
    author: "KonceptID",
    tags: ["design", "ux"],
    readingTime: "4 min",
    contentHtml: `
<p>Interfețe <strong>curate</strong>, contrast bun, imagini optimizate și micro-interacțiuni discrete (ex: <code>framer-motion</code>) cresc încrederea și conversiile.</p>
<h3>Recomandări</h3>
<ol>
  <li>Text scurt, accent pe beneficii</li>
  <li>Imagini locale, <em>lazy</em> și compresate</li>
  <li>CTA clar, deasupra pliului</li>
</ol>
`.trim(),
  },
  {
    slug: "ghid-organizare-eveniment",
    title: "Ghid rapid: organizarea unui eveniment reușit",
    date: "2025-08-10T09:00:00Z",
    excerpt:
      "Pașii esențiali pentru a-ți planifica evenimentul fără stres: buget, locație, furnizori și timeline clar.",
    coverImage: "/images/blog/cover-1.jpg",
    author: "Redacția",
    tags: ["organizare", "evenimente"],
    readingTime: "3 min",
    contentHtml: `
<p>O planificare bună începe cu un <strong>buget realist</strong> și un <em>timeline</em> clar. Apoi alegi locația, furnizorii și trasezi responsabilitățile.</p>
<h2>Checklist de pornire</h2>
<ul>
  <li>Buget și priorități</li>
  <li>Locație, dată și invitați</li>
  <li>Contracte & logistică</li>
</ul>
<p>Reia planul săptămânal și păstrează legătura cu furnizorii.</p>
`.trim(),
  },
  {
    slug: "viteza-site-core-web-vitals",
    title: "Viteza site-ului și Core Web Vitals: ce contează în 2025",
    date: "2025-08-05T08:30:00Z",
    excerpt:
      "CLS, LCP și INP influențează direct SEO și conversiile. Iată cum optimizezi imaginile, fonturile și scripturile pentru rezultate reale.",
    coverImage: "/images/blog/cover-3.jpg",
    author: "KonceptID",
    tags: ["performance", "seo", "core-web-vitals"],
    readingTime: "5 min",
    contentHtml: `
<p>Google măsoară experiența reală a utilizatorilor prin <strong>Core Web Vitals</strong>: <em>LCP</em>, <em>CLS</em> și <em>INP</em>. Un scor bun înseamnă încărcare rapidă și interfețe stabile.</p>
<h2>Pași practici</h2>
<ul>
  <li>Optimizează imaginile (format modern, dimensiuni corecte, <code>next/image</code>)</li>
  <li>Folosește <code>font-display: swap</code> și preîncarcă fonturile critice</li>
  <li>Amână scripturile neesențiale și elimină CSS nefolosit</li>
</ul>
`.trim(),
  },
  {
    slug: "structurare-continut-seo",
    title: "Structurarea conținutului pentru SEO: ghid scurt",
    date: "2025-08-01T10:00:00Z",
    excerpt:
      "Titluri clare, paragrafe scurte și intertitluri relevante. Cum scrii pagini care răspund intenției de căutare și cresc rata de conversie.",
    coverImage: "/images/blog/cover-4.jpg",
    author: "Redacția",
    tags: ["seo", "content"],
    readingTime: "3 min",
    contentHtml: `
<p>Conținutul bine structurat ajută atât <strong>utilizatorii</strong>, cât și <strong>motoarele de căutare</strong>. Începe cu un H1 clar, apoi secțiuni logice cu H2/H3.</p>
<h2>Formulă simplă</h2>
<ol>
  <li>Deschidere scurtă cu beneficiu</li>
  <li>Dezvoltare în 2-3 puncte cheie</li>
  <li>Concluzie cu CTA</li>
</ol>
`.trim(),
  },
  {
    slug: "nextjs-ssg-vs-ssr-alegere",
    title: "Next.js: SSG vs SSR — ce alegi pentru site-ul tău?",
    date: "2025-07-20T09:15:00Z",
    excerpt:
      "Pagini rapide și sigure cu SSG sau date proaspete la fiecare cerere cu SSR? Un ghid pragmatic pentru site-uri de prezentare.",
    coverImage: "/images/blog/cover-5.jpg",
    author: "KonceptID",
    tags: ["nextjs", "arch"],
    readingTime: "4 min",
    contentHtml: `
<p><strong>SSG</strong> oferă viteză și costuri mici. <strong>SSR</strong> aduce date proaspete, dar cu latență mai mare. Pentru site-urile de prezentare, SSG este de obicei suficient.</p>
<h3>Când alegi SSR</h3>
<ul>
  <li>Conținut care se schimbă la minut</li>
  <li>Personalizare pe utilizator</li>
</ul>
`.trim(),
  },
  {
    slug: "imagini-eficiente-webp-avif",
    title: "Imagini eficiente: WebP și AVIF pentru un site mai rapid",
    date: "2025-07-10T07:45:00Z",
    excerpt:
      "Conversia la WebP/AVIF reduce dimensiunea fără pierderi vizibile. Vezi cum setezi <code>next/image</code> și fallback pentru compatibilitate.",
    coverImage: "/images/blog/cover-6.jpg",
    author: "Redacția",
    tags: ["imagini", "performance"],
    readingTime: "3 min",
    contentHtml: `
<p>Formatele <strong>WebP</strong> și <strong>AVIF</strong> oferă compresie mai bună față de JPEG/PNG. În Next.js, <code>next/image</code> gestionează automat multe optimizări.</p>
<h2>Practic</h2>
<ul>
  <li>Setează dimensiuni explicite</li>
  <li>Definește <code>sizes</code> pentru layout responsive</li>
  <li>Folosește imagini <em>lazy</em> în afara pliului</li>
</ul>
`.trim(),
  },
  {
    slug: "microcopy-cta-conversii",
    title: "Microcopy și CTA: mici texte, impact mare în conversii",
    date: "2025-06-28T11:10:00Z",
    excerpt:
      "Butonul și mesajul din jurul lui contează. Testează variante, scoate jargonul și explică beneficiul în 6–10 cuvinte.",
    coverImage: "/images/blog/cover-7.jpg",
    author: "KonceptID",
    tags: ["copywriting", "ux", "conversii"],
    readingTime: "2 min",
    contentHtml: `
<p>Un <strong>CTA</strong> reușit nu vinde, ci clarifică următorul pas. Evită formulările vagi și leagă textul de un beneficiu concret pentru utilizator.</p>
<ul>
  <li>„Solicită ofertă în 24h”</li>
  <li>„Vezi portofoliul complet”</li>
</ul>
`.trim(),
  },
  {
    slug: "audit-seo-rapid-checklist",
    title: "Audit SEO rapid: checklist pentru site-uri mici",
    date: "2025-06-15T08:00:00Z",
    excerpt:
      "Titluri unice, descrieri clare, sitemap valid, viteza bună și conținut util. Un control rapid care oferă rezultate vizibile.",
    coverImage: "/images/blog/cover-8.jpg",
    author: "Redacția",
    tags: ["seo", "audit"],
    readingTime: "3 min",
    contentHtml: `
<p>Începe cu bazele: <strong>title</strong> și <strong>meta description</strong> unice, sitemap corect, <em>robots.txt</em>, structură clară de heading-uri și performanță solidă.</p>
<h3>Checklist</h3>
<ol>
  <li>Indexare (Search Console)</li>
  <li>Performanță (Lighthouse)</li>
  <li>Conținut (intenție & relevanță)</li>
</ol>
`.trim(),
  },
] satisfies ReadonlyArray<Partial<z.input<typeof BlogPostSchema>>>;

// ==================================================
// Validare & normalizare la import
// ==================================================
const VALIDATED_POSTS: ReadonlyArray<z.output<typeof BlogPostSchema>> = BlogPostListSchema.parse(
  POSTS_RAW.map((p) => ({
    ...p,
    // (2) normalizare tag-uri: trim + lowercase
    ...(p.tags ? { tags: p.tags.map((t) => t.trim().toLowerCase()) } : {}),
    contentHtml: sanitizeBasic(String(p.contentHtml ?? "")),
  })),
);

// adaugă timestamp pentru sortare; tip compatibil cu exactOptionalPropertyTypes
type BlogPostWithTs = BlogPost & { timestamp: number };

const POSTS_WITH_TS: ReadonlyArray<BlogPostWithTs> = VALIDATED_POSTS.map((p) => ({
  ...p,
  timestamp: Date.parse(p.date),
}));

// draft-urile ascunse în PROD
const IS_PROD = process.env.NODE_ENV === "production";
const PUBLIC_POSTS_SORTED: ReadonlyArray<BlogPostWithTs> = POSTS_WITH_TS.filter(
  (p) => !p.draft || !IS_PROD,
)
  .slice()
  .sort((a, b) => b.timestamp - a.timestamp);

// ==================================================
// API utilitare (public)
// ==================================================
export function getAllPosts(): BlogPostList {
  return PUBLIC_POSTS_SORTED.map(({ timestamp, ...p }) => p);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const found = PUBLIC_POSTS_SORTED.find((x) => x.slug === slug);
  if (!found) return null;
  const { timestamp, ...p } = found;
  return p;
}

export function getRecent(n: number): BlogPostList {
  return PUBLIC_POSTS_SORTED.slice(0, Math.max(0, n)).map(({ timestamp, ...p }) => p);
}

// (2) căutare după tag insensibilă la caz & spații (tag-urile din store sunt deja lowercase)
export function getPostsByTag(tag: string): BlogPostList {
  const q = tag.trim().toLowerCase();
  return PUBLIC_POSTS_SORTED.filter((p) => p.tags?.some((t) => t === q)).map(
    ({ timestamp, ...p }) => p,
  );
}

// (3) listă unică de tag-uri (lowercase), sortată alfabetic
export function getAllTags(): readonly string[] {
  const set = new Set<string>();
  for (const p of PUBLIC_POSTS_SORTED) {
    if (p.tags) for (const t of p.tags) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

// (3) articole „similare” după overlap de tag-uri; ordonate după scor desc, apoi recență
export function getRelatedByTags(slug: string, limit = 3): BlogPostList {
  const base = PUBLIC_POSTS_SORTED.find((p) => p.slug === slug);
  if (!base || !base.tags || base.tags.length === 0) return [];
  const baseTags = new Set(base.tags);

  const scored = PUBLIC_POSTS_SORTED.filter((p) => p.slug !== slug)
    .map((p) => {
      const overlap = p.tags?.reduce((acc, t) => acc + (baseTags.has(t) ? 1 : 0), 0) ?? 0;
      return { p, overlap };
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return b.p.timestamp - a.p.timestamp;
    })
    .slice(0, Math.max(0, limit))
    .map(({ p }) => {
      const { timestamp, ...rest } = p;
      return rest;
    });

  return scored;
}

export function canonicalFor(pathname: string): string {
  const normalizedPath = alignTrailingSlash(pathname || "/");
  return `${SITE_URL}${normalizedPath}`;
}
