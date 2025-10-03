// styles/container.css.ts

// ==============================
// Imports
// ==============================
import { createTheme, createVar, globalStyle, style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Constante
// ==============================

// Contract variabile container
export const containerVars = {
  max: createVar(), // lățimea maximă a containerului
  padX: createVar(), // padding orizontal
};

// Teme (seturi de valori globale)
export const containerThemeDefault = createTheme(containerVars, {
  max: vars.layout.max.md, // ex: 1200px
  padX: vars.space.lg, // ex: 16px/24px etc.
});

export const containerThemeWide = createTheme(containerVars, {
  max: vars.layout.max.lg, // ex: 1320px
  padX: vars.space.lg,
});

// ==============================
// Classes
// ==============================

// Scope global de pagină
/**
 * Aplica această clasă pe wrapper-ul paginii (ex: <main className={pageScope}>)
 * pentru a activa containerul automat pe toate <section>-urile.
 */
export const pageScope = style({});

// Toate <section> din pageScope primesc container (cu opt-out pentru full-bleed)
globalStyle(`.${pageScope} section:not(.fullBleed):not([data-full-bleed="true"])`, {
  width: "100%",
  maxWidth: containerVars.max,
  margin: "0 auto",
  boxSizing: "border-box",
  paddingLeft: containerVars.padX,
  paddingRight: containerVars.padX,
});

// La ecrane mari, creștem padding-ul orizontal (se aplică tuturor temelor)
globalStyle(`.${pageScope}`, {
  "@media": {
    [mq.lg]: {
      vars: {
        [containerVars.padX]: vars.space.xl,
      },
    },
  },
});

// Clase directe (compat / opțional)
/**
 * Pentru cazuri unde vrei să aplici manual containerul pe un element.
 * Ideal însă să folosești doar `pageScope` + teme globale.
 */
export const container = style({
  width: "100%",
  maxWidth: containerVars.max,
  margin: "0 auto",
  boxSizing: "border-box",
  paddingLeft: containerVars.padX,
  paddingRight: containerVars.padX,
});

// Aliasuri compatibile cu implementarea anterioară
export const containerWide = container; // tema (Default/Wide) controlează lățimea
export const headerWide = container; // idem

// Opt-out pentru secțiuni full-bleed
export const fullBleed = style({});
