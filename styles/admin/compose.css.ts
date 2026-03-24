// styles/admin/compose.css.ts

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

export const pageTitle = style({
  margin: "0 0 24px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: "28px",
  maxWidth: "640px",
});

export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "16px",
});

export const label = style({
  fontSize: vars.typography.size.xs,
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

export const input = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: "none",
  transition: `border-color ${vars.motion.normal}`,
  fontFamily: "inherit",
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: {
    "&:focus": { borderColor: vars.color.primary },
  },
});

export const textarea = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: "none",
  resize: "vertical",
  minHeight: "180px",
  lineHeight: 1.55,
  fontFamily: "inherit",
  transition: `border-color ${vars.motion.normal}`,
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: {
    "&:focus": { borderColor: vars.color.primary },
  },
});

export const button = style({
  padding: "10px 24px",
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: "7px",
  fontSize: vars.typography.size.sm,
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: vars.color.primaryHover },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const successMsg = style({
  padding: "10px 14px",
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "7px",
  fontSize: "13.5px",
  color: "#15803d",
  marginBottom: "16px",
});

export const errorMsg = style({
  padding: "10px 14px",
  backgroundColor: "#fff0f0",
  border: "1px solid #fecaca",
  borderRadius: "7px",
  fontSize: "13.5px",
  color: "#b91c1c",
  marginBottom: "16px",
});
