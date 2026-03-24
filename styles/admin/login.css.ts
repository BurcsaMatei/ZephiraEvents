// styles/admin/login.css.ts

import { style } from "@vanilla-extract/css";

import { themeClassDark, vars } from "../theme.css";

export const wrapper = style({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "#f4f5f7",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  selectors: {
    [`.${themeClassDark} &`]: { backgroundColor: vars.color.bg },
  },
});

export const card = style({
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.lg,
  padding: "40px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
});

export const logo = style({
  margin: "0 0 4px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  textAlign: "center",
  letterSpacing: "-0.02em",
});

export const subtitle = style({
  margin: "0 0 32px",
  fontSize: "13px",
  color: vars.color.muted,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
});

export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "16px",
});

export const label = style({
  fontSize: "13px",
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const input = style({
  padding: "10px 14px",
  border: "1.5px solid #d8d8e0",
  borderRadius: vars.radius.sm,
  fontSize: "15px",
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: "none",
  transition: `border-color ${vars.motion.normal}`,
  // Fix autofill background/text pe Chrome/Safari mobile
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: {
    "&:focus": {
      borderColor: vars.color.primary,
    },
  },
});

export const rememberRow = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "16px",
});

export const checkbox = style({
  width: "16px",
  height: "16px",
  cursor: "pointer",
  accentColor: vars.color.primary,
  flexShrink: 0,
});

export const rememberLabel = style({
  fontSize: "13.5px",
  color: vars.color.muted,
  cursor: "pointer",
  userSelect: "none",
});

export const errorBox = style({
  padding: "10px 14px",
  backgroundColor: "#fff0f0",
  border: "1px solid #f5c6c6",
  borderRadius: vars.radius.sm,
  fontSize: "14px",
  color: "#b00020",
  marginBottom: "16px",
});

export const button = style({
  width: "100%",
  padding: "12px",
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: vars.radius.sm,
  fontSize: "15px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  marginTop: "8px",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": {
      backgroundColor: vars.color.primaryHover,
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
});
