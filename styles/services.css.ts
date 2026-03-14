// styles/services.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Classes
// ==============================

// Page
export const pageWrap = style({
  backgroundColor: vars.color.bg,
  color: vars.color.text,
});

/** DEPRECATED pentru secțiuni: padding global mutat pe .section > .container */
export const sectionPad = style({});

// Section header (hero)
export const heroHeader = style({
  textAlign: "center",
  marginBottom: "clamp(24px, 4vw, 48px)",
});

export const eyebrow = style({
  display: "inline-block",
  fontSize: "clamp(12px, 1.2vw, 14px)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: vars.color.muted,
});

export const heroTitle = style({
  marginTop: "8px",
  fontWeight: 700,
  fontSize: "clamp(28px, 3.6vw, 44px)",
  lineHeight: 1.1,
});

export const h2 = style({
  fontWeight: 700,
  fontSize: "clamp(22px, 2.8vw, 32px)",
  lineHeight: 1.15,
  marginBottom: "8px",
});

export const heroSubtitle = style({
  marginTop: "10px",
  fontSize: "clamp(14px, 1.6vw, 18px)",
  color: vars.color.muted,
});

// Grid (12 desktop / 6 mobile)
export const grid = style({
  // ↓ sub-fold hydration: evită cost de layout/paint până intră în viewport
  contentVisibility: "auto",
  containIntrinsicSize: "auto 580px",

  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  gap: vars.space.lg,
  listStyle: "none",
  paddingInlineStart: 0,
  margin: 0,
  "@media": { [mq.lg]: { gridTemplateColumns: "repeat(12, minmax(0, 1fr))" } },
});

// Card — large
export const card = style({
  gridColumn: "span 6",
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.sm,
  padding: vars.space.lg,
  transition: `transform ${vars.motion.normal} ${vars.motion.easing}, box-shadow ${vars.motion.normal} ${vars.motion.easing}, border-color ${vars.motion.normal} ${vars.motion.easing}`,
  listStyle: "none",
  selectors: {
    "&::marker": { content: '""' },
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: vars.shadow.md,
      borderColor: vars.color.primary,
    },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  },
  "@media": { [mq.lg]: { gridColumn: "span 3" } },
});

export const cardIconPlaceholder = style({
  width: 48,
  height: 48,
  marginBottom: vars.space.md,
  borderRadius: 12,
  background: "linear-gradient(145deg, rgba(0,0,0,0.04), rgba(0,0,0,0.06))",
});

export const cardIconWrap = style({
  width: 48,
  height: 48,
  marginBottom: vars.space.md,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const cardTitle = style({
  fontWeight: 700,
  fontSize: "clamp(18px, 2.2vw, 22px)",
  lineHeight: 1.2,
  marginBottom: "6px",
});

export const cardDesc = style({
  color: vars.color.muted,
  fontSize: "clamp(14px, 1.6vw, 16px)",
  lineHeight: 1.5,
  marginBottom: vars.space.md,
});

export const cardLink = style({
  display: "inline-block",
  fontWeight: 600,
  fontSize: 14,
  color: vars.color.link,
  textDecoration: "none",
  borderBottom: "1px solid transparent",
  transition: `border-color ${vars.motion.normal} ${vars.motion.easing}`,
  selectors: {
    "&:hover": { borderBottomColor: vars.color.link },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  },
});

// Preview (homepage)
export const previewHeader = style({
  textAlign: "center",
  marginBottom: "clamp(18px, 3vw, 36px)",
});

export const previewSubtitle = style({
  color: vars.color.muted,
  fontSize: "clamp(14px, 1.6vw, 16px)",
});

// ==============================
// Card — small (clickable)
// Ordinea contează: cardIconWrapSmall trebuie definit înainte de cardSmall
// pentru a putea fi referit în globalStyle de la finalul fișierului.
// ==============================

export const cardIconWrapSmall = style({
  width: 32,
  height: 32,
  marginBottom: vars.space.sm,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const cardTitleSmall = style({
  fontWeight: 700,
  fontSize: "clamp(16px, 2vw, 18px)",
  marginBottom: 6,
});

export const cardDescSmall = style({
  color: vars.color.muted,
  fontSize: "clamp(13px, 1.4vw, 15px)",
});

// Icon tint (for <AnimatedIcon />)
export const cardIconTint = style({
  color: vars.color.text,
  transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
});

export const cardSmall = style({
  gridColumn: "span 6",
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.sm,
  cursor: "pointer",
  transition:
    "transform 0.25s cubic-bezier(.2,0,.2,1), box-shadow 0.25s cubic-bezier(.2,0,.2,1), border-color 0.25s cubic-bezier(.2,0,.2,1), background 0.25s cubic-bezier(.2,0,.2,1)",
  listStyle: "none",
  selectors: {
    "&::marker": { content: '""' },
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: vars.shadow.md,
      borderColor: vars.color.primary,
      background: "rgba(85, 97, 242, 0.08)",
    },
    "&:focus-within": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 2,
      borderColor: vars.color.primary,
      background: "rgba(85, 97, 242, 0.08)",
    },
  },
  "@media": { [mq.lg]: { gridColumn: "span 3" } },
});

// Link wrapper — acoperă tot card-ul
export const cardSmallLink = style({
  display: "block",
  padding: vars.space.md,
  textDecoration: "none",
  color: "inherit",
  selectors: {
    "&:focus-visible": { outline: "none" },
  },
});

/** Centrare + spațiere CTA (fără inline styles) */
export const ctaCenter = style({
  marginTop: vars.space.xl,
  textAlign: "center",
});

// ==============================
// Hover propagation: card hover → icon animation
// ==============================
globalStyle(`${cardSmall}:hover ${cardIconWrapSmall} > *`, {
  transform: "rotate(3deg) translateY(-2px)",
});
