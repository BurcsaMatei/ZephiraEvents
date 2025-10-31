// lib/pageMeta.ts
// ==============================
// Mapare rută → meta pentru OG & Hero (sursa unică de adevăr)
// ==============================

export type PageRoute = "/" | "/servicii" | "/galerie" | "/contact" | "/blog";

export interface PageMeta {
  route: PageRoute;
  title: string;
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
    subtitle: "Evenimente impecabile. Fără stres.",
    heroSrc: "/images/current/hero.jpg",
  },
  "/servicii": {
    route: "/servicii",
    title: "Servicii ZephiraEvents",
    subtitle:
      "Sală de evenimente în Focșani, Vrancea — organizare completă pentru nunți, botezuri, majorate și corporate, cu servicii impecabile și coordonare A-Z.",
    heroSrc: "/images/current/hero-services.jpg",
  },
  "/galerie": {
    route: "/galerie",
    title: "Galerie ZephiraEvents — sală de evenimente în Focșani, Vrancea",
    subtitle:
      "Nunți, botezuri, majorate și evenimente corporate realizate în sala noastră de evenimente din Focșani — servicii impecabile, decoruri atent alese și momente care rămân.",
    heroSrc: "/images/current/hero-gallery.jpg",
  },
  "/contact": {
    route: "/contact",
    title: "Contact ZephiraEvents",
    subtitle:
      "Sală de evenimente în Focșani, Vrancea — scrie-ne pentru nuntă, botez, majorat sau corporate. Îți răspundem rapid cu disponibilitatea sălii și o ofertă adaptată.",
    heroSrc: "/images/current/hero-contact.jpg",
  },
  "/blog": {
    route: "/blog",
    title: "Blog ZephiraEvents",
    subtitle:
      "Ghiduri, liste de verificare și inspirație pentru nunți, botezuri, majorate și corporate în Focșani, Vrancea — sală de evenimente, organizare A-Z și servicii impecabile.",
    heroSrc: "/images/current/hero-index-blog.jpg",
  },
};

export function getPageMeta(path: string): PageMeta {
  const route = normalizeRoute(path);
  return PAGE_META[route] ?? PAGE_META["/"];
}
