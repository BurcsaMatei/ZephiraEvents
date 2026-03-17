// styles/contact/contactInfo.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Classes
// ==============================
export const contactGridClass = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space.md,
  marginTop: vars.space.md,
  alignItems: "stretch",
  "@media": {
    [mq.md]: {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: vars.space.lg,
      marginTop: vars.space.lg,
    },
    [mq.lg]: { gridTemplateColumns: "repeat(3, 1fr)" },
  },
});

export const contactItemClass = style({
  height: "100%",
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.md,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: vars.space.sm,
  boxShadow: vars.shadow.sm,
  cursor: "pointer",
  transition: `background ${vars.motion.normal} cubic-bezier(.2,0,.2,1), box-shadow ${vars.motion.normal} ${vars.motion.easing}, border-color ${vars.motion.normal} ${vars.motion.easing}`,
  selectors: {
    "&:hover": {
      background: "rgba(85, 97, 242, 0.08)",
      boxShadow: vars.shadow.md,
      borderColor: vars.color.primary,
    },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  },
  "@media": {
    [mq.md]: { padding: vars.space.lg },
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const contactItemLinkClass = style({
  textDecoration: "none",
  color: "inherit",
});

export const cardTitleClass = style({
  fontWeight: 700,
  fontSize: "1rem",
  margin: 0,
  textAlign: "left",
  color: vars.color.primary,
  "@media": { [mq.md]: { fontSize: "1.1rem" } },
});

/** Spacing exact pentru titlul principal (înlocuiește inline style={{ marginBottom: 12 }}) */
export const headingMb = style({
  marginBottom: 12,
});

export const contactIconClass = style({
  width: 32,
  height: 32,
  flexShrink: 0,
  color: vars.color.primary,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const contactTextClass = style({
  fontSize: "14px",
  color: vars.color.muted,
  textAlign: "left",
  lineHeight: 1.45,
  "@media": { [mq.md]: { fontSize: "15px", lineHeight: 1.5 } },
});

// ==============================
// Hover propagation: card hover → icon animation
// ==============================
globalStyle(`.${contactItemClass}:hover .${contactIconClass}`, {
  transform: "rotate(3deg) translateY(-2px)",
  transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
});
