// styles/contact/ContactSlaCard.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

// ==============================
// Classes
// ==============================

// Card override (same base as card.css; light hover alignment like FormContact)
export const cardOverride = style({
  height: "auto",
  maxWidth: 520,
  margin: "0 auto",
  selectors: {
    "&:hover": {
      transform: "none",
      boxShadow: vars.shadow.md,
      borderColor: vars.color.primary,
    },
  },
});

export const cardInner = style({
  display: "grid",
  gap: vars.space.md,
});

export const headerRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
});

export const title = style({
  margin: 0,
  fontWeight: 700,
  fontSize: "1.1rem",
  color: vars.color.text,
});

export const lead = style({
  margin: 0,
  color: vars.color.muted,
});

// listă program
export const list = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: vars.space.sm,
});

export const listItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const listIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  color: vars.color.primary, // currentColor pentru AnimatedIcon
});

export const listText = style({
  color: vars.color.text,
});

// butoane
export const actions = style({
  display: "flex",
  gap: vars.space.md,
  alignItems: "center",
});

// mini card
export const miniCard = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  gap: vars.space.md,
  padding: vars.space.md,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: vars.color.surface,
});

export const miniIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  color: vars.color.primary,
});

export const miniBody = style({
  display: "grid",
  gap: 4,
});

export const miniTitle = style({
  fontWeight: 700,
  color: vars.color.text,
});

export const miniText = style({
  color: vars.color.muted,
});

// notă GDPR
export const privacyNote = style({
  margin: 0,
  fontSize: "0.92rem",
  lineHeight: 1.35,
  color: vars.color.muted,
  display: "flex",
  alignItems: "center",
  gap: 8,
});

// icon inline generic (moștenește currentColor)
export const inlineIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

// tint pentru header icon
export const iconTint = style({
  color: vars.color.primary,
});
