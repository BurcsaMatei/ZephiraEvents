// styles/admin/search.css.ts
// Styling pentru AdminSearch — componentă de căutare în sidebar admin.

import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css";

export const searchWrap = style({
  padding: "8px 10px 10px",
  borderBottom: `1px solid ${vars.color.border}`,  // era rgba(255,255,255,0.07)
});

export const inputWrap = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const input = style({
  width: "100%",
  padding: "7px 28px 7px 10px",
  backgroundColor: vars.color.surface,   // era rgba(255,255,255,0.07)
  border: `1px solid ${vars.color.border}`,  // era rgba(255,255,255,0.12)
  borderRadius: "7px",
  color: vars.color.text,                // era rgba(255,255,255,0.85)
  fontSize: "13px",
  lineHeight: "1.4",
  outline: "none",
  transition: `border-color ${vars.motion.normal}, background-color ${vars.motion.normal}`,
  selectors: {
    "&::placeholder": {
      color: vars.color.muted,           // era rgba(255,255,255,0.3)
    },
    "&:focus": {
      borderColor: vars.color.primary,   // era rgba(85,97,242,0.7)
      backgroundColor: vars.color.surfaceHover,  // era rgba(255,255,255,0.09)
    },
    // ascunde iconița nativă de clear din Chrome/Safari
    "&::-webkit-search-cancel-button": {
      display: "none",
    },
  },
});

export const clearBtn = style({
  position: "absolute",
  right: "7px",
  background: "none",
  border: "none",
  color: vars.color.muted,              // era rgba(255,255,255,0.35)
  cursor: "pointer",
  fontSize: vars.typography.size.md,
  lineHeight: "1",
  padding: "0",
  display: "flex",
  alignItems: "center",
  transition: `color ${vars.motion.fast}`,
  selectors: {
    "&:hover": {
      color: vars.color.text,           // era rgba(255,255,255,0.75)
    },
  },
});

export const results = style({
  marginTop: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});

export const statusText = style({
  padding: "4px 4px",
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,             // era rgba(255,255,255,0.35)
  fontStyle: "italic",
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
});

export const sectionLabel = style({
  fontSize: "10px",
  fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: vars.color.muted,             // era rgba(255,255,255,0.28)
  padding: "6px 6px 3px",
});

export const resultItem = style({
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  padding: "6px 8px",
  borderRadius: vars.radius.xs,
  cursor: "pointer",
  transition: `background-color ${vars.motion.fast}`,
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.surfaceActive,  // era rgba(85,97,242,0.2)
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,   // era rgba(85,97,242,0.7)
      outlineOffset: "1px",
    },
  },
});

export const itemName = style({
  display: "block",
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.text,              // era rgba(255,255,255,0.85)
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const itemSub = style({
  display: "block",
  fontSize: "11.5px",
  color: vars.color.muted,             // era rgba(255,255,255,0.38)
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  marginTop: "1px",
});

export const divider = style({
  height: "1px",
  backgroundColor: vars.color.border,  // era rgba(255,255,255,0.06)
  margin: "4px 0",
});
