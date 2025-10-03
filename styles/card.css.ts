// styles/card.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Classes
// ==============================

// Card root
export const cardRoot = style({
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  overflow: "hidden",
  textDecoration: "none",
  color: vars.color.text,
  transition: `box-shadow ${vars.motion.normal} ${vars.motion.easing}`,
  willChange: "box-shadow",
  ":hover": { boxShadow: vars.shadow.lg },
});

// Media wrapper
export const imageWrap = style({
  position: "relative",
  width: "100%",
  aspectRatio: "16/9",
  overflow: "hidden",
  borderBottom: `1px solid ${vars.color.border}`,
});

// Content wrapper
export const contentWrap = style({
  display: "grid",
  gap: vars.space.xs,
  padding: `${vars.space.sm} ${vars.space.md} ${vars.space.md}`,
});

// Typography — Title
export const titleClass = style({
  fontSize: "1rem",
  fontWeight: 700,
  margin: 0,
  color: vars.color.text,
});

// Metadata row
export const metaRow = style({
  fontSize: "0.875rem",
  color: vars.color.muted,
});

// Excerpt
export const excerptClass = style({
  fontSize: "0.95rem",
  lineHeight: 1.4,
  color: vars.color.text,
});

// Actions row
export const actionsRow = style({
  marginTop: "auto",
  display: "flex",
  gap: vars.space.sm,
});

// Interactive wrappers — Link
export const linkReset = style({
  display: "block",
  textDecoration: "none",
  color: "inherit",
  height: "100%",
  width: "100%", // întindere completă pe lățimea celulei
});

// Interactive wrappers — Button
export const buttonReset = style({
  display: "block",
  border: "none",
  background: "none",
  padding: 0,
  margin: 0,
  textAlign: "inherit",
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
  height: "100%",
  width: "100%", // întindere completă pe lățimea celulei
});
