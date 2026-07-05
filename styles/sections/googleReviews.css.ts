// styles/sections/googleReviews.css.ts
// ==============================
// Styles: GoogleReviews (Home = marquee; /reviews = grid static)
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { mq, vars } from "../theme.css";

// ==============================
// Keyframes marquee
// ==============================
const leftMarquee = keyframes({
  "0%": { transform: "translateX(0)" },
  "100%": { transform: "translateX(-50%)" },
});
const rightMarquee = keyframes({
  "0%": { transform: "translateX(-50%)" },
  "100%": { transform: "translateX(0)" },
});

// ==============================
// Secțiune + full-bleed
// ==============================
export const sectionClass = style({
  paddingBlock: vars.space.xl,
});

export const fullBleedClass = style({
  width: "100vw",
  maxWidth: "none",
  position: "relative",
  left: "50%",
  right: "50%",
  marginLeft: "-50vw",
  marginRight: "-50vw",
  isolation: "isolate",
});

// ==============================
// Header (badge Google + rating agregat)
// ==============================
export const headerClass = style({
  marginBottom: vars.space.lg,
  textAlign: "center",
});

export const titleClass = style({
  fontSize: vars.typography.size["2xl"],
  lineHeight: Number(vars.typography.leading.tight),
  fontWeight: Number(vars.typography.weight.bold),
});

export const summaryRowClass = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.sm,
  marginTop: vars.space.sm,
  fontSize: vars.typography.size.md,
  color: vars.color.muted,
});

export const summaryValueClass = style({
  fontSize: vars.typography.size.lg,
  fontWeight: Number(vars.typography.weight.bold),
  color: vars.color.text,
});

export const badgeClass = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: "999px",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  fontSize: vars.typography.size.sm,
  fontWeight: Number(vars.typography.weight.semibold),
  color: vars.color.text,
});

// ==============================
// HOME: benzi marquee
// ==============================
export const bandsWrapClass = style({
  display: "grid",
  gap: vars.space.md,
});

export const bandClass = style({
  overflow: "hidden",
  position: "relative",
});

const trackClass = style({
  display: "flex",
  gap: vars.space.md,
  alignItems: "stretch",
  animationDuration: "12.5s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  willChange: "transform",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});
export const trackLeftClass = style([trackClass, { animationName: leftMarquee }]);
export const trackRightClass = style([trackClass, { animationName: rightMarquee }]);

globalStyle(`${bandClass}:hover ${trackClass}, ${bandClass}:focus-within ${trackClass}`, {
  animationPlayState: "paused",
});

// ==============================
// Card
// ==============================
const cardBase = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
  padding: vars.space.lg,
  borderRadius: vars.radius.lg,
  background: vars.color.cardBg,
  color: vars.color.cardText,
  boxShadow: vars.shadow.sm,
  border: `1px solid ${vars.color.border}`,
  minWidth: 320,
  position: "relative",
});

export const cardFixedClass = style([cardBase, { width: 420, height: 220 }]); // Home (marquee)
export const cardAutoClass = style([cardBase, { width: "100%", maxWidth: 420 }]); // /reviews (grid)

export const cardHeaderClass = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
});

export const avatarClass = style({
  width: 48,
  height: 48,
  flexShrink: 0,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: vars.color.primary,
  color: vars.color.primaryContrast,
  fontSize: vars.typography.size.lg,
  fontWeight: Number(vars.typography.weight.bold),
});

export const metaClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  fontSize: vars.typography.size.sm,
  color: vars.color.muted,
  marginRight: "auto",
});
globalStyle(`${metaClass} > strong`, {
  color: vars.color.text,
  fontSize: vars.typography.size.md,
  fontWeight: Number(vars.typography.weight.semibold),
});

export const starsClass = style({
  fontSize: vars.typography.size.md,
  letterSpacing: "1px",
  color: vars.color.secondary,
});

export const textClampClass = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  lineHeight: Number(vars.typography.leading.normal),
  margin: 0,
});

export const textAutoClass = style({
  lineHeight: Number(vars.typography.leading.normal),
  margin: 0,
});

export const cardLinkClass = style({
  marginTop: "auto",
  alignSelf: "flex-start",
  color: vars.color.link,
  textDecoration: "none",
  fontSize: vars.typography.size.sm,
  fontWeight: Number(vars.typography.weight.semibold),
  selectors: {
    "&:hover": {
      color: vars.color.linkHover,
      textDecoration: "underline",
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 2,
    },
  },
});

// ==============================
// CTA (Home)
// ==============================
export const ctaRowClass = style({
  marginTop: vars.space.xl,
  textAlign: "center",
});
globalStyle(`${ctaRowClass} a`, {
  color: vars.color.link,
  textDecoration: "none",
  fontWeight: Number(vars.typography.weight.semibold),
});
globalStyle(`${ctaRowClass} a:hover`, {
  color: vars.color.linkHover,
  textDecoration: "underline",
  transition: `color ${vars.motion.normal} ${vars.motion.easing.standard}`,
});

// ==============================
// Page H1 (/reviews)
// ==============================
export const pageH1Class = style({
  textAlign: "center",
  maxWidth: 760,
  marginInline: "auto",
});

// ==============================
// GRID (/reviews) — 1/2/4 centrat
// ==============================
export const listWrapClass = style({
  display: "grid",
  gap: vars.space.md,
  gridTemplateColumns: "repeat(1, minmax(320px, max-content))",
  justifyContent: "center",
  justifyItems: "stretch",
  "@media": {
    [mq.md]: { gridTemplateColumns: "repeat(2, minmax(320px, max-content))" },
    [mq.xl]: { gridTemplateColumns: "repeat(4, minmax(320px, max-content))" },
  },
});

globalStyle(`${listWrapClass} ${cardAutoClass}:hover`, {
  borderColor: vars.color.primary,
});
