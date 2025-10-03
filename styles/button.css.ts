// styles/button.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Constants
// Tranziții consistente + token contur (alb implicit; override via CSS var)
// ==============================
const transition = [
  `background-color ${vars.motion.normal} ${vars.motion.easing}`,
  `color ${vars.motion.normal} ${vars.motion.easing}`,
  `border-color ${vars.motion.normal} ${vars.motion.easing}`,
  `box-shadow ${vars.motion.normal} ${vars.motion.easing}`,
  `opacity ${vars.motion.normal} ${vars.motion.easing}`,
].join(", ");

const outlineColor = "var(--btn-outline, #fff)";

// ==============================
// Classes
// ==============================

// Base
export const btn = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.sm,
  fontWeight: 700,
  lineHeight: 1,
  borderRadius: vars.radius.lg,
  border: "1px solid transparent", // border real → transparent; conturul alb e „ring”
  cursor: "pointer",
  userSelect: "none",
  textDecoration: "none",
  transition,
  WebkitTapHighlightColor: "transparent",
  padding: "10px 14px",
  selectors: {
    "&:hover": {},
    "&:active": {},
    "&:focus": { outline: "none" },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.focus}`,
    },
    "&[aria-busy='true']": { cursor: "progress" },
  },
});

// Link intern din buton (fără underline)
globalStyle(`${btn} a`, { textDecoration: "none" });

// Sizes
export const sm = style({
  padding: "8px 12px",
  borderRadius: vars.radius.md ?? vars.radius.lg,
});

export const lg = style({
  padding: "14px 18px",
  borderRadius: vars.radius.xl ?? vars.radius.lg,
});

// Variants — primary
export const primary = style({
  background: vars.color.primary,
  color: "#fff",
  boxShadow: `inset 0 0 0 2px ${outlineColor}`,
  selectors: {
    "&:hover": {
      background: `linear-gradient(135deg, ${vars.color.primary} 0%, ${vars.color.secondary} 100%)`,
      boxShadow: `inset 0 0 0 2px ${outlineColor}, ${vars.shadow.lg}`,
    },
    "&:active": {
      background: `linear-gradient(135deg, ${vars.color.secondary} 0%, ${vars.color.primary} 100%)`,
      boxShadow: `inset 0 0 0 2px ${outlineColor}, ${vars.shadow.md}`,
    },
    "&:focus-visible": {
      boxShadow: `inset 0 0 0 2px ${outlineColor}, 0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.focus}`,
    },
  },
});

// Variants — secondary
export const secondary = style({
  background: vars.color.surface,
  color: vars.color.text,
  boxShadow: `inset 0 0 0 2px ${outlineColor}`,
  selectors: {
    "&:hover": {
      background: `linear-gradient(135deg, ${vars.color.primary} 0%, ${vars.color.secondary} 100%)`,
      color: "#fff",
      boxShadow: `inset 0 0 0 2px ${outlineColor}, ${vars.shadow.lg}`,
    },
    "&:active": {
      background: `linear-gradient(135deg, ${vars.color.secondary} 0%, ${vars.color.primary} 100%)`,
      color: "#fff",
      boxShadow: `inset 0 0 0 2px ${outlineColor}, ${vars.shadow.md}`,
    },
    "&:focus-visible": {
      boxShadow: `inset 0 0 0 2px ${outlineColor}, 0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.focus}`,
    },
  },
});

// Variants — ghost
export const ghost = style({
  background: "transparent",
  color: vars.color.text,
  borderColor: "transparent",
  selectors: {
    "&:hover": { background: vars.color.surfaceActive },
    "&:active": { background: vars.color.surfaceActive },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.focus}`,
    },
  },
});

// Variants — link
export const link = style({
  background: "transparent",
  color: vars.color.link,
  borderColor: "transparent",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  selectors: {
    "&:hover": { color: vars.color.linkHover },
    "&:active": { color: vars.color.linkHover },
    "&:focus-visible": {
      textDecorationThickness: "2px",
      boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.focus}`,
    },
  },
});

// Modifiers
export const fullWidth = style({ width: "100%" });

export const iconOnly = style({
  padding: 0,
  width: "40px",
  height: "40px",
  borderRadius: vars.radius.lg,
});
globalStyle(`${iconOnly} svg`, { pointerEvents: "none" });
globalStyle(`${iconOnly} img`, { pointerEvents: "none" });

// States
export const disabled = style({
  opacity: 0.6,
  cursor: "not-allowed",
  pointerEvents: "none",
});

// aria-disabled pe link-uri
globalStyle(`${btn}[aria-disabled='true']`, {
  opacity: 0.6,
  cursor: "not-allowed",
  pointerEvents: "none",
});
