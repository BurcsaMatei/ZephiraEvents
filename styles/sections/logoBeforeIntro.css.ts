// styles/sections/logoBeforeIntro.css.ts

// ==============================
// Imports
// ==============================
import { keyframes, style } from "@vanilla-extract/css";

import { themeClassDark, themeClassLight, vars } from "../theme.css";

// ==============================
// Keyframes
// ==============================
const axisSpin3d = keyframes({
  "0%": { transform: "perspective(900px) rotateY(0deg)" },
  "50%": { transform: "perspective(900px) rotateY(180deg)" },
  "100%": { transform: "perspective(900px) rotateY(360deg)" },
});

const axisSpin2dFallback = keyframes({
  "0%": { transform: "scaleX(1)" },
  "25%": { transform: "scaleX(0.08)" },
  "50%": { transform: "scaleX(-1)" },
  "75%": { transform: "scaleX(-0.08)" },
  "100%": { transform: "scaleX(1)" },
});

// ==============================
// Classes
// ==============================
export const root = style({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  marginBottom: "20px",
  color: vars.color.text,

  vars: {
    "--ze-logo-g0": vars.color.text,
    "--ze-logo-g50": vars.color.primary,
    "--ze-logo-g100": vars.color.primary,
    "--ze-logo-shadow": "transparent",
  } as Record<`--${string}`, string>,

  selectors: {
    // Light: ~20% mai puțin agresiv față de varianta “hard”
    [`${themeClassLight} &`]: {
      vars: {
        "--ze-logo-g0": `color-mix(in srgb, ${vars.color.text} 84%, ${vars.color.primary} 16%)`,
        "--ze-logo-g50": `color-mix(in srgb, ${vars.color.primary} 78%, ${vars.color.text} 22%)`,
        "--ze-logo-g100": `color-mix(in srgb, ${vars.color.primary} 88%, ${vars.color.text} 12%)`,
        "--ze-logo-shadow": `color-mix(in srgb, ${vars.color.primary} 16%, transparent)`,
      } as Record<`--${string}`, string>,
    },

    // Dark: tranziție mai lină spre “dark”, păstrând gradient albastru (tokens-only)
    [`${themeClassDark} &`]: {
      vars: {
        "--ze-logo-g0": `color-mix(in srgb, ${vars.color.bg} 56%, ${vars.color.primary} 44%)`,
        "--ze-logo-g50": `color-mix(in srgb, ${vars.color.primary} 62%, ${vars.color.link} 38%)`,
        "--ze-logo-g100": `color-mix(in srgb, ${vars.color.bg} 56%, ${vars.color.focus} 44%)`,
        "--ze-logo-shadow": `color-mix(in srgb, ${vars.color.focus} 18%, transparent)`,
      } as Record<`--${string}`, string>,
    },
  },
});

export const svg = style({
  display: "block",
  width: "min(420px, 100%)",
  height: "auto",
  // păstrăm un glow discret (mai puțin agresiv)
  filter: "drop-shadow(0 12px 22px var(--ze-logo-shadow))",
});

export const diamondAxisSpin = style({
  transformOrigin: "center",
  transformBox: "fill-box",
  transformStyle: "preserve-3d",
  backfaceVisibility: "hidden",
  willChange: "transform",

  animation: `${axisSpin3d} 2600ms linear infinite`,

  "@supports": {
    "not (transform: rotateY(180deg))": {
      animation: `${axisSpin2dFallback} 2600ms linear infinite`,
    },
  },

  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});
