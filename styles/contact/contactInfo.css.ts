// styles/contact/contactInfo.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Classes
// ==============================
export const contactGridClass = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space.md,
  marginTop: vars.space.md,
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
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.md,
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  boxShadow: vars.shadow.sm,
  transition: `transform ${vars.motion.normal} ${vars.motion.easing}, box-shadow ${vars.motion.normal} ${vars.motion.easing}, border-color ${vars.motion.normal} ${vars.motion.easing}`,
  selectors: {
    "&:hover": {
      transform: "translateY(-2px) scale(1.015)",
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

export const cardTitleClass = style({
  fontWeight: 600,
  fontSize: "1rem",
  margin: 0,
  color: vars.color.primary,
  "@media": { [mq.md]: { fontSize: "1.1rem" } },
});

/** Spacing exact pentru titlul principal (înlocuiește inline style={{ marginBottom: 12 }}) */
export const headingMb = style({
  marginBottom: 12,
});

export const contactIconClass = style({
  flexShrink: 0,
  color: vars.color.primary,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const contactTextClass = style({
  fontSize: "14px",
  color: vars.color.text,
  lineHeight: 1.45,
  "@media": { [mq.md]: { fontSize: "15px", lineHeight: 1.5 } },
});
