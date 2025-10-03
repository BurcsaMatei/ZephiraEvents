// styles/cookieBanner.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Tokens & utilities
// ==============================
const transition = `background ${vars.motion.normal} ${vars.motion.easing}, border-color ${vars.motion.normal} ${vars.motion.easing}, opacity ${vars.motion.normal} ${vars.motion.easing}`;

// ==============================
// Classes
// ==============================
export const banner = style({
  position: "fixed",
  left: vars.space.md,
  right: vars.space.md,
  bottom: vars.space.md,
  zIndex: vars.z.overlay,
  background: vars.color.surface,
  color: vars.color.text,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.shadow.md,
  borderRadius: vars.radius.xl,
  padding: vars.space.md,
  display: "grid",
  gap: vars.space.sm,
  "@media": {
    [mq.lg]: {
      gridTemplateColumns: "1fr auto",
      alignItems: "center",
      maxWidth: "720px",
      left: "50%",
      right: "auto",
      transform: "translateX(-50%)",
    },
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const text = style({
  margin: 0,
  lineHeight: 1.5,
});

export const linkClass = style({
  color: vars.color.link,
  textDecoration: "underline",
  selectors: { "&:hover": { opacity: 0.9 } },
});

export const actions = style({
  display: "flex",
  gap: vars.space.sm,
  flexWrap: "wrap",
  justifyContent: "flex-start",
});

export const btn = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.xs,
  fontWeight: 700,
  lineHeight: 1,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  cursor: "pointer",
  textDecoration: "none",
  padding: `${vars.space.sm} ${vars.space.md}`,
  background: vars.color.surface,
  color: vars.color.text,
  transition,
  ":active": { transform: "translateY(1px)" },
});

export const btnPrimary = style({
  background: vars.color.primary,
  color: vars.color.primaryContrast,
  borderColor: vars.color.primary,
  selectors: { "&:hover": { background: vars.color.primaryHover } },
});

export const btnGhost = style({
  background: "transparent",
  color: vars.color.text,
  borderColor: vars.color.border,
  selectors: { "&:hover": { background: vars.color.surfaceHover } },
});

// New: outline variant (folosit în dialog)
export const btnPrimaryOutline = style({
  background: vars.color.surface,
  color: vars.color.primary,
  borderColor: vars.color.primary,
  selectors: { "&:hover": { background: vars.color.surfaceHover } },
});

// Visually-hidden (for accessible headings)
export const srOnly = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
});

// ==============================
// Global styles
// ==============================
globalStyle(`${btn}:focus-visible`, {
  outline: `2px solid ${vars.color.focus}`,
  outlineOffset: 2,
  borderRadius: vars.radius.md as string,
});
