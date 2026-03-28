// styles/sections/reviews.css.ts
// ==============================
// Styles: Reviews (Home = 2 benzi orizontale; /reviews = listă statică)
// ==============================
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { mq, vars } from "../../theme.css";

// ==============================
// Keyframes pentru benzi
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
  // Full-bleed identic cu Hero
  width: "100vw",
  maxWidth: "none",
  position: "relative",
  left: "50%",
  right: "50%",
  marginLeft: "-50vw",
  marginRight: "-50vw",
  isolation: "isolate",
});

// Header
export const headerClass = style({
  marginBottom: vars.space.lg,
  textAlign: "center",
});
export const titleClass = style({
  fontSize: vars.typography.size["2xl"],
  lineHeight: Number(vars.typography.leading.tight),
  fontWeight: Number(vars.typography.weight.bold),
});

// ==============================
// HOME: benzi orizontale (2 rânduri stivuite)
// ==============================
export const bandsWrapClass = style({
  display: "grid",
  gap: vars.space.md,
});

export const bandClass = style({
  overflow: "hidden",
  position: "relative",
});

// Pistă (= conținut repetat x2 pentru loop)
export const trackClass = style({
  display: "flex",
  gap: vars.space.md,
  alignItems: "stretch",
  animationDuration: "45s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  willChange: "transform",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});
// direcții
export const trackLeftClass = style([trackClass, { animationName: leftMarquee }]);
export const trackRightClass = style([trackClass, { animationName: rightMarquee }]);

// Pausă la hover/focus (globalStyle)
globalStyle(`${bandClass}:hover ${trackClass}, ${bandClass}:focus-within ${trackClass}`, {
  animationPlayState: "paused",
});

// ==============================
// Card — variante: fix (Home) / auto (reviews page + egalizat)
// ==============================
const cardBase = style({
  display: "grid",
  gridTemplateColumns: "48px 1fr",
  gridTemplateAreas: `"avatar meta" ". stars" ". text" ". photos"`,
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

// Full-card overlay (păstrează comportamentul de toggle pe tot cardul în /reviews)
export const cardInteractiveBtn = style({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  selectors: {
    "&:focus-visible": {
      outlineColor: vars.color.focus,
      outlineOffset: 4,
    },
  },
});

// ⭐ nou: buton săgeată stânga-jos (affordance)
export const cardAffordanceBtn = style({
  position: "absolute",
  left: vars.space.md,
  bottom: vars.space.md,
  zIndex: 2, // peste overlay-ul full-card
  width: 28,
  height: 28,
  borderRadius: "999px",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  transition: `background ${vars.motion.normal} ${vars.motion.easing.standard}, border-color ${vars.motion.normal} ${vars.motion.easing.standard}`,
  selectors: {
    "&::after": {
      content: "",
      display: "block",
      width: 10,
      height: 10,
      borderLeft: `2px solid ${vars.color.text}`,
      borderBottom: `2px solid ${vars.color.text}`,
      transform: "rotate(-45deg)", // chevron jos-stânga (indicativ expand)
      transition: `transform ${vars.motion.normal} ${vars.motion.easing.standard}`,
    },
    // rotire când cardul este expandat
    '[data-expanded="true"] &::after': {
      transform: "rotate(135deg)", // chevron sus-stânga (indicativ collapse)
    },
    "&:hover": {
      background: vars.color.cardBg,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 2,
    },
  },
});

// ⭐ nou: overlay link pentru Home (click-through → /reviews)
export const cardOverlayLink = style({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  textDecoration: "none",
  // focus vizibil pentru accesibilitate
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 4,
    },
  },
});

export const cardFixedClass = style([cardBase, { width: 420, height: 200 }]); // Home
export const cardAutoClass = style([
  cardBase,
  {
    width: "100%",
    maxWidth: 420, // /reviews: limităm lățimea pentru centrare corectă
  },
]);
export const cardPageCollapsedClass = style({
  height: 220, // egalizare vizuală
  cursor: "pointer",
});
export const cardPageExpandedClass = style({
  height: "auto",
});

// Avatar
globalStyle(`${cardBase} > img`, {
  gridArea: "avatar",
  width: 48,
  height: 48,
  borderRadius: "50%",
  objectFit: "cover",
});

export const metaClass = style({
  gridArea: "meta",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  fontSize: vars.typography.size.sm,
  color: vars.color.muted,
});
globalStyle(`${metaClass} > strong`, {
  color: vars.color.text,
  fontSize: vars.typography.size.md,
  fontWeight: Number(vars.typography.weight.semibold),
});

export const starsClass = style({
  gridArea: "stars",
  fontSize: vars.typography.size.md,
  letterSpacing: "1px",
  color: vars.color.secondary,
});

// Text
export const textClampClass = style({
  gridArea: "text",
  overflow: "hidden",
});
globalStyle(`${textClampClass}`, {
  textOverflow: "ellipsis",
  display: "-webkit-box",
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — webkit props
  WebkitLineClamp: 4,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — webkit props
  WebkitBoxOrient: "vertical",
  lineHeight: Number(vars.typography.leading.normal) as unknown as string,
});
export const textAutoClass = style({
  gridArea: "text",
});

// Photos
globalStyle(`${cardBase} .photos`, { gridArea: "photos" });
globalStyle(`${cardBase} .photos img`, {
  width: 72,
  height: 72,
  objectFit: "cover",
  borderRadius: vars.radius.md,
  marginRight: vars.space.sm,
  border: `1px solid ${vars.color.border}`,
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
// LISTĂ STATICĂ (/reviews) — 1/2/4 centrat
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

// Hover border primar doar în pagina /reviews
globalStyle(`${listWrapClass} ${cardAutoClass}:hover`, {
  borderColor: vars.color.primary,
});
