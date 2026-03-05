// styles/sections/tentAtLocationBanner.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Styles
// ==============================
export const root = style({
  position: "relative",
});

export const panel = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  boxShadow: vars.shadow.lg,
  padding: vars.space.lg,
  display: "grid",
  gap: vars.space.md,
  "@media": {
    [mq.lg]: { padding: vars.space.xl },
  },
});

export const eyebrow = style({
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 900,
  fontSize: "0.85rem",
  color: vars.color.text,
  opacity: 0.75,
});

export const title = style({
  margin: 0,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  lineHeight: 1.1,
  fontSize: "clamp(1.35rem, 2.2vw, 1.9rem)",
});

export const lede = style({
  margin: 0,
  color: vars.color.text,
  opacity: 0.92,
  lineHeight: 1.65,
  fontSize: "1.02rem",
  maxWidth: 900,
});

export const list = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: vars.space.sm,
});

export const listItem = style({
  display: "grid",
  gridTemplateColumns: "18px 1fr",
  gap: vars.space.sm,
  alignItems: "start",
  color: vars.color.text,
  opacity: 0.95,
  selectors: {
    "&::before": {
      content: '"✓"',
      fontWeight: 900,
      color: vars.color.link,
      lineHeight: 1.2,
      marginTop: 2,
    },
  },
});

export const ctaRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.sm,
  alignItems: "center",
  marginTop: vars.space.xs,
});

const ctaBase = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${vars.space.sm} ${vars.space.lg}`,
  borderRadius: vars.radius.lg,
  fontWeight: 900,
  textDecoration: "none",
  lineHeight: 1,
  ":focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
});

export const ctaPrimary = style([
  ctaBase,
  {
    background: vars.color.link,
    color: vars.color.bg,
    selectors: {
      "&:hover": { filter: "brightness(1.03)" },
    },
  },
]);

export const ctaSecondary = style([
  ctaBase,
  {
    background: vars.color.surfaceHover,
    color: vars.color.text,
    border: `1px solid ${vars.color.border}`,
    selectors: {
      "&:hover": { background: vars.color.surfaceActive },
    },
  },
]);
