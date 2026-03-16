// styles/sections/motivationCards.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { mq, themeClassDark, themeClassLight, vars } from "../theme.css";

// ==============================
// Keyframes
// ==============================
const shimmer = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "200% 50%" },
});

// ==============================
// Layout: Grid
// ==============================
export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: vars.space.lg,
  alignItems: "stretch",
  justifyItems: "stretch",
  "@media": { [mq.lg]: { gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: vars.space.xl } },
});

globalStyle(`.section:has(.${grid})`, {
  contentVisibility: "auto",
  containIntrinsicSize: "auto 600px",
});

// ==============================
// Card Shell (front vizual păstrat)
// ==============================
export const cardWrap = style({
  perspective: "1500px",
  height: "100%",
  display: "flex",
  width: "100%",
});

export const card = style({
  position: "relative",
  borderRadius: vars.radius.xl,
  overflow: "hidden",
  isolation: "isolate",
  background: "linear-gradient(to bottom right, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "2px solid rgba(255,255,255,0.6)",
  boxShadow: vars.shadow.lg,
  height: "100%",
  width: "100%",
  minHeight: "260px",
  display: "flex",
  flexDirection: "column",
  "@media": {
    [mq.lg]: { minHeight: "320px" },
    "(hover: hover)": {
      selectors: {
        "&:hover": { transform: "translateY(-2px)", boxShadow: vars.shadow.lg },
      },
    },
  },
  selectors: {
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  },
});

// ==============================
// Visual Effects (Aurora & Orbs)
// ==============================
export const aurora = style({
  position: "absolute",
  inset: "-2px",
  borderRadius: vars.radius.xl,
  zIndex: 0,
  background: `linear-gradient(
    120deg,
    ${vars.color.primary},
    ${vars.color.secondary},
    color-mix(in srgb, ${vars.color.primary} 80%, white 20%),
    color-mix(in srgb, ${vars.color.secondary} 86%, white 14%),
    ${vars.color.primary}
  )`,
  backgroundSize: "200% 200%",
  animation: `${shimmer} 6s linear infinite`,
  opacity: 0.3,
  filter: "blur(9px)",
  pointerEvents: "none",
  selectors: {
    [`${themeClassLight} &`]: { opacity: 0.24, filter: "blur(8px)" },
    [`${themeClassDark} &`]: { opacity: 0.36, filter: "blur(10px)" },
  },
});

export const orbA = style({
  position: "absolute",
  width: "140px",
  height: "140px",
  borderRadius: "50%",
  left: "-40px",
  top: "-40px",
  background: `radial-gradient(closest-side, color-mix(in srgb, ${vars.color.primary} 75%, transparent), transparent 70%)`,
  opacity: 0.2,
  zIndex: 0,
  pointerEvents: "none",
});

export const orbB = style({
  position: "absolute",
  width: "160px",
  height: "160px",
  borderRadius: "50%",
  right: "-50px",
  bottom: "-50px",
  background: `radial-gradient(closest-side, color-mix(in srgb, ${vars.color.secondary} 78%, transparent), transparent 70%)`,
  opacity: 0.2,
  zIndex: 0,
  pointerEvents: "none",
});

// ==============================
// Media Badge (thumb stânga-jos)
// ==============================
export const mediaBadge = style({
  position: "absolute",
  left: vars.space.lg,
  bottom: vars.space.lg,
  width: 64,
  height: 64,
  borderRadius: vars.radius.lg,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.35)",
  boxShadow: vars.shadow.md,
  zIndex: 2,
  "@media": { [mq.lg]: { width: 80, height: 80 } },
});

