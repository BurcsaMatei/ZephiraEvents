// styles/outroContact.css.ts
//
// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Classes
// ==============================
export const actions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.md,
  justifyContent: "center",
  marginTop: vars.space.lg,
  "@media": {
    [mq.lg]: { gap: vars.space.lg },
  },
});
