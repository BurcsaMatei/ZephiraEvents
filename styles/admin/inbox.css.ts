// styles/admin/inbox.css.ts

import { style } from "@vanilla-extract/css";

import { themeClassDark, vars } from "../theme.css";

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
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
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
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: vars.radius.sm,
  fontSize: "13px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  transition: `background-color ${vars.motion.normal}, opacity ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: vars.color.primaryHover },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const syncBtnLoading = style({
  opacity: 0.75,
});

export const syncStatus = style({
  fontSize: "12.5px",
  color: "#16a34a",
  fontWeight: vars.typography.weight.medium,
});

export const syncStatusError = style({
  fontSize: "12.5px",
  color: "#dc2626",
  fontWeight: vars.typography.weight.medium,
});

// ── Empty state ───────────────────────────────────────────
export const empty = style({
  color: vars.color.muted,
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
  position: "relative",
  display: "flex",
  alignItems: "stretch",
  borderRadius: vars.radius.md,
  overflow: "hidden",
  border: `1.5px solid ${vars.color.border}`,
  transition: `border-color ${vars.motion.normal}, box-shadow ${vars.motion.normal}`,
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
  padding: "14px 90px 14px 16px",
  backgroundColor: vars.color.surface,
  textDecoration: "none",
  color: "inherit",
});

export const itemUnread = style({
  borderLeft: `3px solid ${vars.color.primary}`,
  backgroundColor: "#fafafe",
  selectors: {
    [`.${themeClassDark} &`]: { backgroundColor: vars.color.surfaceActive },
  },
});

export const deleteBtn = style({
  position: "absolute",
  top: 14,
  right: 16,
  padding: "4px 10px",
  backgroundColor: vars.color.danger,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: vars.radius.sm,
  fontSize: "12px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  transition: `opacity ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { opacity: 0.88 },
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
  fontWeight: vars.typography.weight.semibold,
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  marginRight: "auto",
});

export const itemNameUnread = style({
  fontWeight: vars.typography.weight.bold,
});

export const itemDate = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  flexShrink: 0,
});

export const itemEmail = style({
  fontSize: "12.5px",
  color: vars.color.muted,
  marginBottom: "6px",
});

export const itemPreview = style({
  fontSize: "13px",
  color: vars.color.muted,
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
  fontWeight: vars.typography.weight.semibold,
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
  color: vars.color.text,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  fontSize: "13px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  transition: `background-color ${vars.motion.normal}, border-color ${vars.motion.normal}`,
  selectors: {
    "&:hover": { backgroundColor: "#e8e8f0", borderColor: "#b0b4f0" },
  },
});

export const paginationInfo = style({
  fontSize: "13px",
  color: vars.color.muted,
});
