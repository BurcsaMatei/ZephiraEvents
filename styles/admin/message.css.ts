// styles/admin/message.css.ts

import { style } from "@vanilla-extract/css";

export const backLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  color: "#5561F2",
  textDecoration: "none",
  marginBottom: "20px",
  fontWeight: 500,
  selectors: {
    "&:hover": { textDecoration: "underline" },
  },
});

// ── Header ────────────────────────────────────────────────
export const header = style({
  marginBottom: "24px",
});

export const senderName = style({
  margin: "0 0 8px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1a2e",
  letterSpacing: "-0.02em",
});

export const headerBadges = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
});

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

// ── Details grid ─────────────────────────────────────────
export const card = style({
  backgroundColor: "#ffffff",
  border: "1.5px solid #e8e8f0",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "16px",
});

export const detailGrid = style({
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: "10px 16px",
  alignItems: "start",
});

export const detailLabel = style({
  fontSize: "12px",
  fontWeight: 600,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  paddingTop: "2px",
});

export const detailValue = style({
  fontSize: "14px",
  color: "#1a1a2e",
  wordBreak: "break-word",
});

export const messageBody = style({
  fontSize: "14px",
  color: "#334155",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});

// ── Replies ───────────────────────────────────────────────
export const sectionTitle = style({
  margin: "0 0 12px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
});

export const replyCard = style({
  backgroundColor: "#f0f3ff",
  border: "1.5px solid #d4d9f7",
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "10px",
});

export const replyMeta = style({
  fontSize: "11.5px",
  color: "#94a3b8",
  marginBottom: "8px",
});

export const replyText = style({
  fontSize: "14px",
  color: "#334155",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
});

// ── Reply form ────────────────────────────────────────────
export const formField = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "14px",
});

export const formLabel = style({
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

export const formInput = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: "14px",
  color: "#1a1a2e",
  outline: "none",
  transition: "border-color 0.15s",
  selectors: {
    "&:focus": { borderColor: "#5561F2" },
  },
});

export const formTextarea = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: "14px",
  color: "#1a1a2e",
  outline: "none",
  resize: "vertical",
  minHeight: "120px",
  lineHeight: 1.55,
  fontFamily: "inherit",
  transition: "border-color 0.15s",
  selectors: {
    "&:focus": { borderColor: "#5561F2" },
  },
});

export const submitBtn = style({
  padding: "10px 20px",
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
  marginBottom: "12px",
});

export const errorMsg = style({
  padding: "10px 14px",
  backgroundColor: "#fff0f0",
  border: "1px solid #fecaca",
  borderRadius: "7px",
  fontSize: "13.5px",
  color: "#b91c1c",
  marginBottom: "12px",
});
