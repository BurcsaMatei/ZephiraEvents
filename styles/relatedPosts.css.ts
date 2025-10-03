// styles/relatedPosts.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

// ==============================
// Classes
// ==============================
export const relatedWrapClass = style({
  maxWidth: 820,
  margin: "32px auto 64px",
});

export const relatedTitleClass = style({
  fontSize: 20,
  lineHeight: 1.2,
  marginBottom: 12,
});

export const relatedListClass = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  rowGap: 10,
});

export const relatedLinkClass = style({
  color: "#0ea5e9",
  textDecoration: "underline",
  selectors: { "&:hover": { textDecoration: "none" } },
});
