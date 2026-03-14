// styles/sections/tentGallery.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

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
  width: "100%",
  aspectRatio: "4/3",
  overflow: "hidden",
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  boxShadow: vars.shadow.sm,
  cursor: "pointer",
  // reset button
  border: "none",
  padding: 0,
  margin: 0,
  display: "block",
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
  objectFit: "cover",
});
