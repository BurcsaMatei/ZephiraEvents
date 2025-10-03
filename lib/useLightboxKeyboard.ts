// lib/useLightboxKeyboard.ts

// ==============================
// Imports
// ==============================
import { useEffect, useMemo } from "react";

import { useGalleryStore } from "./gallery.store";

// ==============================
// Utils
// ==============================

/** Ignoră shortcut-urile când ținta este editabilă. */
function isEditableTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  const role = el.getAttribute?.("role");
  return role === "textbox";
}

function hasModifier(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey || e.altKey;
}

function isRtlDocument(): boolean {
  if (typeof document === "undefined") return false;
  return (document.documentElement?.dir || document.body?.dir || "").toLowerCase() === "rtl";
}

// ==============================
// Types & defaults
// ==============================

type KeyMap = {
  next: readonly string[];
  prev: readonly string[];
  first: readonly string[];
  last: readonly string[];
  close: readonly string[];
};

const DEFAULT_KEYMAP: KeyMap = {
  next: ["ArrowRight", "PageDown", " ", "Spacebar", "l", "L"],
  prev: ["ArrowLeft", "PageUp", "Backspace", "h", "H"],
  first: ["Home"],
  last: ["End"],
  close: ["Escape", "Esc"],
};

export type LightboxKeyboardOptions = {
  /** Ascultă în capturing phase (ajută când alte elemente „fură” săgețile). Implicit: false */
  force?: boolean;
  /** Permite autorepeat (ținerea tastei apăsate). Implicit: false */
  allowRepeat?: boolean;
  /** Comportament RTL. 'auto' -> citește din document.dir. Implicit: 'auto' */
  rtl?: boolean | "auto";
  /** Suprascrie/completează maparea de taste. */
  map?: Partial<KeyMap>;
};

// ==============================
// Hook
// ==============================

/**
 * Navigație Lightbox din tastatură (activă doar când lightbox-ul e deschis):
 *  - Next: ArrowRight / PageDown / Space / L
 *  - Prev: ArrowLeft  / PageUp   / Backspace / H
 *  - First/Last: Home / End
 *  - Close: Escape
 */
export function useLightboxKeyboard(options: LightboxKeyboardOptions = {}): void {
  const { open, openNext, openPrev, openFirst, openLast, setOpen } = useGalleryStore();

  // Destructurăm opțiunile o singură dată
  const { force = false, allowRepeat = false, rtl = "auto", map } = options;

  // Combinăm mapările în afara efectului; deps: `map` (rezolvă exhaustive-deps)
  const keymap: KeyMap = useMemo(() => {
    return {
      next: map?.next ? [...DEFAULT_KEYMAP.next, ...map.next] : DEFAULT_KEYMAP.next,
      prev: map?.prev ? [...DEFAULT_KEYMAP.prev, ...map.prev] : DEFAULT_KEYMAP.prev,
      first: map?.first ? [...DEFAULT_KEYMAP.first, ...map.first] : DEFAULT_KEYMAP.first,
      last: map?.last ? [...DEFAULT_KEYMAP.last, ...map.last] : DEFAULT_KEYMAP.last,
      close: map?.close ? [...DEFAULT_KEYMAP.close, ...map.close] : DEFAULT_KEYMAP.close,
    };
  }, [map]);

  useEffect(() => {
    if (!open) return;

    const rtlOn = rtl === "auto" ? isRtlDocument() : !!rtl;
    const match = (e: KeyboardEvent, keys: readonly string[]) => keys.includes(e.key);

    const handler = (e: KeyboardEvent) => {
      if (!allowRepeat && e.repeat) return;
      if (hasModifier(e)) return;
      if (isEditableTarget(e.target)) return;
      if (e.defaultPrevented) return;

      const isNextKeyRaw = match(e, keymap.next);
      const isPrevKeyRaw = match(e, keymap.prev);
      const isNextKey = rtlOn
        ? isPrevKeyRaw ||
          (!isPrevKeyRaw && isNextKeyRaw && !["ArrowLeft", "ArrowRight"].includes(e.key))
        : isNextKeyRaw;
      const isPrevKey = rtlOn
        ? isNextKeyRaw ||
          (!isNextKeyRaw && isPrevKeyRaw && !["ArrowLeft", "ArrowRight"].includes(e.key))
        : isPrevKeyRaw;

      if (isNextKey) {
        e.preventDefault();
        openNext();
        return;
      }
      if (isPrevKey) {
        e.preventDefault();
        openPrev();
        return;
      }
      if (match(e, keymap.first)) {
        e.preventDefault();
        openFirst();
        return;
      }
      if (match(e, keymap.last)) {
        e.preventDefault();
        openLast();
        return;
      }
      if (match(e, keymap.close)) {
        e.preventDefault();
        setOpen(false);
      }
    };

    // Best Practices: explicit options object (no logic change)
    // keydown rămâne non-passive deoarece folosim preventDefault()
    const addOpts: AddEventListenerOptions = { capture: !!force, passive: false };
    window.addEventListener("keydown", handler, addOpts);
    // la remove, folosim direct booleanul (evităm `boolean | undefined`)
    return () => window.removeEventListener("keydown", handler, !!force);
  }, [
    open,
    openNext,
    openPrev,
    openFirst,
    openLast,
    setOpen,
    allowRepeat,
    rtl,
    force,
    keymap, // obiect stabil prin useMemo([map])
  ]);
}
