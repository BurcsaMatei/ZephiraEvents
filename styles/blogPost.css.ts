// styles/blogPost.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Classes
// ==============================
export const coverFigure = style({
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 9",
  borderRadius: vars.radius.lg,
  overflow: "hidden",
  boxShadow: vars.shadow.md,
  margin: `0 0 ${vars.space.xl} 0`,
});

export const coverCaption = style({
  marginTop: vars.space.sm,
  fontSize: "0.9rem",
  opacity: 0.8,
});
