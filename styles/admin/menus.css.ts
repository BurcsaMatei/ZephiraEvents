// styles/admin/menus.css.ts

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

// ── Page header ───────────────────────────────────────────
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
  flex: 1,
});

export const newBtn = style({
  padding: "8px 18px",
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: vars.radius.sm,
  fontSize: "13px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover": { backgroundColor: vars.color.primaryHover },
  },
});

// ── Empty state ───────────────────────────────────────────
export const empty = style({
  color: vars.color.muted,
  fontSize: "15px",
  padding: "24px 0",
});

// ── Grid ─────────────────────────────────────────────────
export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "16px",
});

// ── Card ─────────────────────────────────────────────────
export const card = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  transition: `border-color ${vars.motion.normal}, box-shadow ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      borderColor: "#b0b4f0",
      boxShadow: "0 2px 10px rgba(85,97,242,0.08)",
    },
  },
});

export const cardDeleted = style({
  opacity: 0.45,
});

export const cardImg = style({
  width: "100%",
  height: "140px",
  objectFit: "cover",
  display: "block",
  backgroundColor: vars.color.border,
});

export const cardImgPlaceholder = style({
  width: "100%",
  height: "140px",
  backgroundColor: vars.color.border,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.muted,
  fontSize: "28px",
});

export const cardBody = style({
  padding: "14px 16px",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const cardTitle = style({
  fontWeight: vars.typography.weight.semibold,
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  margin: 0,
  lineHeight: 1.3,
});

export const cardMeta = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
});

export const cardActions = style({
  display: "flex",
  gap: "8px",
  padding: "10px 16px",
  borderTop: `1px solid ${vars.color.border}`,
});

export const editBtn = style({
  flex: 1,
  padding: "6px 12px",
  backgroundColor: vars.color.surface,
  color: vars.color.primary,
  border: `1.5px solid ${vars.color.primary}`,
  borderRadius: vars.radius.sm,
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  textDecoration: "none",
  textAlign: "center",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover": { backgroundColor: "#f0f0ff" },
  },
});

export const deleteBtn = style({
  padding: "6px 12px",
  backgroundColor: "transparent",
  color: "#dc2626",
  border: `1.5px solid #fecaca`,
  borderRadius: vars.radius.sm,
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: "#fff5f5" },
    "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
  },
});

export const restoreBtn = style({
  padding: "6px 12px",
  backgroundColor: "transparent",
  color: "#16a34a",
  border: `1.5px solid #bbf7d0`,
  borderRadius: vars.radius.sm,
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: "#f0fdf4" },
    "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
  },
});

// ── Form card ─────────────────────────────────────────────
export const formCard = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: "28px",
  maxWidth: "800px",
});

export const formSection = style({
  marginBottom: "28px",
  paddingBottom: "24px",
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    "&:last-child": { borderBottom: "none", marginBottom: 0 },
  },
});

export const formSectionTitle = style({
  fontSize: "13px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "16px",
});

export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "14px",
});

export const fieldRow = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
  marginBottom: "14px",
});

export const label = style({
  fontSize: vars.typography.size.xs,
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

export const input = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: "none",
  transition: `border-color ${vars.motion.normal}`,
  fontFamily: "inherit",
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: {
    "&:focus": { borderColor: vars.color.primary },
  },
});

export const select = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: "none",
  fontFamily: "inherit",
  cursor: "pointer",
  selectors: {
    "&:focus": { borderColor: vars.color.primary },
  },
});

export const textarea = style({
  padding: "9px 12px",
  border: "1.5px solid #d8d8e8",
  borderRadius: "7px",
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: "none",
  resize: "vertical",
  minHeight: "90px",
  lineHeight: 1.55,
  fontFamily: "inherit",
  transition: `border-color ${vars.motion.normal}`,
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: {
    "&:focus": { borderColor: vars.color.primary },
  },
});

export const hint = style({
  fontSize: "11.5px",
  color: vars.color.muted,
  marginTop: "2px",
});

// ── Image upload ──────────────────────────────────────────
export const imgPreviewWrap = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "12px",
});

export const imgPreview = style({
  width: "120px",
  height: "80px",
  objectFit: "cover",
  borderRadius: vars.radius.sm,
  border: `1.5px solid ${vars.color.border}`,
  display: "block",
});

export const imgPlaceholder = style({
  width: "120px",
  height: "80px",
  borderRadius: vars.radius.sm,
  border: `1.5px solid ${vars.color.border}`,
  backgroundColor: vars.color.border,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.muted,
  fontSize: "22px",
});

export const uploadBtn = style({
  padding: "7px 14px",
  backgroundColor: "#f1f3f5",
  color: vars.color.text,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  fontSize: "13px",
  cursor: "pointer",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover": { backgroundColor: "#e8e8f0" },
  },
});

export const uploadStatus = style({
  fontSize: "12.5px",
  color: "#16a34a",
  marginTop: "4px",
});

export const uploadStatusError = style({
  fontSize: "12.5px",
  color: "#dc2626",
  marginTop: "4px",
});

// ── Submit area ───────────────────────────────────────────
export const actions = style({
  display: "flex",
  gap: "12px",
  alignItems: "center",
  marginTop: "8px",
  flexWrap: "wrap",
});

export const submitBtn = style({
  padding: "10px 24px",
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: "7px",
  fontSize: vars.typography.size.sm,
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: vars.color.primaryHover },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const cancelLink = style({
  fontSize: vars.typography.size.sm,
  color: vars.color.muted,
  textDecoration: "none",
  selectors: {
    "&:hover": { color: vars.color.text },
  },
});

export const successMsg = style({
  padding: "10px 14px",
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "7px",
  fontSize: "13.5px",
  color: "#15803d",
  marginBottom: "16px",
});

export const errorMsg = style({
  padding: "10px 14px",
  backgroundColor: "#fff0f0",
  border: "1px solid #fecaca",
  borderRadius: "7px",
  fontSize: "13.5px",
  color: "#b91c1c",
  marginBottom: "16px",
});

// ── Status badge ──────────────────────────────────────────
export const deletedBadge = style({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  backgroundColor: "#fff0f0",
  color: "#dc2626",
});
