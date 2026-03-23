// styles/admin/sent.css.ts

import { style } from "@vanilla-extract/css";

export const pageTitle = style({
  margin: "0 0 24px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1a2e",
  letterSpacing: "-0.02em",
});

export const empty = style({
  color: "#888",
  fontSize: "15px",
  padding: "24px 0",
});

// ── List ─────────────────────────────────────────────────
export const list = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const item = style({
  display: "flex",
  alignItems: "stretch",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  border: "1.5px solid #e8e8f0",
  overflow: "hidden",
  transition: "border-color 0.15s, box-shadow 0.15s",
  selectors: {
    "&:hover": {
      borderColor: "#b0b4f0",
      boxShadow: "0 2px 10px rgba(85,97,242,0.08)",
    },
  },
});

export const itemBody = style({
  flex: 1,
  padding: "14px 16px",
  minWidth: 0,
});

// ── Item header row ───────────────────────────────────────
export const itemTop = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "4px",
  flexWrap: "wrap",
});

export const itemTo = style({
  fontWeight: 600,
  fontSize: "14px",
  color: "#1a1a2e",
  marginRight: "auto",
});

export const itemDate = style({
  fontSize: "12px",
  color: "#aaa",
  flexShrink: 0,
});

export const itemSubject = style({
  fontSize: "13px",
  color: "#555",
  marginBottom: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const itemPreview = style({
  fontSize: "12.5px",
  color: "#888",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// ── Badges ────────────────────────────────────────────────
const badgeBase = style({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  flexShrink: 0,
});

export const badgeNew = style([
  badgeBase,
  { backgroundColor: "#f0fdf4", color: "#16a34a" },
]);

export const badgeReply = style([
  badgeBase,
  { backgroundColor: "#e8f0fe", color: "#3b5bdb" },
]);

// ── Delete button ─────────────────────────────────────────
export const deleteBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 14px",
  backgroundColor: "transparent",
  border: "none",
  borderLeft: "1.5px solid #e8e8f0",
  color: "#ccc",
  cursor: "pointer",
  fontSize: "16px",
  flexShrink: 0,
  transition: "color 0.15s, background-color 0.15s",
  selectors: {
    "&:hover": {
      color: "#dc2626",
      backgroundColor: "#fff5f5",
    },
  },
});
