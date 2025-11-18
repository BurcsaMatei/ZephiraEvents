// styles/contact/ContactMapAddress.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Classes
// ==============================
export const root = style({
  display: "flex",
  justifyContent: "center",
  marginBottom: vars.space.lg,
  paddingInline: vars.space.md,
  "@media": {
    [mq.lg]: {
      paddingInline: vars.space.lg,
    },
  },
});

export const panel = style({
  width: "100%",
  maxWidth: 720,
  borderRadius: vars.radius.lg,
  padding: `${vars.space.lg} ${vars.space.md}`,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.shadow.sm,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
  "@media": {
    [mq.lg]: {
      padding: `${vars.space.xl} ${vars.space.lg}`,
    },
  },
});

export const address = style({
  margin: 0,
  color: vars.color.text,
  fontSize: vars.typography.size.lg,
  fontWeight: vars.typography.weight.semibold,
  lineHeight: vars.typography.leading.normal,
  maxWidth: "70ch",
  marginInline: "auto",
});

export const label = style({
  fontWeight: vars.typography.weight.bold,
  marginRight: vars.space.xs,
});

export const button = style({
  alignSelf: "center",
  marginTop: vars.space.sm,
});
