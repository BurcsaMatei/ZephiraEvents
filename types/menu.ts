// types/menu.ts
// ==============================
// Tipuri pentru meniuri de eveniment (ZephiraEvents)
// ==============================

// ==============================
// Types
// ==============================

export type EventType =
  | "Nunta"
  | "Botez & Cununie"
  | "Corporate & Team Building"
  | "Petreceri Private & Majorate";

export interface MenuSections {
  starterRece: string[];
  antreuCald: string;
  felIntermediar: string;
  felPrincipal: string | string[];
  pachetBar: string[];
}

export interface Menu {
  slug: string;
  title: string;
  pricePerPers: number;
  currency: string; // ex. "EUR" | "RON"
  image: string;
  imageAlt: string;
  eventType: EventType;
  sections: MenuSections;
}

export const EVENT_TYPES: EventType[] = [
  "Nunta",
  "Botez & Cununie",
  "Corporate & Team Building",
  "Petreceri Private & Majorate",
];
