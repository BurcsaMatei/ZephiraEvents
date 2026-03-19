// styles/sections/tentGallery.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "../../theme.css";

// ==============================
// Classes
// ==============================
export const grid = style({
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
});

export const imageWrap = style({
  position: "relative",
  display: "block",
  width: "100%",
  overflow: "hidden",
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  boxShadow: vars.shadow.sm,
  cursor: "pointer",
  transition: `box-shadow ${vars.motion.normal} ${vars.motion.easing.standard}`,
  selectors: {
    "&:hover": { boxShadow: vars.shadow.lg },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const image = style({
  display: "block",
  width: "100%",
  height: "auto",
  objectFit: "cover",
});
