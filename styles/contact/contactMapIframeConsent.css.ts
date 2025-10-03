// styles/contact/contactMapIframeConsent.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

// ==============================
// Classes
// ==============================
export const centerText = style({
  textAlign: "center",
});

export const consentP = style({
  marginTop: 0,
  marginBottom: "12px",
});

export const mapWrap = style({
  position: "relative",
  width: "100%",
  aspectRatio: "16/9",
  overflow: "hidden",
});

export const iframeFull = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  border: 0,
});
