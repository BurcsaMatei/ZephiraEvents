// styles/pwaCta.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Tokens & utilities
// ==============================
/** Dimensiuni & layer */
const WIDTH = "min(640px, calc(100vw - 32px))";

// ==============================
// Classes
// ==============================
/**
 * Wrapper full-screen: controlează vizibilitatea (opacity) și captează click-away
 * printr-un backdrop transparent.
 */
export const pwaRoot = style({
  position: "fixed",
  inset: 0,
  zIndex: parseInt(vars.z.modal, 10) || 1100,
  pointerEvents: "none", // activăm doar pe copii (backdrop/box)
  opacity: 0,
  transition: `opacity ${vars.motion.normal} ${vars.motion.easing}`,
});

export const pwaOpen = style({
  opacity: 1,
});

/** Backdrop transparent pentru click-away */
export const backdrop = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "auto",
  background: "transparent",
});

/** Ancoră pentru card (colț dreapta-jos) + animație intrare */
export const boxWrap = style({
  position: "absolute",
  right: "16px",
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
  pointerEvents: "none", // click doar pe .box
  transform: "translateY(12px)",
  transition: `transform ${vars.motion.normal} ${vars.motion.easing}`,
});

export const boxOpen = style({
  transform: "translateY(0)",
});

/** Cutia efectivă (card floating, non-fullscreen) */
export const box = style({
  position: "relative",
  pointerEvents: "auto",
  width: "max-content",
  maxWidth: WIDTH,
  borderRadius: 16,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  // Fallback + mix: dacă browserul nu suportă color-mix, rămâne backgroundColor
  backgroundColor: vars.color.surface,
  background: `color-mix(in oklab, ${vars.color.surface} 88%, transparent)`,
  boxShadow: vars.shadow.md,
  border: `1px solid ${vars.color.border}`,
  padding: 8,
  color: vars.color.text,
});

/** Close (×) — discret, hit area bună */
export const closeBtn = style({
  position: "absolute",
  top: 6,
  right: 8,
  width: 32,
  height: 32,
  lineHeight: "32px",
  textAlign: "center",
  borderRadius: 8,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 22,
  color: vars.color.muted,
  transition: `background ${vars.motion.normal} ${vars.motion.easing}, color ${vars.motion.normal} ${vars.motion.easing}, transform ${vars.motion.fast} ${vars.motion.easing}`,
  selectors: {
    "&:hover": { background: vars.color.surfaceHover, color: vars.color.text },
    "&:active": { transform: "scale(0.98)" },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  },
});

/** Logo mic din meta (stânga titlului) */
export const logoWrap = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 8,
  background: vars.color.surfaceHover,
  marginRight: 8,
});

export const logo = style({
  display: "block",
  width: 24,
  height: 24,
});

/** Conținut card */
export const content = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 12,
  color: vars.color.text,
});

export const headerRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});

export const title = style({
  margin: 0,
  fontWeight: 700,
  fontSize: "1rem",
  lineHeight: 1.2,
  textAlign: "center",
  color: vars.color.text,
});

export const excerpt = style({
  margin: 0,
  fontSize: "0.92rem",
  lineHeight: 1.35,
  textAlign: "center",
  color: vars.color.muted,
});

export const actions = style({
  marginTop: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// ==============================
// Global styles
// ==============================
/** Respectă preferința utilizatorului pentru motion redus */
globalStyle("@media (prefers-reduced-motion: reduce)", {
  [`${pwaRoot}`]: { transition: "none" },
  [`${boxWrap}`]: { transition: "none", transform: "none" },
});
