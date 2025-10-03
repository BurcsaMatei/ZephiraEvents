// styles/separator.css.ts

// ==============================
// Imports
// ==============================
import { createVar, style, styleVariants } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Tokens & utilities
// ==============================
/** CSS variables pentru control runtime */
export const sepLengthVar = createVar(); // lungimea liniei (w/h în funcție de orientare)
export const sepThicknessVar = createVar(); // grosimea liniei

// ==============================
// Classes
// ==============================
/** Baza comună (reset + fallback vars implicite) */
export const root = style({
  border: "none",
  background: "transparent",
  borderRadius: "2px",
  // Valori implicite — replica setup inițial: 110px lungime, 2px grosime
  vars: {
    [sepLengthVar]: "110px",
    [sepThicknessVar]: "2px",
  },
});

/** Orientări */
export const horizontal = style({
  height: 0,
  width: sepLengthVar,
  maxWidth: "40vw", // poate fi suprascris via prop
  borderTopStyle: "solid",
  borderTopWidth: sepThicknessVar,
});

export const vertical = style({
  width: 0,
  height: sepLengthVar,
  borderLeftStyle: "solid",
  borderLeftWidth: sepThicknessVar,
});

/** Tonuri cromatice (setează borderColor; partea activă primește culoarea) */
export const tone = styleVariants({
  primary: { borderColor: vars.color.primary },
  muted: { borderColor: vars.color.border },
  subtle: { borderColor: vars.color.muted },
});

/** Mărimi: setează grosimea + spațierea verticală (sus/jos) */
export const size = styleVariants({
  sm: {
    // grosime mai fină
    vars: { [sepThicknessVar]: "1px" },
    marginTop: `calc(${vars.space.xl} * 0.66)`,
    marginBottom: `calc(${vars.space.xl} * 0.66)`,
  },
  md: {
    vars: { [sepThicknessVar]: "2px" },
    marginTop: vars.space.xl,
    marginBottom: vars.space.xl,
  },
  lg: {
    vars: { [sepThicknessVar]: "3px" },
    marginTop: `calc(${vars.space.xl} * 1.5)`,
    marginBottom: `calc(${vars.space.xl} * 1.5)`,
  },
});

/** Aliniere pe orizontală (în container) */
export const align = styleVariants({
  start: {
    marginLeft: 0,
    marginRight: "auto",
  },
  center: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  end: {
    marginLeft: "auto",
    marginRight: 0,
  },
});

/** Variantă opțională cu umbră discretă */
export const elevated = style({
  boxShadow: vars.shadow.sm,
});
