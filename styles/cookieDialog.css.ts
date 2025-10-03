// styles/cookieDialog.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Classes
// ==============================
export const overlay = style({
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  display: "grid",
  placeItems: "center",
  zIndex: vars.z.overlay,
});

export const overlayCloser = style({
  position: "fixed",
  inset: 0,
  background: "transparent",
  border: 0,
  padding: 0,
  margin: 0,
  cursor: "default",
});

export const card = style({
  background: vars.color.surface,
  color: vars.color.text,
  maxWidth: 560,
  width: "92vw",
  padding: vars.space.md,
  borderRadius: vars.radius.lg, // 12px echivalentul inline-ului precedent
  boxShadow: "0 10px 40px rgba(0,0,0,.18)",
  position: "relative",
});

export const title = style({
  marginTop: 0,
  marginBottom: 8,
  lineHeight: 1.2,
});

export const description = style({
  marginTop: 0,
  opacity: 0.85,
});

export const fieldset = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.sm,
  marginTop: vars.space.sm,
});

export const legend = style({
  padding: "0 6px",
  fontWeight: 700,
});

export const labelRow = style({
  display: "flex",
  gap: vars.space.sm,
  alignItems: "center",
});

export const dialogActions = style({
  display: "flex",
  gap: vars.space.sm,
  justifyContent: "flex-end",
  marginTop: vars.space.sm,
  "@media": {
    [mq.lg]: { marginTop: vars.space.md },
  },
});
