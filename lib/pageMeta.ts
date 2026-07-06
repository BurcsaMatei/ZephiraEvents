// lib/pageMeta.ts
// ==============================
// Mapare rută → meta pentru OG & Hero (sursa unică de adevăr)
// ==============================

export type PageRoute =
  | "/"
  | "/servicii"
  | "/galerie"
  | "/contact"
  | "/blog"
  | "/cort-evenimente-la-locatia-ta"
  | "/reviews"
  | "/faq";

export interface PageMeta {
  route: PageRoute;
  title: string;
  description?: string; // meta description SEO (≤160 chars)
  subtitle?: string;
  heroSrc: string; // public/ path (relativ la rădăcină)
}

// Normalizare rute: ex. "/services/" -> "/servicii"
function normalizeRoute(path: string): PageRoute {
  const [first = "/"] = (path ?? "/").split(/[?#]/); // evită undefined
  const raw = first.trim();
  if (!raw || raw === "/") return "/";
  const clean = `/${raw.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  switch (clean) {
    case "/servicii":
    case "/galerie":
    case "/contact":
    case "/blog":
    case "/cort-evenimente-la-locatia-ta":
    case "/reviews":
    case "/faq":
      return clean;
    default:
      return "/";
  }
}

// ==============================
// Date implicite pentru pagini (ZephiraEvents)
// ==============================
const PAGE_META: Record<PageRoute, PageMeta> = {
  "/": {
    route: "/",
    title: "ZephiraEvents — sală de evenimente în Focșani, Vrancea",
    description:
      "Sală de evenimente premium în Focșani, Vrancea — nunți, botezuri, majorate și corporate. Organizare A-Z, meniuri personalizate, cort exterior la locația ta și servicii impecabile.",
    subtitle: "Evenimente impecabile. Fără stres.",
    heroSrc: "/images/current/hero.webp",
  },
  "/servicii": {
    route: "/servicii",
    title: "Servicii ZephiraEvents",
    description:
      "ZephiraEvents oferă organizare completă pentru nunți, botezuri, majorate și corporate în Focșani, Vrancea — sală de evenimente, meniu personalizat, decor, foto-video, DJ, coordonare A–Z și servicii impecabile.",
    subtitle:
      "Sală de evenimente în Focșani, Vrancea — organizare completă pentru nunți, botezuri, majorate și corporate, cu servicii impecabile și coordonare A-Z.",
    heroSrc: "/images/current/hero-services.webp",
  },
  "/galerie": {
    route: "/galerie",
    title: "Galerie ZephiraEvents — sală de evenimente în Focșani, Vrancea",
    description:
      "Nunți, botezuri, majorate și evenimente corporate realizate la ZephiraEvents din Focșani, Vrancea — decoruri atent alese, servicii impecabile și momente care rămân. Galerie foto reală.",
    subtitle:
      "Nunți, botezuri, majorate și evenimente corporate realizate în sala noastră de evenimente din Focșani — servicii impecabile, decoruri atent alese și momente care rămân.",
    heroSrc: "/images/current/hero-gallery.webp",
  },
  "/contact": {
    route: "/contact",
    title: "Contact ZephiraEvents",
    description:
      "Contactează ZephiraEvents pentru nunți, botezuri, majorate și corporate în Focșani, Vrancea. Verifică disponibilitatea sălii, solicită ofertă personalizată și beneficiezi de răspuns rapid.",
    subtitle:
      "Sală de evenimente în Focșani, Vrancea — scrie-ne pentru nuntă, botez, majorat sau corporate. Îți răspundem rapid cu disponibilitatea sălii și o ofertă adaptată.",
    heroSrc: "/images/current/hero-contact.webp",
  },
  "/blog": {
    route: "/blog",
    title: "Blog ZephiraEvents",
    description:
      "Sfaturi și idei pentru organizarea de nunți, botezuri, majorate și corporate în Focșani, județul Vrancea — inspirație pentru sală, decor, meniu și servicii impecabile.",
    subtitle:
      "Ghiduri, liste de verificare și inspirație pentru nunți, botezuri, majorate și corporate în Focșani, Vrancea — sală de evenimente, organizare A-Z și servicii impecabile.",
    heroSrc: "/images/current/hero-index-blog.webp",
  },
  "/cort-evenimente-la-locatia-ta": {
    route: "/cort-evenimente-la-locatia-ta",
    title: "Cort de evenimente la locația ta — organizare completă A–Z",
    description:
      "ZephiraEvents amplasează un cort premium la locația aleasă de tine și se ocupă de tot: organizare, meniu & catering, servire și coordonare A–Z — pentru un eveniment impecabil, fără stres.",
    subtitle:
      "Amplasăm cortul, organizăm, gătim, servim și coordonăm A–Z — tu alegi locația, noi ne ocupăm de restul.",
    heroSrc: "/images/current/hero-tent.webp",
  },
  "/reviews": {
    route: "/reviews",
    title: "Recenzii clienți — sală de evenimente ZephiraEvents, Focșani",
    description:
      "Descoperă ce spun clienții ZephiraEvents despre nunțile, botezurile, majoratele și evenimentele corporate organizate la sala noastră din Focșani, județul Vrancea. Recenzii reale de la cupluri și firme.",
    subtitle: "Ce spun clienții noștri",
    heroSrc: "/images/current/hero.webp",
  },
  "/faq": {
    route: "/faq",
    title: "Întrebări frecvente — sală de evenimente ZephiraEvents, Focșani",
    description:
      "Răspunsuri clare despre ZephiraEvents din Focșani, Vrancea — prețuri per persoană, capacitatea sălii (până la 250 de persoane), cort exterior, rezervare, program, personalizare meniu și operatorul legal.",
    subtitle: "Răspunsuri la cele mai frecvente întrebări despre sală, meniuri și servicii",
    heroSrc: "/images/current/hero.webp",
  },
};

export function getPageMeta(path: string): PageMeta {
  const route = normalizeRoute(path);
  return PAGE_META[route] ?? PAGE_META["/"];
}
