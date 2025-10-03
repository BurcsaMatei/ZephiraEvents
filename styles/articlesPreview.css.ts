// styles/articlesPreview.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Section wrapper (deprecated)
// NOTE: padding global mutat pe .section > .container
// ==============================
export const sectionClass = style({});

// ==============================
// Header
// ==============================
export const headerClass = style({
  textAlign: "center",
  margin: `0 auto ${vars.space.lg}`,
  maxWidth: 780,
});

export const titleClass = style({
  margin: 0,
  fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
  lineHeight: 1.2,
  fontWeight: 800,
  color: vars.color.text,
});

export const subtitleClass = style({
  marginTop: vars.space.xs,
  color: vars.color.muted,
});

// ==============================
// Grid
// ==============================
export const gridClass = style({
  marginTop: vars.space.lg,
});

// ==============================
// CTA row
// ==============================
export const ctaRowClass = style({
  display: "flex",
  justifyContent: "center",
  marginTop: vars.space.lg,
});

// ==============================
// Empty state
// ==============================
export const emptyClass = style({
  textAlign: "center",
  color: vars.color.muted,
  padding: vars.space.lg,
  border: `1px dashed ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
});

// ==============================
// Card wrapper
// Înlocuiește inline style={{ height: "100%" }}
// ==============================
export const cardWrap = style({
  height: "100%",
});
