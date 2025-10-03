// styles/center.css.ts

// ==============================
// Imports
// ==============================
import { style, styleVariants } from "@vanilla-extract/css";

// ==============================
// Types
// ==============================
export type GapSize = keyof typeof gapScale;

// ==============================
// Constante
// ==============================
const gapScale = {
  none: "0",
  xs: "0.25rem", // ~4px
  sm: "0.5rem", // ~8px
  md: "1rem", // ~16px
  lg: "1.5rem", // ~24px
  xl: "2rem", // ~32px
} as const;

// ==============================
// Classes
// ==============================
export const centerColumn = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const centerRow = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
});

export const fullHeight = style({
  minHeight: "100vh",
});

export const fullWidth = style({
  width: "100%",
});

export const gap = styleVariants(gapScale, (value) => ({ gap: value }));

// Compat: exportul vechi `center` (evită breaking changes)
export const center = centerColumn;

// Composed helpers
export const centerColumnFull = style([centerColumn, fullHeight]);
export const centerRowFull = style([centerRow, fullHeight]);
