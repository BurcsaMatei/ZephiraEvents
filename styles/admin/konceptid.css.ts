// styles/admin/konceptid.css.ts

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

export const pageTitle = style({
  margin: "0 0 24px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});

export const section = style({
  marginBottom: "32px",
});

export const sectionTitle = style({
  fontSize: "13px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "16px",
});

export const contractCard = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: "24px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  "@media": {
    "(max-width: 540px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const contractField = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

export const contractLabel = style({
  fontSize: vars.typography.size.xs,
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

export const contractValue = style({
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
  fontWeight: vars.typography.weight.semibold,
});

export const statusBadge = style({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const statusActive = style({
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
});

export const statusCancelled = style({
  backgroundColor: "#fff0f0",
  color: vars.color.danger,
});

export const billingCard = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: "20px",
  marginBottom: "32px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

export const billingDays = style({
  fontSize: "36px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.primary,
  lineHeight: "1",
});

export const billingLabel = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
});

export const invoiceList = style({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

export const invoiceRow = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: "12px 16px",
  display: "grid",
  gridTemplateColumns: "1fr auto auto auto",
  alignItems: "center",
  gap: "16px",
  "@media": {
    "(max-width: 540px)": {
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    },
  },
});

export const invoiceDate = style({
  fontSize: vars.typography.size.sm,
  color: vars.color.text,
});

export const invoiceAmount = style({
  fontSize: vars.typography.size.sm,
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.text,
});

export const invoiceStatus = style([statusBadge]);

export const invoicePaid = style({
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
});

export const invoiceUnpaid = style({
  backgroundColor: "#fffbeb",
  color: "#d97706",
});

export const downloadLink = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.primary,
  textDecoration: "none",
  selectors: {
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

export const emptyState = style({
  color: vars.color.muted,
  fontSize: vars.typography.size.sm,
  padding: "32px 0",
});
