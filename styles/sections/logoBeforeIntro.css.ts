// styles/sections/logoBeforeIntro.css.ts

// ==============================
// Imports
// ==============================
import { keyframes, style } from "@vanilla-extract/css";

// ==============================
// Keyframes
// ==============================
const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

// ==============================
// Classes
// ==============================
export const root = style({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  marginBottom: "20px",
});

export const svg = style({
  display: "block",
  width: "min(420px, 100%)",
  height: "auto",
});

export const diamondSpin = style({
  transformOrigin: "center",
  transformBox: "fill-box",
  willChange: "transform",
  animation: `${spin} 10s linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});
