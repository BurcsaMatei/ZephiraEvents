// styles/admin/dashboard.css.ts

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

export const pageTitle = style({
  margin: "0 0 24px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  "@media": {
    "(min-width: 640px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
    },
  },
});

export const cardLink = style({
  textDecoration: "none",
  color: "inherit",
  display: "block",
  height: "100%",
});

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  height: "100%",
  cursor: "pointer",
  transition: `border-color ${vars.motion.normal}, box-shadow ${vars.motion.normal}`,
  selectors: {
    [`${cardLink}:hover &`]: {
      borderColor: vars.color.primary,
      boxShadow: "0 2px 10px rgba(85,97,242,0.10)",
    },
  },
});

export const cardTitle = style({
  fontSize: "11px",
  fontWeight: "800",
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
});

export const cardTitleRow = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "4px",
});

export const cardIcon = style({
  color: vars.color.primary,
  display: "flex",
  flexShrink: 0,
});

export const statNumber = style({
  fontSize: "36px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  lineHeight: 1,
});

export const statLabel = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
});

export const statSecondary = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  marginTop: "auto",
});

export const welcome = style({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "32px",
});

export const welcomeLogo = style({
  width: "52px",
  height: "auto",
  flexShrink: 0,
});

export const welcomeGreeting = style({
  margin: 0,
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: vars.typography.weight.semibold,
});

export const welcomeName = style({
  margin: 0,
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});
