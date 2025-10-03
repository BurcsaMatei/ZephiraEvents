// styles/theme.global.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle } from "@vanilla-extract/css";

import { themeClassDark, themeClassLight, vars } from "./theme.css";

// ==============================
// Global styles
// ==============================
/* HTML root: capabilități globale (fără culori aici) */
globalStyle("html", {
  colorScheme: "light dark",
  // Stabilizează vw pentru full-bleed (previne micro-CLS la apariția scrollbarului)
  scrollbarGutter: "stable",
});

/* Body + temă (culorile vin din tokens) */
globalStyle("body", {
  margin: 0,
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
});

globalStyle(`${themeClassLight} body`, {
  background: vars.color.bg,
  color: vars.color.text,
});

globalStyle(`${themeClassDark} body`, {
  background: vars.color.bg,
  color: vars.color.text,
});

/* Elemente media – comportament predictibil */
globalStyle("img, picture, video, canvas, svg", {
  display: "block",
  maxWidth: "100%",
});
globalStyle("img", { height: "auto" });

/* Tipografie de bază */
globalStyle("h1, h2, h3, h4, h5, h6", { margin: 0, fontWeight: 600 });
globalStyle("p", { marginBlock: vars.space.md });

/* Layout helpers: .container / .section */
globalStyle(".container", {
  width: "100%",
  maxWidth: vars.layout.max.lg, // <— folosește tokens reale: layout.max.{md,lg,xl}
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: vars.space.md,
  paddingRight: vars.space.md,
});
globalStyle(".section", { paddingBlock: vars.space.xl });

/* Link & focus */
globalStyle(`${themeClassLight} a:not([class])`, { color: vars.color.link });
globalStyle(`${themeClassLight} a:not([class]):hover`, { color: vars.color.linkHover });
globalStyle(`${themeClassDark} a:not([class])`, { color: vars.color.link });
globalStyle(`${themeClassDark} a:not([class]):hover`, { color: vars.color.linkHover });

globalStyle(`${themeClassLight} :focus-visible`, {
  outlineColor: vars.color.focus,
  outlineOffset: 2,
});
globalStyle(`${themeClassDark} :focus-visible`, {
  outlineColor: vars.color.focus,
  outlineOffset: 2,
});

/* Utilitare mici */
globalStyle(".u-text-center", { textAlign: "center" });
globalStyle(".u-mt-md", { marginTop: vars.space.md });
globalStyle(".u-h-1", { height: "1px" });

/* SR-only */
globalStyle(".sr-only", {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});
