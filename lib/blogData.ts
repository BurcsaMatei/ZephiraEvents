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
    slug: "nunta-ca-la-carte-tendinte-2025-decor-design",
    title: "Nuntă ca la carte: tendințe 2025 în decor & design",
    date: "2025-08-12T09:00:00Z",
    excerpt:
      "Palete glamour, lumini calde și aranjamente aerisite: cum creezi o atmosferă elegantă pentru o nuntă memorabilă în Focsani.",
    coverImage: "/images/blog/cover-2.jpg",
    author: "ZephiraEvents",
    tags: ["nunti", "design", "tendinte"],
    readingTime: "5 min",
    contentHtml: `
<p>Stilul anului pune accent pe naturalețe rafinată și detalii atent alese: materiale textile bogate, lumini calde și compoziții aerisite care evidențiază cuplul și invitații. Alege o <strong>sală de evenimente glamour</strong> <!-- keyword --> în <strong>Focsani</strong> <!-- keyword --> cu tavan înalt, ferestre ample și infrastructură pentru lumini scenografice. Decorul reușit pornește de la o paletă coerentă: ivory, bej cald, accente metalice aurii, iar pentru contrast poți introduce verdeață structurală sau tonuri pudrate.</p>
<h3>Elemente care ridică nivelul</h3>
<ul>
  <li><strong>Iluminat stratificat</strong>: ghirlande calde, spoturi cu unghi îngust pe zone-cheie, lumânări protejate.</li>
  <li><strong>Texturi premium</strong>: catifea, in spălat, sticlă fumurie, ceramică artizanală.</li>
  <li><strong>Seating map logic</strong>: drumuri clare între ring, bar, candy bar și photo corner.</li>
</ul>
<p>Mesele pot rămâne minimaliste (fețe simple, farfurii albe, pahare fumurii) dacă introduci un aranjament floral înălțat care nu blochează dialogul. Pentru meniuri, consultă opțiunile de <strong>restaurante focsani</strong> <!-- keyword --> care susțin plating modern și ritm corect al servirii. Completează cu un colț foto care continuă tema și un bar de semnătură (două cocktailuri personalizate) pentru interacțiune. În final, creează o tranziție cromatică blândă între ceremonie, cină și party, astfel încât experiența să rămână coerentă până la ultimul dans.</p>
`.trim(),
  },
  {
    slug: "ghid-nunta-reusita-pasi-esentiali-2025",
    title: "Ghid pentru o nuntă reușită: pașii esențiali 2025",
    date: "2025-08-10T09:00:00Z",
    excerpt:
      "Buget clar, cronologie bine pusă la punct și furnizori verificați. Rețeta pentru o zi fără stres la ZephiraEvents.",
    coverImage: "/images/blog/cover-1.jpg",
    author: "Redacția",
    tags: ["organizare", "nunti", "checklist"],
    readingTime: "5 min",
    contentHtml: `
<p>Succesul începe cu planificarea: definește bugetul, listează prioritățile (muzică, decor, foto-video) și stabilește un calendar realist. Vizitează cel puțin două locații în <strong>Focsani</strong> <!-- keyword --> și cere simulări de setup. O <strong>sală de evenimente glamour</strong> <!-- keyword --> oferă infrastructură pentru scenă, lumini și backstage, reducând improvizațiile de ultim moment.</p>
<h2>Etape recomandate</h2>
<ol>
  <li><strong>Data și lista de invitați</strong>: estimează capacitatea necesară și verifică disponibilitatea furnizorilor.</li>
  <li><strong>Contracte-cheie</strong>: locație, catering (sondează opțiuni de <strong>restaurante focsani</strong> <!-- keyword -->), foto-video, formație/DJ, decor.</li>
  <li><strong>Degustare & moodboard</strong>: aliniază gustul meniului cu stilul vizual.</li>
  <li><strong>Timeline</strong>: ore de sosire, ceremonie, cină, tort, momente artistice, after-party.</li>
</ol>
<p>Centralizează contactele într-un singur document și numește un coordonator (familie sau planner) care să gestioneze întrebările în ziua evenimentului. Confirmă accesul pentru persoane cu mobilitate redusă, programul pentru copii și logistica parking-ului. În săptămâna evenimentului, reia telefonic toate confirmările și trimite un rezumat al programului tuturor furnizorilor pentru un flux fără sincope.</p>
`.trim(),
  },
  {
    slug: "cronologia-perfecta-nunta-ritm-fara-stres",
    title: "Cronologia perfectă pentru ziua nunții: ritm fără stres",
    date: "2025-08-05T08:30:00Z",
    excerpt:
      "Sincronizează fără grabă pregătirile, ceremonia și petrecerea. Un flux clar garantează energie bună până la final.",
    coverImage: "/images/blog/cover-3.jpg",
    author: "ZephiraEvents",
    tags: ["planificare", "cronologie", "nunti"],
    readingTime: "4 min",
    contentHtml: `
<p>O cronologie realistă înseamnă pauze mici între momente, timp pentru foto și zero aglomerație. Începe dimineața cu pregătirea ținutelor și detaliilor, rezervă minimum 45 de minute pentru first look și portrete, apoi planifică sosirea invitaților cu 30–45 de minute înainte de ceremonie. O locație centrală în <strong>Focsani</strong> <!-- keyword --> te ajută să reduci deplasările și să respecți orarul.</p>
<h2>Structura pe scurt</h2>
<ul>
  <li><strong>Pregătiri</strong>: hair & make-up, detalii (inele, buchet, invitații), foto de atmosferă.</li>
  <li><strong>Ceremonie</strong>: 20–40 min, urmată de felicitări și o sesiune scurtă de grup.</li>
  <li><strong>Cină & momente</strong>: intrarea mirilor, toasturi, dansul mirilor, tort, surprize.</li>
  <li><strong>Party</strong>: 2–4 ore, cu pauze pentru hidratare și snack bar.</li>
</ul>
<p>Stabilește un responsbil de sală, mai ales într-o <strong>sală de evenimente glamour</strong> <!-- keyword -->, care să coordoneze cu DJ-ul și echipa foto-video. Comunică din timp meniurile cu <strong>restaurante focsani</strong> <!-- keyword --> pentru a sincroniza servirea cu momentele artistice. Cu buffer-uri de 10–15 minute între etape, vibe-ul rămâne bun iar invitații se bucură de fiecare clipă.</p>
`.trim(),
  },
  {
    slug: "ghid-nunta-aer-liber",
    title: "Ghid pentru o nuntă reușită în aer liber",
    date: "2025-08-01T10:00:00Z",
    excerpt:
      "Plan B pentru vreme, iluminat ambiental și flow natural între ceremonie și party. Tot ce trebuie să știi.",
    coverImage: "/images/blog/cover-4.jpg",
    author: "Redacția",
    tags: ["outdoor", "nunti", "planning"],
    readingTime: "4 min",
    contentHtml: `
<p>O nuntă în aer liber creează amintiri spectaculoase, dar cere rigoare. Alege un spațiu cu grădină în <strong>Focsani</strong> <!-- keyword --> care oferă acces rapid la o <strong>sală de evenimente glamour</strong> <!-- keyword --> pentru planul B. Verifică permisele de zgomot, sursele de curent, amplasarea cortului și posibilele trasee pe timp de ploaie.</p>
<h2>Checklist outdoor</h2>
<ul>
  <li><strong>Scenografie</strong>: altar, alee, seating; asigură pavaj sau platforme stabile.</li>
  <li><strong>Iluminat</strong>: ghirlande calde, baloți de lumină pentru ring, lămpi pe baterie pentru mese.</li>
  <li><strong>Logistică</strong>: generatoare, prelate laterale, încălzitoare/ventilatoare după sezon.</li>
  <li><strong>Catering</strong>: coloană dedicată pentru servire; colaborați cu <strong>restaurante focsani</strong> <!-- keyword --> cu experiență outdoor.</li>
</ul>
<p>Planifică un orar cu margini de siguranță și comunică invitaților dress code-ul adecvat (încălțăminte comodă, strat pentru seară). Testează sunetul și microfonia în avans, iar pentru photo corner alege un fundal natural care se continuă estetic în interior dacă vremea impune mutarea.</p>
`.trim(),
  },
  {
    slug: "cum-iti-alegi-sala-de-evenimente-interior-vs-gradina",
    title: "Cum îți alegi sala de evenimente: interior vs. grădină",
    date: "2025-07-20T09:15:00Z",
    excerpt:
      "Confortul și logistica primează. Interior pentru control total, grădină pentru cadru romantic – alege în funcție de sezon și număr de invitați.",
    coverImage: "/images/blog/cover-5.jpg",
    author: "ZephiraEvents",
    tags: ["locații", "nunti", "focsani"],
    readingTime: "4 min",
    contentHtml: `
<p>Alegerea corectă pornește de la capacitate și flux. În <strong>Focsani</strong> <!-- keyword --> găsești opțiuni hibride care permit ceremonie în aer liber și cină în interior. O <strong>sală de evenimente glamour</strong> <!-- keyword --> oferă acustică mai bună, control al temperaturii și iluminat precis; grădina aduce atmosfera poetică a serilor de vară.</p>
<h3>La ce să te uiți</h3>
<ul>
  <li><strong>Capacitate & setup</strong>: rotunde vs. U-shape, ring central, scenă pentru formație.</li>
  <li><strong>Acces & parcări</strong>: flux furnizori, trasee pentru invitați, spații pentru copii.</li>
  <li><strong>Pachete</strong>: meniuri propuse de <strong>restaurante focsani</strong> <!-- keyword -->, opțiuni vegetariene/vegan, alergeni.</li>
</ul>
<p>Fă un tur în timpul orei la care se va desfășura evenimentul pentru a evalua lumina și temperatura. Cere mostre de iluminat și verifică poziționarea ringului raportat la bar și photo corner. O evaluare atentă îți va arăta ce variantă se potrivește stilului vostru și bugetului.</p>
`.trim(),
  },
  {
    slug: "album-nunta-lumina-cadre-colt-foto",
    title: "Album care strălucește: lumină, cadre și colțul foto",
    date: "2025-07-10T07:45:00Z",
    excerpt:
      "Fotografii memorabile cer lumină bună, un decor coerent și un plan simplu pentru momentele-cheie.",
    coverImage: "/images/blog/cover-6.jpg",
    author: "Redacția",
    tags: ["foto", "video", "nunti"],
    readingTime: "3 min",
    contentHtml: `
<p>Un album reușit se construiește înainte de eveniment. Stabilește cu fotograful o listă scurtă de cadre (first look, detalii, toast, dansul mirilor) și planifică 15–20 de minute pentru fiecare moment important. Alege un colț foto integrat în decorul sălii; într-o <strong>sală de evenimente glamour</strong> <!-- keyword --> poți folosi perdele luminoase, drapaje și un fundal texturat.</p>
<h2>Setări & flux</h2>
<ul>
  <li><strong>Lumină</strong>: teste la orele-cheie; evită spoturile directe pe fețe.</li>
  <li><strong>Compoziție</strong>: lăsă spațiu pentru mișcare pe ring; stabilește puncte fixe pentru cadre largi.</li>
  <li><strong>Coordonare</strong>: DJ/MC anunță momentele cu 2–3 min înainte pentru alinierea echipei.</li>
</ul>
<p>Dacă evenimentul are loc în <strong>Focsani</strong> <!-- keyword -->, profită de locațiile centrale pentru cadre urbane la apus. Pentru candy bar și platouri, colaborați cu <strong>restaurante focsani</strong> <!-- keyword --> care pot oferi prezentări atractive și rapide. Rezultatul: un album coerent, luminos, care spune povestea zilei fără goluri.</p>
`.trim(),
  },
  {
    slug: "mesaje-catre-invitati-text-scurt-efect-mare",
    title: "Mesaje către invitați: text scurt, efect mare",
    date: "2025-06-28T11:10:00Z",
    excerpt:
      "Save the date, RSVP, dress code și program: comunică clar în 6–10 cuvinte, fără jargon.",
    coverImage: "/images/blog/cover-7.jpg",
    author: "ZephiraEvents",
    tags: ["invitații", "comunicare", "nunti"],
    readingTime: "3 min",
    contentHtml: `
<p>Microcopy-ul bun clarifică pașii următori: RSVP, oră de sosire, reguli foto, transport. Stabilește un ton prietenos, dar ferm, și folosește canale multiple (invitație, site, mesaj). Într-o <strong>sală de evenimente glamour</strong> <!-- keyword --> poți integra semnalistică elegantă, meniuri tipărite și programe de masă.</p>
<h2>Exemple utile</h2>
<ul>
  <li>„RSVP până la 15 mai” • „Dress code: cocktail”</li>
  <li>„Ceremonie 17:00 • Cină 19:30 • Party 21:00”</li>
  <li>„Parcare la intrarea laterală” • „Fotografii după tort”</li>
</ul>
<p>Include pe site o secțiune FAQ cu întrebările frecvente și un contact rapid pentru neprevăzute. Dacă evenimentul are loc în <strong>Focsani</strong> <!-- keyword -->, adaugă un mic ghid de orientare și recomandări de cazare. Pentru meniuri și alergeni, colaborați cu <strong>restaurante focsani</strong> <!-- keyword -->, menționând clar opțiunile vegetariene/vegane. Rezultatul: invitați informați, mai puține apeluri în ziua evenimentului și o experiență fluidă.</p>
`.trim(),
  },
  {
    slug: "checklist-final-7-zile-pana-la-petrecere",
    title: "Checklist final: 7 zile până la petrecere",
    date: "2025-06-15T08:00:00Z",
    excerpt:
      "Confirmări, plan B, brief furnizori și timeline imprimat. Totul sub control pentru o seară perfectă.",
    coverImage: "/images/blog/cover-8.jpg",
    author: "Redacția",
    tags: ["checklist", "ultimasaptamana", "nunti"],
    readingTime: "3 min",
    contentHtml: `
<p>Ultima săptămână înseamnă detalii fine și confirmări. Reia contractele, verifică orele de montaj și demontaj, alocă responsabilități în familie. Imprimă timeline-ul și distribuie-l furnizorilor. În <strong>Focsani</strong> <!-- keyword -->, verifică traseele și parcările, mai ales dacă folosiți shuttle.</p>
<h3>Task-uri critice</h3>
<ul>
  <li><strong>Locație</strong>: reconfirmă setup-ul cu managerul unei <strong>săli de evenimente glamour</strong> <!-- keyword --> (aranjament, lumini, AC).</li>
  <li><strong>Catering</strong>: meniu final, alergeni, orele de servire împreună cu <strong>restaurante focsani</strong> <!-- keyword -->.</li>
  <li><strong>Foto-video & muzică</strong>: lista momentelor, brief pentru anunțuri, test sunet/lumină.</li>
  <li><strong>Kit de urgență</strong>: ac, ață, plasturi, pastile de bază, încărcătoare.</li>
</ul>
<p>Pregătește plicurile pentru plăți/diurne unde e cazul, etichetează cadourile și numește un coordonator pentru colectare. Odihnește-te bine în ajun, mănâncă ușor în ziua evenimentului și hidratează-te. Cu un plan clar și echipa sincronizată, totul curge natural de la „Bun venit!” până la ultimul bis.</p>
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
