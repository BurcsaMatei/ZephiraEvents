// styles/footer.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Tokens & utilities
// ==============================
const iconBase = {
  display: "inline-block",
  width: 22,
  height: 22,
  backgroundColor: "currentColor",
  WebkitMaskRepeat: "no-repeat" as const,
  maskRepeat: "no-repeat" as const,
  WebkitMaskPosition: "center" as const,
  maskPosition: "center" as const,
  WebkitMaskSize: "contain" as const,
  maskSize: "contain" as const,
};

// ==============================
// Classes
// ==============================

// Root
export const footerClass = style({
  background: vars.color.bg,
  color: vars.color.text,
  borderTop: `1px solid ${vars.color.border}`,
  marginTop: vars.space.lg,
});

// Inner
export const footerInnerClass = style({
  maxWidth: 1200,
  margin: "0 auto",
  padding: `${vars.space.md} ${vars.space.lg}`,
  textAlign: "center",
  fontSize: "1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

// Logo box
export const footerLogoBoxClass = style({
  minHeight: "40px",
  lineHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: "8px",
  paddingBottom: "8px",
  position: "relative",
  zIndex: 2,
  isolation: "isolate",
  contain: "paint",
});

// Logo link
export const footerLogoLink = style({
  lineHeight: 0,
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
  minWidth: 40,
  minHeight: 10,
  flexShrink: 0,
});

// Logo img
export const footerLogoImg = style({
  display: "inline-block",
  width: "auto",
  height: 24, // mobil
  maxWidth: "100%",
  maxHeight: "none",
  flexShrink: 0,
  objectFit: "contain",
  opacity: 1,
  visibility: "visible",
  "@media": {
    [mq.md]: { height: 28 }, // tabletă
    [mq.lg]: { height: 32 }, // desktop
  },
});

// Divider
export const footerDividerClass = style({
  width: "100%",
  border: "none",
  borderTop: `1px solid ${vars.color.border}`,
  margin: "8px 0 12px 0",
});

// Social row
export const footerSocialRow = style({
  display: "flex",
  justifyContent: "center",
  gap: 16,
  marginBottom: 8,
});

// Social link (hit target ≥44px)
export const socialLink = style({
  color: vars.color.text,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  borderRadius: 999,
  ":hover": { color: vars.color.link },
  ":focus-visible": {
    outline: `2px solid ${vars.color.focus}`,
    outlineOffset: 2,
    borderRadius: 8,
  },
});

export const iconFacebook = style({
  ...iconBase,
  WebkitMaskImage: "url('/icons/facebook.svg')",
  maskImage: "url('/icons/facebook.svg')",
});

export const iconInstagram = style({
  ...iconBase,
  WebkitMaskImage: "url('/icons/instagram.svg')",
  maskImage: "url('/icons/instagram.svg')",
});

export const iconTiktok = style({
  ...iconBase,
  WebkitMaskImage: "url('/icons/tiktok.svg')",
  maskImage: "url('/icons/tiktok.svg')",
});

// Copy
export const footerCopyClass = style({
  display: "block",
  marginTop: "4px",
});

// Links row
export const footerLinksRowClass = style({
  marginTop: "8px",
  fontSize: "14px",
});
