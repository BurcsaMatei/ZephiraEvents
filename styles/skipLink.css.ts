// styles/skipLink.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// ==============================
// Classes
// ==============================
export const skipLink = style({
  position: "fixed",
  top: "calc(env(safe-area-inset-top, 0px) + 8px)",
  left: "calc(env(safe-area-inset-left, 0px) + 8px)",
  zIndex: 1001, // peste header/overlays uzuale
  background: vars.color.surface,
  color: vars.color.text,
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  lineHeight: 1.2,
  fontWeight: 600,
  boxShadow: vars.shadow.sm,
  transform: "translateY(-150%)",
  transition: `transform ${vars.motion.fast} ${vars.motion.easing}`,
  selectors: {
    // Afișare doar la focus de tastatură
    "&:focus-visible": {
      transform: "translateY(0)",
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 2,
    },
  },
});
