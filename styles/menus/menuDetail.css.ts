// styles/menus/menuDetail.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Classes
// ==============================
export const metaRow = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: vars.space.sm,
  marginBottom: vars.space.lg,
});

export const pill = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: 999,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.text,
  fontWeight: 600,
  fontSize: "0.95rem",
});

export const backLink = style({
  display: "inline-flex",
  alignItems: "center",
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: 999,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.cardBg,
  color: vars.color.text,
  textDecoration: "none",
  fontWeight: 700,
  selectors: {
    "&:hover": { borderColor: vars.color.primary },
    "&:focus": { outline: "none" },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.focus}`,
    },
  },
});

export const sectionsGrid = style({
  display: "grid",
  gap: vars.space.lg,
  "@media": {
    [mq.md]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
});

export const paragraph = style({
  margin: 0,
});
