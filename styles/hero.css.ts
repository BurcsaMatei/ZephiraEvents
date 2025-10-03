// styles/hero.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { themeClassLight, vars } from "./theme.css";

// ==============================
// Keyframes
// ==============================
const shimmer = keyframes({
  "0%": { backgroundPosition: "0% 0%" },
  "100%": { backgroundPosition: "200% 100%" },
});
const kenburns = keyframes({
  "0%": { transform: "scale(1) translate3d(0,0,0)" },
  "100%": { transform: "scale(1.05) translate3d(2%, -1%, 0)" },
});
const sweep = keyframes({
  "0%": { transform: "translate3d(-15%, 0, 0) rotate(135deg)" },
  "100%": { transform: "translate3d(15%, 0, 0) rotate(135deg)" },
});

// ==============================
// Wrapper & sizes
// ==============================
export const heroWrap = style({
  position: "relative",
  borderRadius: vars.radius.xl,
  overflow: "hidden",
  isolation: "isolate",
  background: "linear-gradient(to bottom right, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "none",
  boxShadow: vars.shadow.lg,
});
globalStyle(`${themeClassLight} ${heroWrap}`, {
  boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
});

// Înălțimi declarate → rezervă spațiul (0 CLS)
export const hSm = style({
  height: "360px",
});
export const hMd = style({
  height: "520px",
});
export const hLg = style({
  height: "720px",
});

// ==============================
// Layering
// ==============================
export const hero = style({ position: "relative" });

export const heroMedia = style({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
});

export const heroImg = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  transformOrigin: "center",
  willChange: "transform",
  // animația e pe transform → nu afectează layout
  "@media": {
    "(prefers-reduced-motion: no-preference)": { animation: `${kenburns} 16s ease-out both` },
  },
});

// Safety net pentru orice <img> intern (Next/Image)
globalStyle(`${heroImg} img`, {
  display: "block",
  objectFit: "cover",
  width: "100%",
  height: "100%",
});

// ==============================
// Overlays
// ==============================
export const heroOverlay = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: [
    `linear-gradient(135deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.22) 55%, rgba(0,0,0,0.18) 100%)`,
    `radial-gradient(120% 140% at 0% 0%, rgba(0,0,0,0.14), transparent 60%)`,
    `radial-gradient(140% 120% at 100% 100%, rgba(0,0,0,0.14), transparent 60%)`,
  ].join(", "),
});

export const aurora = style({
  position: "absolute",
  inset: "-2px",
  borderRadius: vars.radius.xl,
  zIndex: 0,
  background: `linear-gradient(
    135deg,
    ${vars.color.primary},
    ${vars.color.secondary},
    #8AB6FF,
    #F595FF,
    ${vars.color.primary}
  )`,
  backgroundSize: "200% 200%",
  opacity: 0.32,
  filter: "blur(10px)",
  pointerEvents: "none",
  mixBlendMode: "screen",
  "@media": {
    "(prefers-reduced-motion: no-preference)": { animation: `${shimmer} 6s linear infinite` },
  },
});

export const glowBand = style({
  position: "absolute",
  left: "-28%",
  right: "-28%",
  top: "22%",
  height: "56%",
  pointerEvents: "none",
  zIndex: 1,
  background:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)",
  filter: "blur(26px)",
  transform: "rotate(135deg)",
  willChange: "transform",
  opacity: 0.23,
  mixBlendMode: "screen",
  "@media": {
    "(prefers-reduced-motion: no-preference)": {
      animation: `${sweep} 14s ease-in-out infinite alternate`,
    },
  },
});

// ==============================
// Orbs
// ==============================
export const orbA = style({
  position: "absolute",
  width: 240,
  height: 240,
  left: -80,
  top: -80,
  borderRadius: "50%",
  background: `radial-gradient(closest-side, ${vars.color.primary}, transparent 70%)`,
  opacity: 0.22,
  zIndex: 0,
  pointerEvents: "none",
});
export const orbB = style({
  position: "absolute",
  width: 280,
  height: 280,
  right: -90,
  bottom: -90,
  borderRadius: "50%",
  background: `radial-gradient(closest-side, ${vars.color.secondary}, transparent 70%)`,
  opacity: 0.22,
  zIndex: 0,
  pointerEvents: "none",
});

// ==============================
// Content
// ==============================
export const heroInner = style({
  position: "relative",
  zIndex: 2,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  height: "100%",
  padding: "clamp(16px, 4vw, 32px)",
});

// ==============================
// Alignment
// ==============================
export const heroAlignCenter = style({ textAlign: "center", placeItems: "center" });
export const heroAlignStart = style({ textAlign: "left", placeItems: "start" });

// ==============================
// Inner content width
// ==============================
export const innerContent = style({ width: "100%", maxWidth: 980 });

// ==============================
// Text & CTA
// ==============================
export const heroTitle = style({
  margin: 0,
  fontWeight: 800,
  fontSize: "clamp(1.8rem, 4vw, 3rem)",
  lineHeight: 1.2,
  color: "#fff",
  letterSpacing: "0.3px",
});
export const heroSub = style({
  marginTop: 8,
  fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
  opacity: 0.95,
  color: "#fff",
});
export const ctaDock = style({
  marginTop: "1rem",
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.lg,
  border: "2px solid #fff",
  background: "rgba(0,0,0,0.14)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
});
