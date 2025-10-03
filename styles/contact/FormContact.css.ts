// styles/contact/formContact.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Classes
// ==============================

// Tokens & utilities
const cardBase = {
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.sm,
  padding: vars.space.lg,
  transition: `transform ${vars.motion.normal} ${vars.motion.easing}, box-shadow ${vars.motion.normal} ${vars.motion.easing}, border-color ${vars.motion.normal} ${vars.motion.easing}, background ${vars.motion.normal} ${vars.motion.easing}`,
} as const;

// Layout
export const wrap = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space.lg,
  alignItems: "stretch",
  "@media": { [mq.lg]: { gridTemplateColumns: "1fr 1fr" } },
});

export const col = style({
  display: "flex",
  alignItems: "stretch",
});

export const infoCol = style({
  "@media": {
    [mq.lg]: {
      borderLeft: `1px solid ${vars.color.border}`,
      paddingLeft: vars.space.lg,
    },
  },
});

// Cards
export const formBox = style({
  ...cardBase,
  flex: 1,
  selectors: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: vars.shadow.md,
      borderColor: vars.color.primary,
      background: vars.color.surfaceHover,
    },
  },
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none" } },
});

export const infoCard = style({
  ...cardBase,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
  selectors: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: vars.shadow.md,
      borderColor: vars.color.primary,
      background: vars.color.surfaceHover,
    },
  },
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none" } },
});

// Headings
export const infoHead = style({ marginBottom: vars.space.sm });
export const infoTitle = style({ margin: 0, fontWeight: 700, fontSize: "1.1rem" });
export const infoSub = style({ margin: 0, color: vars.color.muted, fontSize: "0.95rem" });

/* ── NOU: titlul formularului (înlocuiește style={{ marginTop: 0 }}) */
export const formTitle = style({ marginTop: 0 });

// Lists
export const list = style({ display: "grid", gap: vars.space.sm });
export const listItem = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  gap: vars.space.sm,
  padding: vars.space.sm,
  borderRadius: vars.radius.md,
  transition: `background ${vars.motion.normal} ${vars.motion.easing}`,
  selectors: { "&:hover": { background: vars.color.surfaceActive } },
});

// Mini card + note
export const miniCard = style({
  marginTop: "auto",
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  border: `1px dashed ${vars.color.border}`,
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: vars.space.sm,
  alignItems: "center",
  transition: `border-color ${vars.motion.normal} ${vars.motion.easing}, background ${vars.motion.normal} ${vars.motion.easing}`,
  selectors: {
    "&:hover": { borderColor: vars.color.primary, background: vars.color.surfaceHover },
  },
});
export const note = style({
  marginTop: vars.space.sm,
  color: vars.color.muted,
  fontSize: "0.92rem",
});
export const itemText = style({ margin: 0, lineHeight: 1.4 });
export const actionsRow = style({
  display: "flex",
  gap: vars.space.sm,
  alignItems: "center",
  flexWrap: "wrap",
});

/* ── NOU: câmpurile formularului (înlocuiește style={{ display:'grid', gap:12 }}) */
export const formFields = style({
  display: "grid",
  gap: 12,
});

/* ── NOU: câmpuri full-width (înlocuiește style={{ width:'100%' }}) */
export const input = style({ width: "100%" });
export const textarea = style({ width: "100%" });

/* ── NOU: rând pentru Submit (înlocuiește style={{ marginTop: 12 }}) */
export const submitRow = style({ marginTop: 12 });
