// styles/admin/analytics.css.ts

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

// ── Page header ───────────────────────────────────────────
export const pageHeader = style({
  display: "flex",
  alignItems: "baseline",
  gap: "12px",
  marginBottom: "24px",
});

export const pageTitle = style({
  margin: 0,
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  letterSpacing: "-0.02em",
});

export const pageSub = style({
  fontSize: "13px",
  color: vars.color.muted,
  fontWeight: 400,
});

// ── Cards ─────────────────────────────────────────────────
export const card = style({
  backgroundColor: vars.color.surface,
  border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: "20px 22px",
});

export const cardTitle = style({
  margin: "0 0 16px",
  fontSize: "13px",
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

// ── Realtime section ──────────────────────────────────────
export const realtimeGrid = style({
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: "16px",
  marginBottom: "16px",
  "@media": {
    "(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const liveCountCard = style([]);

export const liveCountWrap = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "4px",
});

export const liveCount = style({
  fontSize: "52px",
  fontWeight: 800,
  lineHeight: 1,
  color: vars.color.text,
  letterSpacing: "-0.04em",
});

export const liveDot = style({
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#22c55e",
  marginRight: "6px",
  boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
});

export const liveLabel = style({
  display: "flex",
  alignItems: "center",
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  fontWeight: vars.typography.weight.medium,
  marginTop: "4px",
});

export const refreshRow = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "auto",
  paddingTop: "12px",
});

export const refreshBtn = style({
  padding: "5px 12px",
  backgroundColor: "#f2f3f7",
  border: "none",
  borderRadius: vars.radius.xs,
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  cursor: "pointer",
  fontWeight: vars.typography.weight.medium,
  transition: "background-color 0.12s",
  selectors: {
    "&:hover": { backgroundColor: "#e8e8f0" },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

export const refreshTs = style({
  fontSize: "11px",
  color: vars.color.muted,
});

// ── Live pages table ───────────────────────────────────────
export const liveTable = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  maxHeight: "160px",
  overflowY: "auto",
});

export const liveRow = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "7px 10px",
  backgroundColor: "#f8f9ff",
  borderRadius: "7px",
  fontSize: "12.5px",
});

export const liveRowPage = style({
  flex: 1,
  color: vars.color.muted,
  fontFamily: "'SFMono-Regular', 'Consolas', monospace",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const liveRowUsers = style({
  fontWeight: vars.typography.weight.bold,
  color: vars.color.primary,
  flexShrink: 0,
  fontSize: "13px",
});

export const liveRowCountries = style({
  color: vars.color.muted,
  flexShrink: 0,
  fontSize: "11.5px",
});

export const liveEmpty = style({
  color: vars.color.muted,
  fontSize: "13px",
  padding: "16px 0",
  textAlign: "center",
});

// ── Chart section ─────────────────────────────────────────
export const chartCard = style([
  {
    marginBottom: "16px",
  },
]);

export const emptyChart = style({
  height: "200px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.muted,
  fontSize: vars.typography.size.sm,
});

// ── Stats grid ────────────────────────────────────────────
export const statsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  "@media": {
    "(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const statList = style({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

export const statRow = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

export const statRowTop = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "8px",
});

export const statLabel = style({
  fontSize: "12.5px",
  color: vars.color.muted,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const statValue = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  flexShrink: 0,
  fontVariantNumeric: "tabular-nums",
});

export const statBarBg = style({
  height: "4px",
  backgroundColor: "#f0f0f8",
  borderRadius: "2px",
  overflow: "hidden",
});

export const statBarFill = style({
  height: "100%",
  backgroundColor: vars.color.primary,
  borderRadius: "2px",
  transition: "width 0.4s ease",
});

// ── Error / loading states ────────────────────────────────
export const errorBox = style({
  padding: "16px",
  backgroundColor: "#fff5f5",
  border: "1px solid #fca5a5",
  borderRadius: vars.radius.sm,
  fontSize: "13px",
  color: "#dc2626",
  marginBottom: "16px",
});

export const loadingText = style({
  color: vars.color.muted,
  fontSize: "13px",
  padding: "12px 0",
});
