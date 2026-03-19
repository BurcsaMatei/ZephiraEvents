// styles/sections/tentVideos.css.ts

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
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))",
});

export const videoWrap = style({
  position: "relative",
  width: "100%",
  paddingTop: "56.25%", // 16/9 ratio = 56.25%
  height: 0,
  overflow: "hidden",
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  boxShadow: vars.shadow.sm,
});

export const video = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});
