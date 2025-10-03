// styles/homepage/arcGallery.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Animations
// ==============================
const shimmer = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "200% 50%" },
});

const dash = keyframes({
  "0%": { strokeDashoffset: "94.2477796077" }, // 2πr, r=15
  "100%": { strokeDashoffset: "0" },
});

// ==============================
// Layout — section & grid (DEPRECATED padding local)
// ==============================
export const section = style({
  contentVisibility: "auto",
  containIntrinsicSize: "auto 560px",
});

export const sectionDense = style({
  contentVisibility: "auto",
  containIntrinsicSize: "auto 560px",
});

export const grid = style({
  display: "grid",
  gap: vars.space.lg,
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  "@media": { [mq.lg]: { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" } },
});

// ==============================
// Card wrapper & frame
// ==============================
export const cardWrap = style({
  display: "grid",
  perspective: "900px",
});

export const frame = style({
  position: "relative",
  padding: 2,
  borderTopLeftRadius: "999px",
  borderTopRightRadius: "999px",
  borderBottomLeftRadius: vars.radius.lg,
  borderBottomRightRadius: vars.radius.lg,
  background: `linear-gradient(135deg, ${vars.color.primary}, ${vars.color.secondary})`,
  boxShadow: "0 18px 22px rgba(0,0,0,0.12)",
  isolation: "isolate",
  willChange: "transform",
  transformStyle: "preserve-3d",
});

// ==============================
// Card + stages/layers
// ==============================
export const card = style({
  position: "relative",
  width: "100%",
  aspectRatio: "4/5",
  overflow: "hidden",
  borderTopLeftRadius: "999px",
  borderTopRightRadius: "999px",
  borderBottomLeftRadius: vars.radius.lg,
  borderBottomRightRadius: vars.radius.lg,
  background: "linear-gradient(to bottom right, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "2px solid rgba(255,255,255,0.55)",
  boxShadow: "0 14px 10px rgba(0,0,0,0.12)",
  backfaceVisibility: "hidden",
  transform: "translateZ(0)",
});

export const stage = style({
  position: "absolute",
  inset: -3,
  overflow: "hidden",
});

export const layer = style({
  position: "absolute",
  inset: "-3px",
  backfaceVisibility: "hidden",
  transform: "translateZ(0)",
  transformStyle: "preserve-3d",
});

globalStyle(`${layer} > img, ${layer} > picture, ${layer} > div`, {
  width: "100%",
  height: "100%",
});
globalStyle(`${layer} img`, { objectFit: "cover", display: "block" });

// ==============================
// Aurora overlay
// ==============================
export const aurora = style({
  position: "absolute",
  inset: "-2px",
  borderTopLeftRadius: "999px",
  borderTopRightRadius: "999px",
  borderBottomLeftRadius: vars.radius.lg,
  borderBottomRightRadius: vars.radius.lg,
  zIndex: 0,
  background: `linear-gradient(
    120deg,
    ${vars.color.primary},
    ${vars.color.secondary},
    #8AB6FF,
    #F595FF,
    ${vars.color.primary}
  )`,
  backgroundSize: "200% 200%",
  animation: `${shimmer} 6s linear infinite`,
  opacity: 0.28,
  filter: "blur(9px)",
  pointerEvents: "none",
});

// ==============================
// CTA button + progress
// ==============================
export const openBtn = style({
  position: "absolute",
  right: 10,
  bottom: 10,
  width: 48,
  height: 48,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: "2px solid #fff",
  background: `linear-gradient(135deg, ${vars.color.primary} 0%, ${vars.color.secondary} 100%)`,
  color: "#fff",
  boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
  transition: `transform ${vars.motion.normal} ${vars.motion.easing},
               box-shadow ${vars.motion.normal} ${vars.motion.easing}`,
  selectors: {
    "&:hover": { transform: "scale(0.98)", boxShadow: "0 16px 28px rgba(0,0,0,0.22)" },
    "&:focus": { outline: "none" },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.focus}`,
    },
  },
});

export const openIcon = style({ zIndex: 2 });
export const progress = style({ position: "absolute", inset: 0 });
export const progressBg = "progressBg";
export const progressFg = "progressFg";

globalStyle(`${progress} .${progressBg}`, {
  fill: "none",
  stroke: "rgba(255,255,255,0.25)",
  strokeWidth: 2,
});
globalStyle(`${progress} .${progressFg}`, {
  fill: "none",
  stroke: "#fff",
  strokeWidth: 2,
  strokeDasharray: "94.2477796077",
  strokeDashoffset: "94.2477796077",
  transform: "rotate(-90deg)",
  transformOrigin: "50% 50%",
  animationName: dash,
  animationDuration: "4800ms",
  animationTimingFunction: "linear",
});
globalStyle(`${progress}[data-d="4800"] .${progressFg}`, { animationDuration: "4800ms" });
globalStyle(`${progress}[data-d="5220"] .${progressFg}`, { animationDuration: "5220ms" });
globalStyle(`${progress}[data-d="5640"] .${progressFg}`, { animationDuration: "5640ms" });
globalStyle(`${progress}[data-d="6060"] .${progressFg}`, { animationDuration: "6060ms" });

// ==============================
// Caption
// ==============================
export const caption = style({
  textAlign: "center",
  marginTop: vars.space.sm,
  color: vars.color.text,
  fontSize: "0.98rem",
  fontWeight: 600,
  display: "-webkit-box",
  WebkitLineClamp: "2",
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});
