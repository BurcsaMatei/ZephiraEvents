// styles/sections/menuOffers.css.ts
// ==============================
// Styles: MenuOffers section (Vanilla Extract) — thematized (light/dark)
// ==============================

import { style } from "@vanilla-extract/css";

import { mq, vars } from "../../styles/theme.css";

export const grid = style({
  display: "grid",
  gap: vars.space.lg,
  gridTemplateColumns: "1fr",
  "@media": {
    [mq.md]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    [mq.xl]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
});

export const card = style({
  position: "relative",
  alignSelf: "flex-start",
  borderRadius: vars.radius.xl,
  overflow: "hidden",
  background: vars.color.cardBg,
  color: vars.color.cardText,
  boxShadow: vars.shadow.sm,
  border: `1px solid ${vars.color.border}`,
  selectors: {
    "&:hover": {
      borderColor: vars.color.primary,
      boxShadow: vars.shadow.md,
    },
    '&[data-open="true"]': {
      boxShadow: vars.shadow.md,
      borderColor: vars.color.surfaceActive,
    },
  },
});

export const trigger = style({
  position: "relative",
  display: "block",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      outline: `3px solid ${vars.color.focus}`,
      outlineOffset: 2,
    },
  },
});

export const media = style({
  position: "relative",
  width: "100%",
  height: 0,
  paddingBottom: "30%", // ușor mai compact: imagine mai scundă
  overflow: "hidden",
});

export const titleRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderTop: `1px solid ${vars.color.border}`,
});

export const title = style({
  flex: 1,
  minWidth: 0,
  fontSize: "1.05rem",
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const priceWrap = style({
  display: "flex",
  alignItems: "baseline",
  gap: vars.space.sm,
});

export const price = style({
  fontSize: "0.95rem",
  fontWeight: 600,
  color: vars.color.primary,
  whiteSpace: "nowrap",
});

export const currency = style({
  opacity: 0.75,
  whiteSpace: "nowrap",
});

export const arrowBtn = style({
  width: "2rem",
  height: "2rem",
  borderRadius: "9999px",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.primary,
  color: vars.color.primaryContrast,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  transition: `transform ${vars.motion.normal} ${vars.motion.easing.standard}, background ${vars.motion.fast} ${vars.motion.easing.standard}`,
  selectors: {
    "&:hover": {
      background: vars.color.primaryHover,
    },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.focus}`,
      outlineOffset: 2,
    },
    '&[data-open="true"]': {
      transform: "rotate(180deg)",
    },
  },
});

export const panel = style({
  maxHeight: 0,
  overflow: "hidden",
  transition: `max-height ${vars.motion.slow} ${vars.motion.easing.standard}, opacity ${vars.motion.slow} ${vars.motion.easing.standard}`,
  opacity: 0,
  background: vars.color.surfaceHover,
  selectors: {
    '&[data-open="true"]': {
      opacity: 1,
      maxHeight: 1200,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const panelInner = style({
  padding: vars.space.md,
  display: "grid",
  gap: vars.space.md,
});

export const panelFooter = style({
  display: "flex",
  justifyContent: "flex-end",
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderTop: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

export const sectionBlock = style({
  background: vars.color.surface,
  borderRadius: vars.radius.lg,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  border: `1px solid ${vars.color.border}`,
});

export const sectionTitle = style({
  fontWeight: 700,
  marginBottom: vars.space.xs,
});

export const list = style({
  paddingLeft: "1.1rem",
  margin: 0,
});
