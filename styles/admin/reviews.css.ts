// styles/admin/reviews.css.ts

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

export const pageTitle = style({
  margin: "0 0 20px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});

// ── Filter tabs ───────────────────────────────────────────
export const tabs = style({
  display: "flex",
  gap: "6px",
  marginBottom: "20px",
  flexWrap: "wrap",
});

export const tab = style({
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: vars.typography.weight.medium,
  textDecoration: "none",
  color: vars.color.muted,
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  transition: "border-color 0.12s, color 0.12s",
  selectors: {
    "&:hover": { borderColor: "#b0b4f0", color: vars.color.primary },
  },
});

export const tabActive = style({
  backgroundColor: vars.color.primary,
  borderColor: vars.color.primary,
  color: vars.color.primaryContrast,
  selectors: {
    "&:hover": { color: vars.color.primaryContrast, borderColor: vars.color.primaryHover },
  },
});

// ── List ─────────────────────────────────────────────────
export const empty = style({
  color: vars.color.muted,
  fontSize: "15px",
  padding: "24px 0",
});

export const list = style({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: "18px 20px",
});

export const cardHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px",
  flexWrap: "wrap",
});

export const reviewerName = style({
  fontWeight: vars.typography.weight.semibold,
  fontSize: "15px",
  color: vars.color.text,
  marginRight: "auto",
});

export const rating = style({
  fontSize: "16px",
  color: "#f59e0b",
  letterSpacing: "1px",
  flexShrink: 0,
});

export const reviewDate = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
});

export const reviewText = style({
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  lineHeight: 1.6,
  marginBottom: "14px",
  whiteSpace: "pre-wrap",
});

// ── Status badges (for already-moderated) ────────────────
const badgeBase = style({
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const statusApproved = style([
  badgeBase,
  { backgroundColor: "#f0fdf4", color: "#16a34a" },
]);

export const statusRejected = style([
  badgeBase,
  { backgroundColor: "#fff0f0", color: "#dc2626" },
]);

export const statusPending = style([
  badgeBase,
  { backgroundColor: "#fff8ed", color: "#d97706" },
]);

// ── Action buttons ────────────────────────────────────────
export const actions = style({
  display: "flex",
  gap: "8px",
  alignItems: "center",
});

const btnBase = style({
  padding: "7px 16px",
  borderRadius: "7px",
  fontSize: "13px",
  fontWeight: vars.typography.weight.semibold,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.12s",
  selectors: {
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

export const approveBtn = style([
  btnBase,
  {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    selectors: {
      "&:hover:not(:disabled)": { backgroundColor: "#bbf7d0" },
    },
  },
]);

export const rejectBtn = style([
  btnBase,
  {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    selectors: {
      "&:hover:not(:disabled)": { backgroundColor: "#fecaca" },
    },
  },
]);
