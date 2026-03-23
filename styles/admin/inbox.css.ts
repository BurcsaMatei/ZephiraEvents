// styles/admin/inbox.css.ts

import { style } from "@vanilla-extract/css";

// ── Header row (title + sync button) ─────────────────────
export const pageHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "24px",
  flexWrap: "wrap",
});

export const pageTitle = style({
  margin: 0,
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1a2e",
  letterSpacing: "-0.02em",
});

// ── Sync area ─────────────────────────────────────────────
export const syncArea = style({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
});

export const syncBtn = style({
  padding: "7px 16px",
  backgroundColor: "#5561F2",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s, opacity 0.15s",
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: "#4350e0" },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const syncBtnLoading = style({
  opacity: 0.75,
});

export const syncStatus = style({
  fontSize: "12.5px",
  color: "#16a34a",
  fontWeight: 500,
});

export const syncStatusError = style({
  fontSize: "12.5px",
  color: "#dc2626",
  fontWeight: 500,
});

// ── Empty state ───────────────────────────────────────────
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

export const itemWrap = style({
  display: "flex",
  alignItems: "stretch",
  borderRadius: "10px",
  overflow: "hidden",
  border: "1.5px solid #e8e8f0",
  transition: "border-color 0.15s, box-shadow 0.15s",
  selectors: {
    "&:hover": {
      borderColor: "#b0b4f0",
      boxShadow: "0 2px 10px rgba(85,97,242,0.08)",
    },
  },
});

export const item = style({
  display: "block",
  flex: 1,
  minWidth: 0,
  padding: "14px 16px",
  backgroundColor: "#ffffff",
  textDecoration: "none",
  color: "inherit",
});

export const itemUnread = style({
  borderLeft: "3px solid #5561F2",
  backgroundColor: "#fafafe",
});

export const deleteBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 14px",
  backgroundColor: "#ffffff",
  border: "none",
  borderLeft: "1.5px solid #e8e8f0",
  color: "#ccc",
  cursor: "pointer",
  fontSize: "15px",
  flexShrink: 0,
  transition: "color 0.15s, background-color 0.15s",
  selectors: {
    "&:hover:not(:disabled)": {
      color: "#dc2626",
      backgroundColor: "#fff5f5",
    },
    "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
  },
});

// ── Item header row ───────────────────────────────────────
export const itemTop = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "4px",
  flexWrap: "wrap",
});

export const itemName = style({
  fontWeight: 600,
  fontSize: "14px",
  color: "#1a1a2e",
  marginRight: "auto",
});

export const itemNameUnread = style({
  fontWeight: 700,
});

export const itemDate = style({
  fontSize: "12px",
  color: "#aaa",
  flexShrink: 0,
});

export const itemEmail = style({
  fontSize: "12.5px",
  color: "#888",
  marginBottom: "6px",
});

export const itemPreview = style({
  fontSize: "13px",
  color: "#666",
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

export const typeBadgeContact = style([
  badgeBase,
  { backgroundColor: "#e8f0fe", color: "#3b5bdb" },
]);

export const typeBadgeOffer = style([
  badgeBase,
  { backgroundColor: "#fff4e0", color: "#d97706" },
]);

export const typeBadgeEmail = style([
  badgeBase,
  { backgroundColor: "#f0f7ff", color: "#0369a1" },
]);

export const statusBadgeNew = style([
  badgeBase,
  { backgroundColor: "#fff0f0", color: "#dc2626" },
]);

export const statusBadgeRead = style([
  badgeBase,
  { backgroundColor: "#f1f3f5", color: "#64748b" },
]);

export const statusBadgeReplied = style([
  badgeBase,
  { backgroundColor: "#f0fdf4", color: "#16a34a" },
]);

export const statusBadgeArchived = style([
  badgeBase,
  { backgroundColor: "#f5f5f5", color: "#9ca3af" },
]);

// ── Pagination ────────────────────────────────────────────
export const pagination = style({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "24px",
  flexWrap: "wrap",
});

export const paginationBtn = style({
  padding: "7px 16px",
  backgroundColor: "#f1f3f5",
  color: "#1a1a2e",
  border: "1.5px solid #e8e8f0",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  transition: "background-color 0.15s, border-color 0.15s",
  selectors: {
    "&:hover": { backgroundColor: "#e8e8f0", borderColor: "#b0b4f0" },
  },
});

export const paginationInfo = style({
  fontSize: "13px",
  color: "#888",
});
