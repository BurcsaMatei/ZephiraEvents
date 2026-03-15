// styles/sections/waiterBarSection.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import { btn, primary } from "../button.css";
import { cardSmall } from "../services.css";
import { mq, vars } from "../theme.css";

// ==============================
// Layout
// ==============================

/* Rând 3 coloane: imagine | text | imagine — se aliniază jos pe bandă */
export const imageRow = style({
  display: "grid",
  gridTemplateColumns: "1fr 2fr 1fr",
  alignItems: "end",
  "@media": {
    [mq.lg]: {
      gridTemplateColumns: "1fr 2fr 1fr",
    },
  },
});

/* Coloană imagine */
export const imageCol = style({
  position: "relative",
  overflow: "hidden",
  height: 200,
  "@media": {
    [mq.lg]: {
      height: 380,
    },
  },
});

/* Bloc text deasupra imageRow — vizibil doar pe mobile */
export const textTop = style({
  textAlign: "center",
  paddingBlock: vars.space.md,
  paddingInline: vars.space.sm,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space.md,
  "@media": {
    [mq.lg]: {
      display: "none",
    },
  },
});

/* Bloc CTA în coloana centrală a imageRow — vizibil doar pe mobile */
export const textBottom = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.md,
  paddingInline: vars.space.sm,
  "@media": {
    [mq.lg]: {
      display: "none",
    },
  },
});

/* Coloană text centrată — vizibilă doar pe desktop */
export const textCol = style({
  textAlign: "center",
  paddingBlock: vars.space.xl,
  paddingInline: vars.space.xl,
  display: "none",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space.md,
  "@media": {
    [mq.lg]: {
      display: "flex",
    },
  },
});

// ==============================
// Text elemente
// ==============================

/* Text mic înaintea CTA telefon */
export const preCtaText = style({
  fontSize: vars.typography.size.sm,
  color: vars.color.muted,
  margin: 0,
});

/* Link telefon stilizat */
export const ctaPhone = style({
  fontWeight: 700,
  fontSize: vars.typography.size.xl,
  color: vars.color.primary,
  textDecoration: "none",
  transition: "color 0.15s cubic-bezier(.2,0,.2,1)",
  selectors: {
    "&:hover": { color: vars.color.primaryHover },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  },
});

// ==============================
// Bandă primary full-bleed
// ==============================
export const primaryBand = style({
  height: 7,
  background: vars.color.primary,
  width: "100vw",
  marginInline: "calc(50% - 50vw)",
});

// ==============================
// Grid carduri CTA
// ==============================
export const cardGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: vars.space.md,
  paddingTop: vars.space.xl,
  listStyle: "none",
  paddingInlineStart: 0,
  margin: 0,
  "@media": {
    [mq.lg]: {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
});

/* Override gridColumn de pe cardSmall (span 6/3) când e în cardGrid */
globalStyle(`${cardGrid} ${cardSmall}`, {
  gridColumn: "auto",
});

// ==============================
// CTA buton primar (reutilizat în CateringSection)
// ==============================

/* Link stilizat ca buton primary — compoziție din btn + primary */
export const ctaButton = style([btn, primary]);
