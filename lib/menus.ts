// lib/menus.ts
// ==============================
// Helperi pentru meniuri de eveniment (citire/filtrare build-time)
// ==============================

// ==============================
// Imports
// ==============================
import menusJson from "../data/menus.json";
import type { EventType, Menu } from "../types/menu";

// ==============================
// Dev utils
// ==============================
function isDev(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}

function devWarn(msg: string, ...args: unknown[]): void {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn(`[lib/menus] ${msg}`, ...args);
  }
}

// ==============================
// Constante interne
// ==============================
const allMenus: Menu[] = menusJson as unknown as Menu[];

// ==============================
// Utils
// ==============================
export function getAllMenus(): Menu[] {
  return allMenus;
}

export function getMenusByEventType(eventType: EventType): Menu[] {
  const filtered = allMenus.filter((menu) => menu.eventType === eventType);

  if (isDev() && filtered.length === 0) {
    devWarn("Nu am găsit meniuri pentru eventType=%s", eventType);
  }

  return filtered;
}

export function getMenuBySlug(slug: string): Menu | null {
  const found = allMenus.find((m) => m.slug === slug) ?? null;

  if (isDev() && !found) {
    devWarn("Nu am găsit meniu pentru slug=%s", slug);
  }

  return found;
}

export function getEventTypeAnchorHref(eventType: EventType): string {
  switch (eventType) {
    case "Nunta":
      return "/servicii#meniuri-nunta";
    case "Botez & Cununie":
      return "/servicii#meniuri-botez-cununie";
    case "Petreceri Private & Majorate":
      return "/servicii#meniuri-petreceri-private-majorate";
    case "Corporate & Team Building":
      return "/servicii#meniuri-corporate-team-building";
    default: {
      const _exhaustive: never = eventType;
      return _exhaustive;
    }
  }
}
