// styles/sections/tentAtLocationBanner.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { assetUrl } from "../../lib/config";
import { vars } from "../theme.css";

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
  maxWidth: "min(72ch, 92vw)",
  margin: "0 auto",
  display: "grid",
  gap: vars.space.md,
});

export const eyebrow = style({
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 900,
  fontSize: "0.8rem",
  color: "#fff",
  opacity: 0.8,
  textShadow: "0 1px 8px rgba(0,0,0,0.5)",
});

export const title = style({
  margin: 0,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  lineHeight: 1.08,
  color: "#fff",
  fontSize: "clamp(26px, 4.5vw, 52px)",
  textShadow: "0 2px 18px rgba(0,0,0,0.45)",
});

export const lede = style({
  margin: "0 auto",
  color: "#fff",
  opacity: 0.92,
  lineHeight: 1.65,
  fontSize: "clamp(15px, 1.8vw, 18px)",
  textShadow: "0 1px 10px rgba(0,0,0,0.5)",
  maxWidth: "60ch",
});

export const list = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: vars.space.xs,
});

export const listItem = style({
  display: "grid",
  gridTemplateColumns: "18px 1fr",
  gap: vars.space.sm,
  alignItems: "start",
  color: "#fff",
  opacity: 0.9,
  fontSize: "clamp(14px, 1.6vw, 16px)",
  textShadow: "0 1px 8px rgba(0,0,0,0.45)",
  selectors: {
    "&::before": {
      content: '"✓"',
      fontWeight: 900,
      color: "#fff",
      lineHeight: 1.2,
      marginTop: 2,
    },
  },
});

export const ctaRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: vars.space.xs,
});

const ctaBase = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${vars.space.sm} ${vars.space.lg}`,
  borderRadius: vars.radius.lg,
  fontWeight: 900,
  textDecoration: "none",
  lineHeight: 1,
  ":focus-visible": { outline: "2px solid #fff", outlineOffset: 2 },
});

export const ctaPrimary = style([
  ctaBase,
  {
    background: "#fff",
    color: "#111",
    selectors: {
      "&:hover": { filter: "brightness(0.95)" },
    },
  },
]);

export const ctaSecondary = style([
  ctaBase,
  {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.5)",
    selectors: {
      "&:hover": { background: "rgba(255,255,255,0.22)" },
    },
  },
]);

// ==============================
// Intro block — sub banner, în pagini (fără card styling)
// ==============================
export const introBlock = style({
  display: "grid",
  gap: vars.space.md,
  maxWidth: "min(72ch, 92vw)",
  margin: "0 auto",
  textAlign: "center",
});

export const introList = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space.sm,
});

export const introListItem = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "baseline",
  gap: vars.space.xs,
  color: vars.color.text,
  opacity: 0.95,
  selectors: {
    "&::before": {
      content: '"✓"',
      fontWeight: 900,
      color: vars.color.link,
      flexShrink: 0,
    },
  },
});

// ==============================
// Card panel — folosit pe pagina dedicată (fundal deschis)
// ==============================
export const panel = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  boxShadow: vars.shadow.lg,
  padding: vars.space.lg,
  display: "grid",
  gap: vars.space.md,
});

export const panelEyebrow = style({
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 900,
  fontSize: "0.85rem",
  color: vars.color.text,
  opacity: 0.75,
});

export const panelTitle = style({
  margin: 0,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  lineHeight: 1.1,
  fontSize: "clamp(1.35rem, 2.2vw, 1.9rem)",
});

export const panelLede = style({
  margin: 0,
  color: vars.color.text,
  opacity: 0.92,
  lineHeight: 1.65,
  fontSize: "1.02rem",
  maxWidth: 900,
});

export const introLede = style([
  panelLede,
  {
    textTransform: "uppercase",
    fontWeight: 900,
    letterSpacing: "0.04em",
  },
]);

export const panelList = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: vars.space.sm,
});

export const panelListItem = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: vars.space.sm,
  alignItems: "start",
  color: vars.color.text,
  opacity: 0.95,
  selectors: {
    "&::before": {
      content: '"✓"',
      fontWeight: 900,
      color: vars.color.link,
      lineHeight: 1.2,
      marginTop: 2,
    },
  },
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
