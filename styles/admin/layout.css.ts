// styles/admin/layout.css.ts

import { style } from "@vanilla-extract/css";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const wrapper = style({
  display: "flex",
  minHeight: "100vh",
  fontFamily: FONT,
});

// ── Sidebar ──────────────────────────────────────────────
export const sidebar = style({
  width: "232px",
  flexShrink: 0,
  backgroundColor: "#12122a",
  color: "#d4d4e8",
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto",
});

export const brand = style({
  padding: "20px 18px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  marginBottom: "4px",
  display: "flex",
  flexDirection: "column",
  gap: "3px",
});

export const brandName = style({
  fontWeight: 700,
  fontSize: "15px",
  color: "#ffffff",
  letterSpacing: "-0.01em",
});

export const brandSub = style({
  fontSize: "10px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.3)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
});

export const nav = style({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  padding: "8px 10px",
  flex: 1,
});

export const navLink = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "9px 10px",
  borderRadius: "7px",
  color: "rgba(255,255,255,0.55)",
  textDecoration: "none",
  fontSize: "13.5px",
  fontWeight: 500,
  transition: "background-color 0.12s, color 0.12s",
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.9)",
    },
  },
});

export const navLinkActive = style({
  backgroundColor: "rgba(85,97,242,0.18)",
  color: "#ffffff",
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(85,97,242,0.25)",
    },
  },
});

export const navBadge = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "19px",
  height: "19px",
  padding: "0 5px",
  backgroundColor: "#5561F2",
  color: "#ffffff",
  borderRadius: "10px",
  fontSize: "11px",
  fontWeight: 700,
});

export const logoutBtn = style({
  margin: "4px 10px 16px",
  padding: "9px 10px",
  backgroundColor: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.35)",
  fontSize: "13.5px",
  fontWeight: 500,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "7px",
  transition: "color 0.12s, background-color 0.12s",
  selectors: {
    "&:hover": {
      color: "#ff7070",
      backgroundColor: "rgba(255,112,112,0.1)",
    },
  },
});

// ── Main content ──────────────────────────────────────────
export const main = style({
  flex: 1,
  minWidth: 0,
  padding: "32px 36px",
  backgroundColor: "#f2f3f7",
});
