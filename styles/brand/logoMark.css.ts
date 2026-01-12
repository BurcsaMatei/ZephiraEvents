// styles/brand/logoMark.css.ts

// ==============================
// Imports
// ==============================
import { createVar, style } from "@vanilla-extract/css";

import { themeClassDark, themeClassLight, vars } from "../theme.css";

// ==============================
// Vars
// ==============================
export const logoStop1Var = createVar();
export const logoStop2Var = createVar();
export const logoStop3Var = createVar();

// ==============================
// Classes
// ==============================
export const logoMarkSvg = style({
  display: "block",
  width: "auto",
  height: "auto",
  // fallback sigur
  vars: {
    [logoStop1Var]: vars.color.text,
    [logoStop2Var]: vars.color.primary,
    [logoStop3Var]: vars.color.primary,
  },
  selectors: {
    // Light: același “text gradient” ca la LogoBeforeIntro (bazat pe tokens)
    [`${themeClassLight} &`]: {
      vars: {
        [logoStop1Var]: `color-mix(in srgb, ${vars.color.text} 96%, ${vars.color.primary} 4%)`,
        [logoStop2Var]: `color-mix(in srgb, ${vars.color.primary} 70%, ${vars.color.text} 30%)`,
        [logoStop3Var]: `color-mix(in srgb, ${vars.color.primary} 85%, ${vars.color.text} 15%)`,
      },
    },

    // Dark: tot același limbaj vizual, dar “mai albastru” natural (tokens dark)
    [`${themeClassDark} &`]: {
      vars: {
        [logoStop1Var]: `color-mix(in srgb, ${vars.color.text} 92%, ${vars.color.primary} 8%)`,
        [logoStop2Var]: `color-mix(in srgb, ${vars.color.primary} 78%, ${vars.color.text} 22%)`,
        [logoStop3Var]: `color-mix(in srgb, ${vars.color.primary} 90%, ${vars.color.text} 10%)`,
      },
    },
  },
});
