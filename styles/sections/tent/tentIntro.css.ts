// styles/sections/tentIntro.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "../../theme.css";

// ==============================
// Classes
// ==============================

/* Wrapper centrat, fără card / border */
export const wrap = style({
  margin: "0 auto",
  maxWidth: 760,
  textAlign: "center",
  display: "grid",
  gap: vars.space.md,
});

/* Eyebrow — badge capsulă, identic cu IntroSection / Outro */
export const eyebrow = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
  padding: `2px ${vars.space.sm}`,
  borderRadius: "9999px",
  fontWeight: 750,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: vars.color.text,
  margin: "0 auto",
  background: `linear-gradient(90deg,
    color-mix(in srgb, ${vars.color.primary} 15%, transparent) 0%,
    color-mix(in srgb, ${vars.color.primary} 6%, transparent) 100%
  )`,
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${vars.color.border} 78%, transparent)`,
});

/* Heading — gradient text, identic cu Outro */
export const heading = style({
  margin: 0,
  fontWeight: 850,
  fontSize: "clamp(26px, 3.2vw, 42px)",
  lineHeight: 1.12,
  letterSpacing: "0.008em",
  color: vars.color.text,
  "@supports": {
    "(background-clip: text)": {
      backgroundImage: `linear-gradient(90deg,
        color-mix(in srgb, ${vars.color.text} 96%, ${vars.color.primary} 4%) 0%,
        color-mix(in srgb, ${vars.color.primary} 70%, ${vars.color.text} 30%) 50%,
        color-mix(in srgb, ${vars.color.primary} 85%, ${vars.color.text} 15%) 100%
      )`,
      backgroundClip: "text",
      color: "transparent",
    },
    "(-webkit-background-clip: text)": {
      backgroundImage: `linear-gradient(90deg,
        color-mix(in srgb, ${vars.color.text} 96%, ${vars.color.primary} 4%) 0%,
        color-mix(in srgb, ${vars.color.primary} 70%, ${vars.color.text} 30%) 50%,
        color-mix(in srgb, ${vars.color.primary} 85%, ${vars.color.text} 15%) 100%
      )`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
});

/* Lede */
export const lede = style({
  margin: 0,
  color: vars.color.muted,
  fontWeight: 560,
  lineHeight: 1.65,
  maxWidth: "68ch",
  marginInline: "auto",
});

/* Listă — centrată ca bloc, text stânga */
export const list = style({
  listStyle: "none",
  padding: 0,
  margin: `${vars.space.sm} auto 0`,
  maxWidth: 600,
  display: "grid",
  gap: vars.space.sm,
  textAlign: "left",
});

/* Item cu ✓ accent */
export const listItem = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: vars.space.sm,
  alignItems: "start",
  color: vars.color.text,
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

/* Rând CTA — centrat */
export const ctaRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: vars.space.xs,
});
