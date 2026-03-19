// styles/sections/reviewsForm.css.ts
import { globalStyle, style } from "@vanilla-extract/css";

import { mq, vars } from "../../theme.css";

export const formClass = style({
  display: "grid",
  gap: vars.space.lg,
  marginBottom: vars.space.xl,
  padding: vars.space.lg,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.sm,
  width: "100%",
  maxWidth: "100%",
});

export const rowClass = style({
  display: "grid",
  gap: vars.space.sm,
  "@media": { [mq.md]: { gridTemplateColumns: "1fr" } },
});

export const labelClass = style({
  fontWeight: Number(vars.typography.weight.semibold),
  fontSize: vars.typography.size.sm,
  color: vars.color.muted,
});

export const inputClass = style({
  appearance: "none",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space.sm} ${vars.space.md}`,
  background: vars.color.surface,
  color: vars.color.text,
  fontSize: vars.typography.size.md,
  width: "100%",
  transition: `border-color ${vars.motion.fast} ${vars.motion.easing.standard}, box-shadow ${vars.motion.fast} ${vars.motion.easing.standard}`,
  selectors: {
    "&::placeholder": { color: vars.color.muted },
    "&:focus": {
      outline: "none",
      borderColor: vars.color.primary,
      boxShadow: `0 0 0 1px ${vars.color.primary}`,
    },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const textareaClass = style([
  inputClass,
  { minHeight: 120, resize: "vertical", lineHeight: Number(vars.typography.leading.normal) },
]);

export const actionsClass = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
});

globalStyle(`${actionsClass} > button`, {
  padding: `${vars.space.sm} ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  border: "none",
  background: vars.color.primary,
  color: vars.color.primaryContrast,
  fontWeight: Number(vars.typography.weight.semibold),
  cursor: "pointer",
  transition: `background ${vars.motion.fast} ${vars.motion.easing.standard}, transform ${vars.motion.fast} ${vars.motion.easing.standard}`,
});
globalStyle(`${actionsClass} > button:hover`, { background: vars.color.primaryHover });
globalStyle(`${actionsClass} > button:active`, { transform: "translateY(1px)" });
globalStyle(`${actionsClass} > button:disabled`, { opacity: 0.6, cursor: "not-allowed" });

export const fileHintClass = style({
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
});

export const filesPreviewClass = style({
  display: "flex",
  gap: vars.space.sm,
  flexWrap: "wrap",
});

globalStyle(`${filesPreviewClass} img`, {
  maxWidth: 120,
  height: "auto",
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
});

export const avatarPreviewClass = style({
  display: "inline-block",
  width: 56,
  height: 56,
  borderRadius: "50%",
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
});

/* ====== Rating cu stele ====== */
export const ratingRowClass = style({
  display: "grid",
  gap: vars.space.sm,
});

export const starsGroupClass = style({
  display: "inline-flex",
  gap: vars.space.sm,
});

export const starBtnClass = style({
  appearance: "none",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.muted,
  width: 40,
  height: 40,
  lineHeight: "40px",
  textAlign: "center",
  borderRadius: vars.radius.md,
  fontSize: vars.typography.size.lg,
  cursor: "pointer",
  transition: `border-color ${vars.motion.fast} ${vars.motion.easing.standard}, color ${vars.motion.fast} ${vars.motion.easing.standard}, background ${vars.motion.fast} ${vars.motion.easing.standard}, transform ${vars.motion.fast} ${vars.motion.easing.standard}`,
});
export const starActiveClass = style({
  color: vars.color.primary,
  borderColor: vars.color.primary,
});
globalStyle(`${starBtnClass}:hover`, {
  transform: "translateY(-1px)",
  color: vars.color.primary,
  borderColor: vars.color.primary,
});

/* SR-only util */
export const srOnly = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});
