// styles/forms/offerRequest.css.ts
// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Base
// ==============================
export const wrap = style({
  display: "block",
});

export const title = style({
  fontFamily: vars.typography.font.heading,
  fontSize: vars.typography.size["2xl"],
  fontWeight: vars.typography.weight.semibold,
  margin: 0,
  color: vars.color.text,
});

export const lead = style({
  marginTop: vars.space.sm,
  marginBottom: vars.space.lg,
  color: vars.color.muted,
  lineHeight: vars.typography.leading.relaxed,
});

export const hint = style({
  color: vars.color.text,
});

export const link = style({
  color: vars.color.link,
  selectors: {
    "&:hover": { color: vars.color.linkHover },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  },
});

// ==============================
// Form layout
// ==============================
export const form = style({
  display: "grid",
  gap: vars.space.lg,
});

export const fieldset = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space.lg,
});

export const legend = style({
  padding: `0 ${vars.space.sm}`,
  color: vars.color.text,
  fontWeight: vars.typography.weight.semibold,
  fontSize: vars.typography.size.lg,
});

export const label = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
});

export const req = style({
  color: vars.color.muted,
  fontSize: vars.typography.size.sm,
  marginLeft: vars.space.xs,
});

export const subtle = style({
  color: vars.color.muted,
  fontSize: vars.typography.size.sm,
});

export const inlineRow = style({
  display: "grid",
  gap: vars.space.md,
  "@media": {
    [mq.md]: { gridTemplateColumns: "1fr 1fr 1fr" },
  },
});

export const input = style({
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.text,
  borderRadius: vars.radius.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  selectors: {
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 1 },
  },
});

export const select = input;

export const textarea = style([
  input,
  {
    minHeight: 120,
    resize: "vertical",
  },
]);

export const checkboxLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.sm,
  marginTop: vars.space.sm,
});

export const checkbox = style({
  width: 18,
  height: 18,
});

export const radioRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.md,
  marginBottom: vars.space.md,
});

export const radioLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
});

export const radio = style({
  width: 16,
  height: 16,
});

// Honeypot + reCAPTCHA
export const honeypot = style({
  position: "absolute",
  left: "-5000px",
  width: 0,
  height: 0,
  opacity: 0.001,
});

export const recaptchaBox = style({
  marginTop: vars.space.md,
});

// Status + submit
export const status = style({
  minHeight: 20,
});

export const error = style({
  color: "#cc3b3b",
});

export const submitRow = style({
  display: "flex",
  justifyContent: "flex-start",
  marginTop: vars.space.sm,
});

// Toast
export const toast = style({
  marginTop: vars.space.md,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.sm,
  background: vars.color.surfaceHover,
  boxShadow: vars.shadow.sm,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
});

// GDPR
export const gdpr = style({
  marginTop: vars.space.sm,
});
