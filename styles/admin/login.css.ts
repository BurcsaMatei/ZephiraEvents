// styles/admin/login.css.ts

import { style } from "@vanilla-extract/css";

export const wrapper = style({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "#f4f5f7",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
});

export const card = style({
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
});

export const logo = style({
  margin: "0 0 4px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1a2e",
  textAlign: "center",
  letterSpacing: "-0.02em",
});

export const subtitle = style({
  margin: "0 0 32px",
  fontSize: "13px",
  color: "#888",
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
  fontWeight: 600,
  color: "#444",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const input = style({
  padding: "10px 14px",
  border: "1.5px solid #d8d8e0",
  borderRadius: "8px",
  fontSize: "15px",
  color: "#1a1a2e",
  outline: "none",
  transition: "border-color 0.15s",
  selectors: {
    "&:focus": {
      borderColor: "#5561F2",
    },
  },
});

export const errorBox = style({
  padding: "10px 14px",
  backgroundColor: "#fff0f0",
  border: "1px solid #f5c6c6",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#b00020",
  marginBottom: "16px",
});

export const button = style({
  width: "100%",
  padding: "12px",
  backgroundColor: "#5561F2",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "8px",
  transition: "background-color 0.15s",
  selectors: {
    "&:hover:not(:disabled)": {
      backgroundColor: "#4450d0",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
});