export const mediaImg = style({
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

// ==============================
// Inner Content (fața — neschimbat)
// ==============================
export const inner = style({
  position: "relative",
  zIndex: 1,
  padding: `${vars.space.lg} ${vars.space.lg}`,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  flex: 1,
  willChange: "transform",
  paddingBottom: "64px",
  "@media": { [mq.lg]: { padding: `${vars.space.xl} ${vars.space.xl}`, paddingBottom: "80px" } },
});

export const title = style({
  margin: 0,
  fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
  lineHeight: 1.2,
  fontWeight: 800,
  color: vars.color.cardText,
  letterSpacing: "0.3px",
  overflow: "hidden",
  maxHeight: "2.4em",
  "@media": { [mq.lg]: { fontSize: "1.1rem" } },
});

export const list = style({
  listStyle: "none",
  margin: `${vars.space.md} 0 0`,
  padding: 0,
  display: "none",
  rowGap: vars.space.md,
  "@media": { [mq.lg]: { display: "grid" } },
});

export const item = style({
  display: "grid",
  gridTemplateColumns: "20px 1fr",
  alignItems: "start",
  columnGap: vars.space.sm,
});

export const check = style({
  position: "relative",
  width: 20,
  height: 20,
  color: vars.color.primary,
  selectors: {
    "&::before": {
      content: "''",
      display: "block",
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${vars.color.primary}, ${vars.color.secondary})`,
      opacity: 0.16,
      position: "absolute",
      transform: "translate(-2px, -2px)",
    },
  },
});

export const pointText = style({
  color: vars.color.cardText,
  opacity: 0.95,
  fontWeight: 600,
  letterSpacing: "0.1px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// ==============================
// CTA (reutilizat pe spate)
// ==============================
export const cta = style({
  position: "absolute",
  right: vars.space.lg,
  bottom: vars.space.lg,
  width: 44,
  height: 44,
  borderRadius: "9999px",
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: vars.color.primary,
  zIndex: 3,
  userSelect: "none",
  touchAction: "manipulation",
  transition: `transform ${vars.motion.normal} ${vars.motion.easing}, background ${vars.motion.normal} ${vars.motion.easing}, border-color ${vars.motion.normal} ${vars.motion.easing}`,
  "@media": {
    "(hover: hover)": {
      selectors: {
        "&:hover": {
          background: "rgba(255,255,255,0.10)",
          transform: "translateY(-2px)",
          borderColor: "rgba(255,255,255,0.35)",
        },
        "&:active": { transform: "translateY(0)" },
        "&:focus-visible": { outline: "none", boxShadow: "0 0 0 3px rgba(255,255,255,0.35)" },
      },
    },
  },
});

export const ctaIcon = style({ width: 20, height: 20 });

// ==============================
// Flip 3D — straturi + animație lină
// ==============================
export const flipper = style({
  position: "relative",
  width: "100%",
  height: "100%",
  transformStyle: "preserve-3d",
  willChange: "transform",
  transition: "transform 560ms cubic-bezier(.2,.65,.08,1)",
  selectors: {
    [`${card}:hover &`]: { transform: "rotateY(180deg)" },
    [`${card}:focus-within &`]: { transform: "rotateY(180deg)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
      selectors: {
        [`${card}:hover &`]: { transform: "none" },
        [`${card}:focus-within &`]: { transform: "none" },
      },
    },
  },
});

const faceBase = style({
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  borderRadius: vars.radius.xl,
  overflow: "hidden",
});

// Fața (front)
export const frontFace = style([faceBase, { zIndex: 1 }]);

// Spatele (back) — imagine full + overlay + content alb (anti-blur)
export const backFace = style([
  faceBase,
  {
    transform: "rotateY(180deg) translateZ(0)",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    zIndex: 1,
    backfaceVisibility: "hidden",
  },
]);

export const backOverlay = style({
  position: "absolute",
  inset: 0,
  background: `linear-gradient(180deg, color-mix(in srgb, ${vars.color.shadow} 0%, transparent), color-mix(in srgb, ${vars.color.shadow} 75%, transparent))`,
});

// Conținut pe spate: fade după flip (anti-blur pe text)
export const backContent = style({
  position: "relative",
  zIndex: 2,
  height: "100%",
  padding: vars.space.xl,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  gap: vars.space.md,
  color: "#fff",
  opacity: 0,
  willChange: "opacity",
  transitionProperty: "opacity",
  transitionDuration: "280ms",
  transitionTimingFunction: "cubic-bezier(.2,.65,.08,1)",
  transitionDelay: "0ms",
  backfaceVisibility: "hidden",
  transform: "translateZ(0)",
  selectors: {
    [`${card}:hover &`]: { opacity: 1, transitionDelay: "280ms" },
    [`${card}:focus-within &`]: { opacity: 1, transitionDelay: "280ms" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionProperty: "none",
      opacity: 1,
    },
  },
});

export const backTitle = style({
  margin: 0,
  fontWeight: 800,
  fontSize: "1.1rem",
  lineHeight: 1.2,
  color: "#fff",
  backfaceVisibility: "hidden",
  transform: "translateZ(0)",
});

export const backMsg = style({
  margin: 0,
  fontSize: vars.typography.size.md,
  lineHeight: vars.typography.leading.normal,
  color: "#fff",
  backfaceVisibility: "hidden",
  transform: "translateZ(0)",
});
