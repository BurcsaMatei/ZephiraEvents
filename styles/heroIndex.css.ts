// styles/heroIndex.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { assetUrl } from "../lib/config";
import { vars } from "./theme.css";

// ==============================
// Tokens & utilities
// ==============================
// === doar mask + efecte (fără layout) ===
const HERO_MASK_URL = assetUrl("/masks/hero-arc-up.svg");

// ==============================
// Keyframes
// ==============================
const gradientFloat = keyframes({
  "0%": { transform: "translate3d(0,0,0) scale(1)" },
  "100%": { transform: "translate3d(4%, -3%, 0) scale(1.06)" },
});

// ==============================
// Classes
// ==============================
// Masca de arc pe <figure>
export const maskStage = style({
  WebkitMaskImage: `url("${HERO_MASK_URL}")`,
  maskImage: `url("${HERO_MASK_URL}")`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskPosition: "center bottom",
  maskPosition: "center bottom",
  // overflow hidden e deja în inline, dar îl dublăm defensiv fără a afecta layout-ul
  overflow: "hidden",
});

// Gradient decorativ (doar transform/opacity)
export const gradient = style({
  position: "absolute",
  inset: 0,
  zIndex: 2,
  pointerEvents: "none",
  mixBlendMode: "soft-light",
  backgroundImage: `
    radial-gradient(65% 85% at 20% 20%, ${vars.color.primary}77, transparent 60%),
    radial-gradient(55% 75% at 80% 30%, ${vars.color.link}77, transparent 60%),
    radial-gradient(55% 70% at 50% 85%, ${vars.color.secondary}66, transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.45))
  `,
  backgroundRepeat: "no-repeat",
  opacity: 0.9,
  willChange: "transform, opacity, filter",
  selectors: {
    "&:hover": { opacity: 1 },
  },
  "@media": {
    "(prefers-reduced-motion: no-preference)": {
      animation: `${gradientFloat} 24s ease-in-out infinite alternate`,
    },
  },
});

// Strat „dots”
export const dots = style({
  position: "absolute",
  inset: 0,
  zIndex: 3,
  pointerEvents: "none",
  opacity: 0.25,
  backgroundImage: "radial-gradient(currentColor 1px, rgba(0,0,0,0) 1px)",
  backgroundSize: "22px 22px",
  color: vars.color.surface,
  maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
});

// ==============================
// Global styles
// ==============================
// Hover – doar pe transform/filters (no layout)
globalStyle(`${String(maskStage)}:hover .${gradient}`, {
  filter: "saturate(1.18) contrast(1.10)",
});
globalStyle(`${String(maskStage)}:hover .${dots}`, {
  opacity: 0.32,
});

// Reduced motion
globalStyle("@media (prefers-reduced-motion: reduce)", {
  [`.${gradient}`]: { animation: "none" },
});
