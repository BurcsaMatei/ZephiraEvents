// styles/errorPages.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Layout
// ==============================
export const errorWrap = style({
  minHeight: "50vh",
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: vars.color.text,
  padding: vars.space.lg,
});

export const errorCard = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: `${vars.space.lg} ${vars.space.xl}`,
  boxShadow: vars.shadow.md,
  maxWidth: 540,
  width: "100%",
});

// ==============================
// Typography
// ==============================
export const errorTitle = style({
  fontSize: "1.8rem",
  fontWeight: 700,
  marginBottom: vars.space.sm,
  "@media": {
    "screen and (min-width: 768px)": {
      fontSize: "2rem",
    },
  },
});

export const errorText = style({
  opacity: 0.9,
  marginBottom: vars.space.md,
});

// ==============================
// Actions
// ==============================
export const errorLink = style({
  color: vars.color.link,
  textDecoration: "none",
  fontWeight: 700,
  transition: "color .15s ease-in-out",
  selectors: {
    "&:hover": { textDecoration: "underline" },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 2,
      borderRadius: vars.radius.sm,
    },
  },
  "@media": {
    "(prefers-contrast: more)": {
      selectors: {
        "&:focus-visible": { outlineWidth: 3 },
      },
    },
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

/** Wrapper pentru mai multe acțiuni (dacă vei avea 2+ link-uri). */
export const errorActions = style({
  display: "flex",
  gap: vars.space.sm,
  justifyContent: "center",
});

/** Link inline pentru text (mai discret decât CTA-ul principal). */
export const errorInlineLink = style({
  color: vars.color.link,
  textDecoration: "none",
  fontWeight: 500,
  selectors: {
    "&:hover": { textDecoration: "underline" },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 2,
      borderRadius: vars.radius.sm, // ← fix: sm în loc de xs
    },
  },
  "@media": {
    "(prefers-contrast: more)": {
      selectors: { "&:focus-visible": { outlineWidth: 3 } },
    },
  },
});
