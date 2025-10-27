// styles/ui/backToTop.css.ts
// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Base button
// ==============================
export const button = style({
  position: "fixed",
  right: `calc(${vars.space.lg} + env(safe-area-inset-right, 0px))`,
  bottom: `calc(${vars.space.lg} + env(safe-area-inset-bottom, 0px))`,
  width: 48,
  height: 48,
  minWidth: 44,
  minHeight: 44,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: vars.radius.xl,
  cursor: "pointer",
  background: vars.color.primary,
  boxShadow: vars.shadow.md,
  zIndex: 999, // deasupra conținutului, sub overlay/modal
  WebkitTapHighlightColor: "transparent",
  transition: `opacity ${vars.motion.normal} ${vars.motion.easing.standard},
               transform ${vars.motion.normal} ${vars.motion.easing.standard},
               background-color ${vars.motion.fast} ${vars.motion.easing.standard}`,
  selectors: {
    "&:hover": { background: vars.color.primaryHover },
    "&:active": { transform: "translateY(1px) scale(0.98)" },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 3,
    },
  },
  "@media": {
    [mq.md]: {
      width: 52,
      height: 52,
    },
  },
});

// ==============================
// Icon
// ==============================
export const icon = style({
  width: 24,
  height: 24,
  display: "block",
});

// ==============================
// Visibility states
// ==============================
export const hidden = style({
  opacity: 0,
  transform: "translateY(10px)",
  pointerEvents: "none",
});

export const visible = style({
  opacity: 1,
  transform: "translateY(0)",
  pointerEvents: "auto",
});
