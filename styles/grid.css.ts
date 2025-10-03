// styles/grid.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq } from "./theme.css";

// ==============================
// Classes
// ==============================

/** Bază comună (gap, alinieri) */
export const gridBase = style({
  display: "grid",
  gap: "var(--gap, 24px)",
  justifyItems: "var(--justify, stretch)",
  alignItems: "var(--align, stretch)",
});

/** Mod FIXED: număr fix de coloane pe breakpoints (md / lg / xl) */
export const gridFixed = style({
  // mobile / default
  gridTemplateColumns: "repeat(var(--cols-base, var(--mobileCols, 2)), minmax(0, 1fr))",

  "@media": {
    // md
    [mq.md]: {
      gridTemplateColumns:
        "repeat(var(--cols-md, var(--cols-base, var(--mobileCols, 2))), minmax(0, 1fr))",
    },

    // lg (preferă --cols-lg; fallback pe desktopCols/cols-md/cols-base)
    [mq.lg]: {
      gridTemplateColumns:
        "repeat(var(--cols-lg, var(--desktopCols, var(--cols-md, var(--cols-base, var(--mobileCols, 2))))), minmax(0, 1fr))",
    },

    // xl (opțional)
    [mq.xl]: {
      gridTemplateColumns:
        "repeat(var(--cols-xl, var(--cols-lg, var(--desktopCols, var(--cols-md, var(--cols-base, var(--mobileCols, 2)))))), minmax(0, 1fr))",
    },
  },
});

/** Mod FLUID: umple rândul cu coloane de min. `--minCol-*` (responsive) */
export const gridFluid = style({
  gridTemplateColumns: "repeat(auto-fit, minmax(var(--minCol-base, var(--minCol, 240px)), 1fr))",

  "@media": {
    [mq.md]: {
      gridTemplateColumns:
        "repeat(auto-fit, minmax(var(--minCol-md, var(--minCol-base, var(--minCol, 240px))), 1fr))",
    },
    [mq.lg]: {
      gridTemplateColumns:
        "repeat(auto-fit, minmax(var(--minCol-lg, var(--minCol-md, var(--minCol-base, var(--minCol, 240px)))), 1fr))",
    },
    [mq.xl]: {
      gridTemplateColumns:
        "repeat(auto-fit, minmax(var(--minCol-xl, var(--minCol-lg, var(--minCol-md, var(--minCol-base, var(--minCol, 240px))))), 1fr))",
    },
  },
});

/** Alias de compatibilitate (dacă e importat în altă parte) */
export const grid = gridBase;
