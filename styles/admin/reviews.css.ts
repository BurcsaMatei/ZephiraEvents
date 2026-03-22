// styles/admin/reviews.css.ts

import { style } from "@vanilla-extract/css";

export const pageTitle = style({
  margin: "0 0 20px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1a2e",
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
  fontWeight: 500,
  textDecoration: "none",
  color: "#64748b",
  backgroundColor: "#ffffff",
  border: "1.5px solid #e2e8f0",
  transition: "border-color 0.12s, color 0.12s",
  selectors: {
    "&:hover": { borderColor: "#b0b4f0", color: "#5561F2" },
  },
});

export const tabActive = style({
  backgroundColor: "#5561F2",
  borderColor: "#5561F2",
  color: "#ffffff",
  selectors: {
    "&:hover": { color: "#ffffff", borderColor: "#4450d0" },
  },
});

// ── List ─────────────────────────────────────────────────
export const empty = style({
  color: "#888",
  fontSize: "15px",
  padding: "24px 0",
});

export const list = style({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

export const card = style({
  backgroundColor: "#ffffff",
  border: "1.5px solid #e8e8f0",
  borderRadius: "10px",
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
  fontWeight: 600,
  fontSize: "15px",
  color: "#1a1a2e",
  marginRight: "auto",
});

export const rating = style({
  fontSize: "16px",
  color: "#f59e0b",
  letterSpacing: "1px",
  flexShrink: 0,
});

export const reviewDate = style({
  fontSize: "12px",
  color: "#aaa",
});

export const reviewText = style({
  fontSize: "14px",
  color: "#334155",
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
  fontWeight: 600,
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
  fontWeight: 600,
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
