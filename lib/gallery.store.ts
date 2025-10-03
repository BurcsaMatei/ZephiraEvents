// lib/gallery.store.ts

// ==============================
// Imports
// ==============================
import { useSyncExternalStore } from "react";

import type { GalleryItem } from "./gallery/schema";

// ==============================
// Types
// ==============================

/** Starea lightbox-ului/galeriei */
export type GalleryState = { index: number; open: boolean };

/** API acțiuni */
type GalleryActions = {
  setOpen: (v: boolean) => void;
  setIndex: (i: number) => void;
  openAt: (i: number) => void;
  openBySrc: (src: string) => void;
  openById: (id: string) => void;
  openNext: () => void;
  openPrev: () => void;
  openFirst: () => void;
  openLast: () => void;
  reset: () => void;

  /** Setează navigarea circulară (wrap) la capete */
  setLoop: (v: boolean) => void;
};

// ==============================
// Dev utils
// ==============================
function devWarn(msg: string, ...args: unknown[]) {
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[gallery.store.ts] ${msg}`, ...args);
  }
}

// ==============================
// Date & Mapări (reconfigurabile)
// ==============================
let ITEMS: GalleryItem[] = []; // inițial gol; populați prin initGallery(...)
let SRC_TO_INDEX = new Map<string, number>();
let ID_TO_INDEX = new Map<string, number>();

function rebuildMaps(): void {
  SRC_TO_INDEX = new Map(ITEMS.map((it, i) => [it.src, i] as const));
  ID_TO_INDEX = new Map(ITEMS.map((it, i) => [it.id, i] as const));
}
rebuildMaps();

// ==============================
// Store intern (state + listeners)
// ==============================
let state: GalleryState = { index: 0, open: false };
const listeners = new Set<() => void>();

function shallowEqualState(a: GalleryState, b: GalleryState): boolean {
  return a.index === b.index && a.open === b.open;
}

function getSnapshot(): GalleryState {
  return state;
}
function emit(): void {
  listeners.forEach((l) => l());
}
function setState(patch: Partial<GalleryState>): void {
  const next: GalleryState = { ...state, ...patch };
  if (shallowEqualState(state, next)) return;
  state = next;
  emit();
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ==============================
// Utils
// ==============================
let LOOP = false;

const clamp = (i: number) => Math.max(0, Math.min(i, Math.max(ITEMS.length - 1, 0)));

function nextIndex(i: number): number {
  if (ITEMS.length === 0) return 0;
  return LOOP ? (i + 1) % ITEMS.length : clamp(i + 1);
}
function prevIndex(i: number): number {
  if (ITEMS.length === 0) return 0;
  return LOOP ? (i - 1 + ITEMS.length) % ITEMS.length : clamp(i - 1);
}

function ensureNonEmptyOrWarn(action: string): boolean {
  if (ITEMS.length > 0) return true;
  devWarn(`${action}: galerie goală.`);
  setState({ open: false, index: 0 });
  return false;
}

// ==============================
// Selectoare (public API)
// ==============================
export function getItems(): readonly GalleryItem[] {
  return ITEMS as readonly GalleryItem[];
}
export function getLength(): number {
  return ITEMS.length;
}
export function getCurrent(): GalleryItem | null {
  return ITEMS[state.index] ?? null;
}

/** Hook read-only pentru lista de item-uri (se actualizează la initGallery). */
export function useGalleryItems(): readonly GalleryItem[] {
  return useSyncExternalStore(
    subscribe,
    () => ITEMS,
    () => ITEMS,
  ) as readonly GalleryItem[];
}

// ==============================
// Actions
// ==============================
const actions: GalleryActions = {
  setOpen: (v) => {
    if (v && ITEMS.length === 0) {
      devWarn("setOpen(true): galerie goală — forțez închis.");
      setState({ open: false, index: 0 });
      return;
    }
    setState({ open: v });
  },

  setIndex: (i) => setState({ index: clamp(i) }),

  openAt: (i) => {
    if (!ensureNonEmptyOrWarn("openAt")) return;
    setState({ open: true, index: clamp(i) });
  },

  openBySrc: (src) => {
    if (!ensureNonEmptyOrWarn("openBySrc")) return;
    const i = SRC_TO_INDEX.get(src);
    if (typeof i === "number") actions.openAt(i);
    else devWarn("openBySrc: src negăsit în galerie:", src);
  },

  openById: (id) => {
    if (!ensureNonEmptyOrWarn("openById")) return;
    const i = ID_TO_INDEX.get(id);
    if (typeof i === "number") actions.openAt(i);
    else devWarn("openById: id negăsit în galerie:", id);
  },

  openNext: () => {
    if (!ensureNonEmptyOrWarn("openNext")) return;
    setState({ open: true, index: nextIndex(state.index) });
  },
  openPrev: () => {
    if (!ensureNonEmptyOrWarn("openPrev")) return;
    setState({ open: true, index: prevIndex(state.index) });
  },
  openFirst: () => {
    if (!ensureNonEmptyOrWarn("openFirst")) return;
    setState({ open: true, index: 0 });
  },
  openLast: () => {
    if (!ensureNonEmptyOrWarn("openLast")) return;
    setState({ open: true, index: Math.max(ITEMS.length - 1, 0) });
  },

  reset: () => setState({ open: false, index: 0 }),

  setLoop: (v) => {
    LOOP = !!v;
  },
};

// ==============================
// Hook principal
// ==============================
/** Hook: stare + acțiuni */
export function useGalleryStore(): GalleryState & GalleryActions {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...s, ...actions };
}

// ==============================
// API de reinițializare (dinamică)
// ==============================
/**
 * Re-initializează galeria (ex. când vin item-uri din CMS).
 * - elimină item-urile invalide
 * - de-duplicate pe baza `id` și `src` (păstrează prima apariție)
 * - reconstruiește mapările
 * - ajustează indexul curent la noua lungime
 */
export function initGallery(items: GalleryItem[]): void {
  const valid = items.filter(
    (it) => typeof it?.src === "string" && !!it.src && typeof it?.id === "string" && !!it.id,
  );

  const byId = new Set<string>();
  const bySrc = new Set<string>();
  const dedup: GalleryItem[] = [];
  for (const it of valid) {
    let dup = false;
    if (byId.has(it.id)) {
      devWarn("initGallery: id duplicat — ignor:", it.id);
      dup = true;
    }
    if (bySrc.has(it.src)) {
      devWarn("initGallery: src duplicat — ignor:", it.src);
      dup = true;
    }
    if (!dup) {
      byId.add(it.id);
      bySrc.add(it.src);
      dedup.push(it);
    }
  }

  ITEMS = dedup;
  rebuildMaps();
  setState({ index: clamp(state.index) });
}

// ==============================
// Exporturi suplimentare
// ==============================
/** Acțiuni standalone, dacă ai nevoie fără hook */
export const galleryActions = actions;
/** Debug/UI: citește starea LOOP curentă */
export function getLoop(): boolean {
  return LOOP;
}
