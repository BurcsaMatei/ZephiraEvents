// styles/prose.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

// ==============================
// Classes
// ==============================
export const proseClass = style({
  // clasa părinte pentru conținut
});

// ==============================
// Global styles
// ==============================
globalStyle(`${proseClass} h1, ${proseClass} h2, ${proseClass} h3, ${proseClass} h4`, {
  lineHeight: 1.2,
  marginTop: 28,
  marginBottom: 12,
});

globalStyle(`${proseClass} p`, {
  margin: "12px 0",
});

globalStyle(`${proseClass} ul, ${proseClass} ol`, {
  margin: "12px 0 12px 24px",
});

globalStyle(`${proseClass} a`, {
  color: "#0ea5e9",
  textDecoration: "underline",
});

globalStyle(`${proseClass} blockquote`, {
  borderLeft: "3px solid #e5e7eb",
  paddingLeft: 16,
  color: "#4b5563",
  margin: "16px 0",
});

globalStyle(`${proseClass} img`, {
  maxWidth: "100%",
  borderRadius: 12,
});

globalStyle(`${proseClass} pre`, {
  background: "#0b1020",
  color: "#e5e7eb",
  padding: 16,
  borderRadius: 12,
  overflowX: "auto",
});

globalStyle(`${proseClass} code`, {
  background: "#f3f4f6",
  padding: "2px 6px",
  borderRadius: 6,
});
