// styles/admin/compose.css.ts

import { style } from "@vanilla-extract/css";

export const pageTitle = style({
  margin: "0 0 24px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1a2e",
  letterSpacing: "-0.02em",
});

export const card = style({
  backgroundColor: "#ffffff",
  border: "1.5px solid #e8e8f0",
  borderRadius: "10px",
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
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

export const input = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: "14px",
  color: "#1a1a2e",
  outline: "none",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
  selectors: {
    "&:focus": { borderColor: "#5561F2" },
  },
});

export const textarea = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: "14px",
  color: "#1a1a2e",
  outline: "none",
  resize: "vertical",
  minHeight: "180px",
  lineHeight: 1.55,
  fontFamily: "inherit",
  transition: "border-color 0.15s",
  selectors: {
    "&:focus": { borderColor: "#5561F2" },
  },
});

export const button = style({
  padding: "10px 24px",
  backgroundColor: "#5561F2",
  color: "#ffffff",
  border: "none",
  borderRadius: "7px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s",
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: "#4450d0" },
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
