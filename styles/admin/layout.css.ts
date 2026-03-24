// styles/admin/layout.css.ts

import { style } from "@vanilla-extract/css";

import { themeClassDark, vars } from "../theme.css";

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
  backgroundColor: vars.color.bg,       // era #12122a
  color: vars.color.text,               // era #d4d4e8
  borderRight: `1px solid ${vars.color.border}`,
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto",
  transition: "transform 300ms ease",
  "@media": {
    "screen and (max-width: 767px)": {
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 300,
      transform: "translateX(-100%)",
    },
  },
});

export const sidebarOpen = style({
  "@media": {
    "screen and (max-width: 767px)": {
      transform: "translateX(0)",
    },
  },
});

// ── Overlay (mobil, vizibil doar când sidebar deschis) ────
export const overlay = style({
  position: "fixed",
  inset: 0,
  backgroundColor: vars.color.overlay,
  zIndex: 200,
});

// ── Hamburger ────────────────────────────────────────────
export const hamburger = style({
  display: "none",
  "@media": {
    "screen and (max-width: 767px)": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "fixed",
      top: "14px",
      left: "14px",
      zIndex: 200,
      width: "38px",
      height: "38px",
      backgroundColor: vars.color.bg,    // era #12122a
      color: vars.color.text,            // era #ffffff
      border: "none",
      borderRadius: vars.radius.sm,
      fontSize: vars.typography.size.lg,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    },
  },
});

export const brand = style({
  padding: "20px 18px 16px",
  borderBottom: `1px solid ${vars.color.border}`,  // era rgba(255,255,255,0.07)
  marginBottom: "4px",
  display: "flex",
  flexDirection: "column",
  gap: "3px",
});

export const brandName = style({
  fontWeight: vars.typography.weight.bold,
  fontSize: "15px",
  color: vars.color.text,               // era #ffffff
  letterSpacing: "-0.01em",
});

export const brandSub = style({
  fontSize: "10px",
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,              // era rgba(255,255,255,0.3)
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
  color: vars.color.muted,              // era rgba(255,255,255,0.55)
  textDecoration: "none",
  fontSize: "13.5px",
  fontWeight: vars.typography.weight.medium,
  transition: `background-color ${vars.motion.normal}, color ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.surface,  // era rgba(255,255,255,0.06)
      color: vars.color.text,               // era rgba(255,255,255,0.9)
    },
  },
});

export const navLinkActive = style({
  backgroundColor: vars.color.primary,          // era rgba(85,97,242,0.18)
  color: vars.color.primaryContrast,            // era #ffffff
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.primaryHover, // era rgba(85,97,242,0.25)
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
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  borderRadius: vars.radius.md,
  fontSize: "11px",
  fontWeight: vars.typography.weight.bold,
});

export const installBtn = style({
  margin: "0 10px 8px",
  padding: "9px 10px",
  backgroundColor: "rgba(85,97,242,0.15)",
  border: "1px solid rgba(85,97,242,0.35)",
  color: vars.color.text,               // era rgba(255,255,255,0.8)
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "7px",
  transition: `background-color ${vars.motion.normal}, color ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(85,97,242,0.28)",
      color: vars.color.text,           // era #ffffff
    },
  },
});

export const installIosHint = style({
  margin: "0 10px 8px",
  padding: "9px 10px",
  backgroundColor: vars.color.surfaceHover,  // era rgba(255,255,255,0.04)
  border: `1px solid ${vars.color.border}`,  // era rgba(255,255,255,0.1)
  borderRadius: "7px",
  fontSize: "11.5px",
  color: vars.color.muted,              // era rgba(255,255,255,0.45)
  lineHeight: 1.5,
});

export const logoutBtn = style({
  flex: 1,
  padding: "9px 10px",
  backgroundColor: "transparent",
  border: "none",
  color: vars.color.muted,              // era rgba(255,255,255,0.35)
  fontSize: "13.5px",
  fontWeight: vars.typography.weight.medium,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "7px",
  transition: `color ${vars.motion.normal}, background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      color: "#ff7070",
      backgroundColor: "rgba(255,112,112,0.1)",
    },
  },
});

// ── Sidebar footer (logout + theme toggle) ────────────────
export const sidebarFooter = style({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  margin: "0 10px",
  padding: "12px 0 16px",
  borderTop: `1px solid ${vars.color.border}`,  // nou
});

// ── Main content ──────────────────────────────────────────
export const main = style({
  flex: 1,
  minWidth: 0,
  padding: "32px 36px",
  backgroundColor: "#f2f3f7",
  selectors: {
    [`.${themeClassDark} &`]: { backgroundColor: vars.color.bg },
  },
  "@media": {
    "screen and (max-width: 767px)": {
      padding: "68px 16px 24px",
    },
  },
});
