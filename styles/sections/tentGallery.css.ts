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
  display: "block",
  width: "100%",
  overflow: "hidden",
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  boxShadow: vars.shadow.sm,
  cursor: "pointer",
  transition: `box-shadow ${vars.motion.normal} ${vars.motion.easing.standard}`,
  selectors: {
    // pseudo-element pentru aspect ratio 4:3 — garantat cross-browser inclusiv Safari iOS
    "&::before": {
      content: '""',
      display: "block",
      paddingTop: "75%", // 3/4 = 75%
    },
    "&:hover": { boxShadow: vars.shadow.lg },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const image = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
});
