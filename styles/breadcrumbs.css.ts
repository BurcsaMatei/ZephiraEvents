// styles/breadcrumbs.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

// ==============================
// Constants
// NOTE: Culorile folosesc CSS Custom Properties cu fallback-uri sigure
// pentru a se integra corect cu temele existente.
// ==============================
const colorLink = "var(--color-link, #1d4ed8)";
const colorLinkHover = "var(--color-link-hover, #1d4ed8)";
const colorCurrent = "var(--color-muted-foreground-strong, #374151)"; // contrast mai bun
const colorSeparator = "var(--color-border, #b5b5b5)";

// ==============================
// Classes
// ==============================
export const breadcrumbsWrapperClass = style({
  margin: "1rem 0",
  display: "flex",
  justifyContent: "center",
});

export const breadcrumbsListClass = style({
  display: "flex",
  alignItems: "center",
  listStyle: "none",
  padding: 0,
  margin: 0,
});

export const breadcrumbItemClass = style({
  display: "flex",
  alignItems: "center",
});

export const breadcrumbSeparatorClass = style({
  margin: "0 0.5rem",
  color: colorSeparator,
});

export const breadcrumbLinkClass = style({
  color: colorLink,
  textDecoration: "none",
  selectors: {
    "&:hover": { textDecoration: "underline", color: colorLinkHover },
    "&:focus-visible": {
      outline: "2px solid currentColor",
      outlineOffset: "2px",
      textDecoration: "none",
    },
  },
});

export const breadcrumbCurrentClass = style({
  color: colorCurrent,
});
