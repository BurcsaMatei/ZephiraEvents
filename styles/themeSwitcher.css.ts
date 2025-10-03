// styles/themeSwitcher.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Classes
// ==============================
export const themeSwitcher = style({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  width: 36,
  height: 36,
  padding: 0,
  border: "none",
  borderRadius: 10,
  background: "transparent",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
  transition: `transform ${vars.motion.fast} ${vars.motion.easing.standard}, background-color ${vars.motion.fast} ${vars.motion.easing.standard}`,
  selectors: {
    "&:hover": { transform: "scale(1.03)", background: vars.color.surfaceHover },
    "&:active": { transform: "scale(0.98)" },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
    '&[aria-pressed="true"]': { background: vars.color.surfaceActive, transform: "scale(0.98)" },
  },
});

export const bulb = style({
  width: 20,
  height: 20,
  display: "block",
  // ⬇️ folosim o variabilă CSS setată din componentă
  WebkitMaskImage: "var(--bulb-mask)",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  WebkitMaskSize: "contain",
  maskImage: "var(--bulb-mask)",
  maskRepeat: "no-repeat",
  maskPosition: "center",
  maskSize: "contain",
  transition: `transform ${vars.motion.fast} ${vars.motion.easing.standard}, background-color ${vars.motion.fast} ${vars.motion.easing.standard}`,
  backgroundColor: vars.color.muted, // fallback
});

export const bulbOn = style({ transform: "rotate(0deg)" });
export const bulbOff = style({ transform: "rotate(180deg)" });

export const bulbLight = style({ backgroundColor: "#FFD54A" });
export const bulbDark = style({ backgroundColor: "#2F2F2F" });
