// styles/sectionBase.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

// ==============================
// Classes
// ==============================
export const section = style({
  width: "100%",
  paddingInline: "clamp(16px, 4vw, 32px)",
  paddingBlock: "clamp(24px, 5vw, 56px)",
});

export const container = style({
  maxWidth: "1200px",
  margin: "0 auto",
});

export const narrow = style({
  maxWidth: "780px",
  margin: "0 auto",
});

export const center = style({
  textAlign: "center",
});

export const eyebrow = style({
  fontSize: "0.875rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  opacity: 0.8,
  marginBottom: "0.5rem",
});

export const heading = style({
  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
  lineHeight: 1.2,
  margin: 0,
});

export const lede = style({
  fontSize: "clamp(1rem, 1.8vw, 1.125rem)",
  opacity: 0.9,
  marginTop: "0.75rem",
});

export const content = style({
  marginTop: "1.25rem",
});
