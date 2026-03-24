// styles/admin/sent.css.ts

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

export const pageTitle = style({
  margin: "0 0 24px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});

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

export const item = style({
  display: "flex",
  alignItems: "stretch",
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.md,
  border: `1.5px solid ${vars.color.border}`,
  overflow: "hidden",
  transition: `border-color ${vars.motion.normal}, box-shadow ${vars.motion.normal}`,
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

// Link variant — pentru itemBody clickabil (same layout, dar <a>)
export const itemBodyLink = style({
  display: "block",
  flex: 1,
  padding: "14px 16px",
  minWidth: 0,
  textDecoration: "none",
  color: "inherit",
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
  fontWeight: vars.typography.weight.semibold,
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  marginRight: "auto",
});

export const itemDate = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  flexShrink: 0,
});

export const itemSubject = style({
  fontSize: "13px",
  color: vars.color.muted,
  marginBottom: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const itemPreview = style({
  fontSize: "12.5px",
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

export const badgeNew = style([
  badgeBase,
  { backgroundColor: "#f0fdf4", color: "#16a34a" },
]);

export const badgeReply = style([
  badgeBase,
  { backgroundColor: "#e8f0fe", color: "#3b5bdb" },
]);

// ── Detail page ───────────────────────────────────────────
export const backLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  color: vars.color.primary,
  textDecoration: "none",
  marginBottom: "20px",
  fontWeight: vars.typography.weight.medium,
  selectors: {
    "&:hover": { textDecoration: "underline" },
  },
});

export const detailHeader = style({
  marginBottom: "24px",
});

export const detailTitle = style({
  margin: "0 0 8px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});

export const detailBadges = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
});

export const detailDate = style({
  fontSize: "12px",
  color: vars.color.muted,
});

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: "20px",
  marginBottom: "16px",
});

export const detailGrid = style({
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: "10px 16px",
  alignItems: "start",
});

export const detailLabel = style({
  fontSize: vars.typography.size.xs,
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  paddingTop: "2px",
});

export const detailValue = style({
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  wordBreak: "break-word",
});

export const sectionTitle = style({
  margin: "0 0 12px",
  fontSize: vars.typography.size.sm,
  fontWeight: vars.typography.weight.bold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
});

export const messageBody = style({
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
});

export const parentRef = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  color: vars.color.primary,
  textDecoration: "none",
  selectors: {
    "&:hover": { textDecoration: "underline" },
  },
});

// ── Delete button ─────────────────────────────────────────
export const deleteBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 14px",
  backgroundColor: "transparent",
  border: "none",
  borderLeft: `1.5px solid ${vars.color.border}`,
  color: vars.color.muted,
  cursor: "pointer",
  fontSize: "16px",
  flexShrink: 0,
  transition: `color ${vars.motion.normal}, background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      color: "#dc2626",
      backgroundColor: "#fff5f5",
    },
  },
});
