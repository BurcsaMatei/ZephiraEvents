// lib/menus.public.ts

// ==============================
// Imports
// ==============================
import rawMenus from "../data/menus.json";

// ==============================
// Types
// ==============================
export type EventTypeSlug = "nunta" | "botez-cununie" | "private-majorate" | "corporate";

export interface PublicMenuItem {
  slug: string;
  title: string;
}

export interface PublicEventType {
  eventTypeSlug: EventTypeSlug;
  eventTypeLabel: string;
  anchorHref: string;
  menus: PublicMenuItem[];
}

// Structura minimă a unui meniu din JSON-ul consolidat
interface RawMenu {
  slug: string;
  title: string;
  eventType: string; // ex. "Nunta", "Botez & Cununie", etc.
}

// ==============================
// Constante
// ==============================

// Mapping central (slug → label uman)
const EVENT_TYPE_LABELS: Record<EventTypeSlug, string> = {
  nunta: "Nuntă",
  "botez-cununie": "Botez & Cununie",
  "private-majorate": "Petreceri Private & Majorate",
  corporate: "Corporate & Team Building",
};

// Mapping pentru ancorele din /servicii
const EVENT_TYPE_ANCHORS: Record<EventTypeSlug, string> = {
  nunta: "/servicii#meniuri-nunta",
  "botez-cununie": "/servicii#meniuri-botez-cununie",
  "private-majorate": "/servicii#meniuri-petreceri-private-majorate",
  corporate: "/servicii#meniuri-corporate-team-building",
};

// Mapping invers: label JSON → slug
const LABEL_TO_SLUG: Record<string, EventTypeSlug> = {
  Nunta: "nunta",
  "Botez & Cununie": "botez-cununie",
  "Petreceri Private & Majorate": "private-majorate",
  "Corporate & Team Building": "corporate",
};

// ==============================
// Utils
// ==============================
function createEmptyEventType(slug: EventTypeSlug): PublicEventType {
  return {
    eventTypeSlug: slug,
    eventTypeLabel: EVENT_TYPE_LABELS[slug],
    anchorHref: EVENT_TYPE_ANCHORS[slug],
    menus: [],
  };
}

function buildPublicEventTypes(source: RawMenu[]): PublicEventType[] {
  // Inițializăm toate tipurile cunoscute, în ordinea dorită
  const bySlug: Record<EventTypeSlug, PublicEventType> = {
    nunta: createEmptyEventType("nunta"),
    "botez-cununie": createEmptyEventType("botez-cununie"),
    "private-majorate": createEmptyEventType("private-majorate"),
    corporate: createEmptyEventType("corporate"),
  };

  source.forEach((menu) => {
    const eventTypeSlug = LABEL_TO_SLUG[menu.eventType];
    if (!eventTypeSlug) {
      // Categorie necunoscută în JSON → o ignorăm în mod sigur
      return;
    }

    const target = bySlug[eventTypeSlug];
    target.menus.push({
      slug: menu.slug,
      title: menu.title,
    });
  });

  // Păstrăm doar tipurile care au cel puțin un meniu definit
  const result: PublicEventType[] = Object.values(bySlug).filter((et) => et.menus.length > 0);

  return result;
}

// ==============================
// Public API
// ==============================

const RAW_MENUS_TYPED: RawMenu[] = rawMenus as unknown as RawMenu[];

// Lista completă (UI + validare + email)
export const PUBLIC_EVENT_TYPES: PublicEventType[] = buildPublicEventTypes(RAW_MENUS_TYPED);

// Pentru UI: opțiuni de select „Tip eveniment”
export const EVENT_TYPES_SELECT = PUBLIC_EVENT_TYPES.map((et) => ({
  eventTypeSlug: et.eventTypeSlug,
  eventTypeLabel: et.eventTypeLabel,
}));

// Pentru validare/UI: obține meniurile unui tip de eveniment
export function getMenusForEventType(slug: EventTypeSlug): PublicMenuItem[] {
  const found = PUBLIC_EVENT_TYPES.find((et) => et.eventTypeSlug === slug);
  return found ? found.menus : [];
}

// Pentru validare server: verifică dacă un meniu aparține tipului
export function isMenuValidForEventType(slug: EventTypeSlug, menuSlug: string): boolean {
  if (menuSlug === "nu-sigur") return true;
  return getMenusForEventType(slug).some((m) => m.slug === menuSlug);
}

// Pentru email/UI: label-ul meniului (sau null dacă nu există)
export function getMenuLabel(slug: EventTypeSlug, menuSlug: string): string | null {
  if (menuSlug === "nu-sigur") return "nu-sigur";
  const found = getMenusForEventType(slug).find((m) => m.slug === menuSlug);
  return found ? found.title : null;
}

// Pentru email/UI: label-ul tipului de eveniment
export function getEventTypeLabel(slug: EventTypeSlug): string {
  return EVENT_TYPE_LABELS[slug];
}

// Pentru hint: ancora către pagina de servicii
export function getEventTypeAnchorHref(slug: EventTypeSlug): string {
  return EVENT_TYPE_ANCHORS[slug];
}
