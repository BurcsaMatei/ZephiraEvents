// styles/sections/googleReviews.css.ts
// ==============================
// Styles: GoogleReviews (Home = bandă marquee; /reviews = grid static)
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

// ==============================
// Secțiune + full-bleed
// ==============================
export const section = style({
  paddingBlock: vars.space.xl,
});

export const fullBleed = style({
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
// Header (badge Google + titlu + stats)
// ==============================
export const header = style({
  marginBottom: vars.space.lg,
  textAlign: "center",
});

export const badgeRow = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.sm,
  justifyContent: "center",
});

export const title = style({
  fontSize: vars.typography.size["2xl"],
  lineHeight: vars.typography.leading.tight,
  fontWeight: vars.typography.weight.bold,
});

export const statsRow = style({
  marginTop: vars.space.sm,
  fontSize: vars.typography.size.md,
  color: vars.color.muted,
});

export const statsStars = style({
  color: vars.color.secondary,
  letterSpacing: "1px",
  marginRight: vars.space.xs,
});

// ==============================
// HOME: bandă marquee
// ==============================
export const band = style({
  overflow: "hidden",
  position: "relative",
});

export const track = style({
  display: "flex",
  gap: vars.space.md,
  alignItems: "stretch",
  animationName: leftMarquee,
  animationDuration: "45s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  willChange: "transform",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

// Pauză la hover/focus
globalStyle(`${band}:hover ${track}, ${band}:focus-within ${track}`, {
  animationPlayState: "paused",
});

// ==============================
// Card
// ==============================
const cardBase = style({
  display: "grid",
  gridTemplateColumns: "48px 1fr",
  gridTemplateAreas: `"avatar meta" ". stars" ". text" ". link"`,
  columnGap: vars.space.md,
  rowGap: vars.space.sm,
  padding: vars.space.lg,
  borderRadius: vars.radius.lg,
  background: vars.color.cardBg,
  color: vars.color.cardText,
  boxShadow: vars.shadow.sm,
  border: `1px solid ${vars.color.border}`,
  minWidth: 320,
  position: "relative",
});

export const cardHome = style([cardBase, { width: 420, height: 200 }]);

export const cardPage = style([
  cardBase,
  {
    width: "100%",
    maxWidth: 420,
  },
]);

export const avatar = style({
  gridArea: "avatar",
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: vars.color.primary,
  color: vars.color.primaryContrast,
  fontSize: vars.typography.size.xl,
  fontWeight: vars.typography.weight.semibold,
});

export const meta = style({
  gridArea: "meta",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  fontSize: vars.typography.size.sm,
  color: vars.color.muted,
});

globalStyle(`${meta} > strong`, {
  color: vars.color.text,
  fontSize: vars.typography.size.md,
  fontWeight: vars.typography.weight.semibold,
});

export const stars = style({
  gridArea: "stars",
  fontSize: vars.typography.size.md,
  letterSpacing: "1px",
  color: vars.color.secondary,
});

export const textClamp = style({
  gridArea: "text",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 4,
  WebkitBoxOrient: "vertical",
  lineHeight: vars.typography.leading.normal,
});

export const textAuto = style({
  gridArea: "text",
  lineHeight: vars.typography.leading.normal,
});

export const cardLink = style({
  gridArea: "link",
  fontSize: vars.typography.size.sm,
  color: vars.color.link,
  textDecoration: "none",
  fontWeight: vars.typography.weight.semibold,
  selectors: {
    "&:hover": {
      color: vars.color.linkHover,
      textDecoration: "underline",
    },
  },
});

// ==============================
// PAGE: grid static 1/2/4 centrat
// ==============================
export const grid = style({
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

globalStyle(`${grid} ${cardPage}:hover`, {
  borderColor: vars.color.primary,
});

// ==============================
// CTA + empty state
// ==============================
export const ctaRow = style({
  marginTop: vars.space.xl,
  textAlign: "center",
});

export const ctaLink = style({
  color: vars.color.link,
  textDecoration: "none",
  fontWeight: vars.typography.weight.semibold,
  selectors: {
    "&:hover": {
      color: vars.color.linkHover,
      textDecoration: "underline",
      transition: `color ${vars.motion.normal} ${vars.motion.easing.standard}`,
    },
  },
});

export const emptyNote = style({
  textAlign: "center",
  color: vars.color.muted,
  paddingBlock: vars.space.xl,
});

// ==============================
// Page H1 (/reviews)
// ==============================
export const pageH1 = style({
  textAlign: "center",
  maxWidth: 760,
  marginInline: "auto",
});
