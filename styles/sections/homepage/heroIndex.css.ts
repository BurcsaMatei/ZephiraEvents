// styles/heroIndex.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { assetUrl } from "../../../lib/config";
import { vars } from "../../theme.css";

// ==============================
// Tokens & utilities
// ==============================
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
export const maskStage = style({
  WebkitMaskImage: `url("${HERO_MASK_URL}")`,
  maskImage: `url("${HERO_MASK_URL}")`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskPosition: "center bottom",
  maskPosition: "center bottom",
  overflow: "hidden",
});

export const mediaVideo = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0,
  transition: `opacity ${vars.motion.normal} ${vars.motion.easing}`,
  willChange: "opacity",
});
export const mediaVideoReady = style({ opacity: 1 });

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

export const arcGradient = style({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "32%",
  background: "linear-gradient(to bottom, transparent, rgba(85, 97, 242, 0.55))",
  pointerEvents: "none",
  zIndex: 3,
});

// Conținut peste media
export const contentLayer = style({
  position: "absolute",
  inset: 0,
  zIndex: 4,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
  padding: "min(6vw, 48px)",
});

export const contentWrap = style({
  pointerEvents: "auto",
  textAlign: "center",
  maxWidth: "min(92ch, 92vw)",
  margin: "0 auto",
});

// Alb forțat pe ambele teme + dimensiuni/greutăți
export const heroTitle = style({
  margin: 0,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  lineHeight: 1.08,
  color: "#fff",
  fontSize: "clamp(32px, 6.2vw, 64px)",
  textShadow: "0 2px 18px rgba(0,0,0,0.45)",
});

export const heroSubtitle = style({
  marginTop: "0.75em",
  marginBottom: 0,
  fontWeight: 600,
  lineHeight: 1.35,
  color: "#fff",
  fontSize: "clamp(16px, 2.4vw, 22px)",
  textShadow: "0 1px 12px rgba(0,0,0,0.45)",
});

// ==============================
// Global styles
// ==============================
globalStyle(`${String(maskStage)}:hover .${gradient}`, {
  filter: "saturate(1.18) contrast(1.10)",
});
globalStyle(`${String(maskStage)}:hover .${dots}`, {
  opacity: 0.32,
});

globalStyle("@media (prefers-reduced-motion: reduce)", {
  [`.${gradient}`]: { animation: "none" },
});
