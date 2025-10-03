// styles/sections/motivationCards.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Keyframes
// ==============================
const shimmer = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "200% 50%" },
});

// ==============================
// Grid
// ==============================
export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: vars.space.lg,
  alignItems: "stretch",
  "@media": {
    [mq.lg]: {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: vars.space.xl,
    },
  },
});

// Sub-fold gating pe secțiunea părinte, nu pe grid, ca umbrele să nu fie „tăiate”
globalStyle(`.section:has(.${grid})`, {
  contentVisibility: "auto",
  containIntrinsicSize: "auto 600px",
});

// ==============================
// Card
// ==============================
export const cardWrap = style({
  perspective: "900px",
  height: "100%", // wrapper-ul ocupă întreaga înălțime a celulei
  display: "flex", // și permite copilului să se întindă
});

export const card = style({
  position: "relative",
  borderRadius: vars.radius.xl,
  overflow: "hidden",
  isolation: "isolate",
  background: "linear-gradient(to bottom right, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "2px solid rgba(255,255,255,0.6)",
  boxShadow: vars.shadow.lg,
  height: "100%", // cardul se întinde pe toată înălțimea wrapper-ului
  display: "flex",
  flexDirection: "column",
  selectors: {
    "&:hover": {
      transform: "translateY(-2px) scale(0.995)",
      boxShadow: vars.shadow.lg,
    },
  },
});

// ==============================
// Effects (Aurora & Orbs)
// ==============================
export const aurora = style({
  position: "absolute",
  inset: "-2px",
  borderRadius: vars.radius.xl,
  zIndex: 0,
  background: `linear-gradient(120deg, ${vars.color.primary}, ${vars.color.secondary}, #8AB6FF, #F595FF, ${vars.color.primary})`,
  backgroundSize: "200% 200%",
  animation: `${shimmer} 6s linear infinite`,
  opacity: 0.35,
  filter: "blur(10px)",
  pointerEvents: "none",
});

export const orbA = style({
  position: "absolute",
  width: "140px",
  height: "140px",
  borderRadius: "50%",
  left: "-40px",
  top: "-40px",
  background: `radial-gradient(closest-side, ${vars.color.primary}, transparent 70%)`,
  opacity: 0.22,
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
  background: `radial-gradient(closest-side, ${vars.color.secondary}, transparent 70%)`,
  opacity: 0.22,
  zIndex: 0,
  pointerEvents: "none",
});

// ==============================
// Inner
// ==============================
export const inner = style({
  position: "relative",
  zIndex: 1,
  padding: `${vars.space.lg} ${vars.space.lg}`,
  display: "flex", // conținut pe coloană
  flexDirection: "column",
  minHeight: 0, // previne overflow accidental la layout elastic
  flex: 1, // ocupă toată înălțimea cardului
  "@media": {
    [mq.lg]: { padding: `${vars.space.xl} ${vars.space.xl}` },
  },
});

// ==============================
// Content
// ==============================
export const title = style({
  margin: 0,
  fontSize: "1.1rem",
  lineHeight: 1.2,
  fontWeight: 800,
  color: vars.color.cardText,
  letterSpacing: "0.3px",
});

export const list = style({
  listStyle: "none",
  margin: `${vars.space.md} 0 0`,
  padding: 0,
  display: "grid",
  rowGap: vars.space.md,
});

export const item = style({
  display: "grid",
  gridTemplateColumns: "20px 1fr",
  alignItems: "start",
  columnGap: vars.space.sm,
});

export const check = style({
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
      opacity: 0.18,
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
});
