// styles/introSection.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import {
  center as baseCenter,
  content as baseContent,
  eyebrow as baseEyebrow,
  heading as baseHeading,
  lede as baseLede,
} from "./sectionBase.css";
import { mq, vars } from "./theme.css";

// ==============================
// Classes
// ==============================

/* Alignments (fără containere noi) */
export const center = style([baseCenter, { textAlign: "center" }]);
export const start = style({ textAlign: "left" });

/* Eyebrow capsule (badge) */
export const eyebrow = style([
  baseEyebrow,
  {
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space.xs,
    padding: `2px ${vars.space.sm}`,
    borderRadius: "9999px",
    fontWeight: 750,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: `linear-gradient(90deg,
      color-mix(in srgb, ${vars.color.primary} 15%, transparent) 0%,
      color-mix(in srgb, ${vars.color.primary} 6%, transparent) 100%
    )`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${vars.color.border} 78%, transparent)`,
  },
]);

/* Heading — gradient text (clipped) + fallback */
export const heading = style([
  baseHeading,
  {
    fontWeight: 850,
    letterSpacing: "0.006em",
    lineHeight: 1.1,
    color: vars.color.text, // fallback
    "@media": { [mq.lg]: { letterSpacing: "0.01em" } },
    "@supports": {
      "(background-clip: text)": {
        backgroundImage: `linear-gradient(90deg,
          color-mix(in srgb, ${vars.color.text} 96%, ${vars.color.primary} 4%) 0%,
          color-mix(in srgb, ${vars.color.primary} 70%, ${vars.color.text} 30%) 50%,
          color-mix(in srgb, ${vars.color.primary} 85%, ${vars.color.text} 15%) 100%
        )`,
        backgroundClip: "text",
        color: "transparent",
      },
      "(-webkit-background-clip: text)": {
        backgroundImage: `linear-gradient(90deg,
          color-mix(in srgb, ${vars.color.text} 96%, ${vars.color.primary} 4%) 0%,
          color-mix(in srgb, ${vars.color.primary} 70%, ${vars.color.text} 30%) 50%,
          color-mix(in srgb, ${vars.color.primary} 85%, ${vars.color.text} 15%) 100%
        )`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
    },
  },
]);

export const lede = style([
  baseLede,
  {
    fontWeight: 550,
    maxWidth: "70ch",
    marginInline: "auto",
    color: vars.color.muted,
  },
]);

export const content = baseContent;

/* Panel — gradient-border + glow static accentuat + bară SUS 1px (jos eliminată) */
export const panel = style({
  position: "relative",
  margin: "0 auto",
  maxWidth: 860,
  padding: `${vars.space.xl} ${vars.space.lg}`,
  borderRadius: vars.radius.xl,
  border: "1px solid transparent",
  // Doar bara de SUS (1px) + strat de suprafață + gradient pentru border
  background: `
    /* top bar 1px */
    linear-gradient(90deg,
      color-mix(in srgb, ${vars.color.primary} 0%, transparent) 0%,
      color-mix(in srgb, ${vars.color.primary} 70%, transparent) 50%,
      color-mix(in srgb, ${vars.color.primary} 0%, transparent) 100%
    ) top / 100% 1px no-repeat padding-box,

    /* surface layer */
    linear-gradient(180deg,
      color-mix(in srgb, ${vars.color.surface} 96%, transparent) 0%,
      color-mix(in srgb, ${vars.color.surface} 92%, transparent) 100%
    ) padding-box,

    /* gradient border */
    linear-gradient(120deg,
      color-mix(in srgb, ${vars.color.primary} 18%, transparent) 0%,
      transparent 36%,
      color-mix(in srgb, ${vars.color.primary} 12%, transparent) 72%,
      transparent 100%
    ) border-box
  `,
  boxShadow: `0 10px 22px color-mix(in srgb, ${vars.color.shadow} 16%, transparent)`,
  transition: "box-shadow 220ms cubic-bezier(.2,0,.2,1), transform 220ms cubic-bezier(.2,0,.2,1)",
  "@media": {
    [mq.lg]: { padding: `${vars.space.xxl} ${vars.space.xl}` },
    "(hover: hover)": {
      selectors: {
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: `0 14px 30px color-mix(in srgb, ${vars.color.shadow} 20%, transparent)`,
        },
      },
    },
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
      selectors: { "&:hover": { transform: "none" }, "&::before": { transition: "none" } },
    },
  },
  selectors: {
    /* Glow static (ambiental) – ușor accentuat */
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 1,
      borderRadius: `calc(${vars.radius.xl} - 1px)`,
      background: `radial-gradient(1200px 320px at 50% -10%,
        color-mix(in srgb, ${vars.color.primary} 12%, transparent),
        transparent 70%)`,
      opacity: 0.3, // ↑ de la ~0.25
      pointerEvents: "none",
      transition: "opacity 220ms cubic-bezier(.2,0,.2,1)",
    },
    "&:hover::before": { opacity: 0.38 }, // ↑ de la ~0.33
    "&:focus-within::before": { opacity: 0.42 }, // ↑ de la ~0.36
  },
});

// ==============================
// Global styles
// ==============================

/* Links & a11y */
globalStyle(`${panel} a`, {
  textDecorationThickness: "from-font",
  textUnderlineOffset: "0.18em",
  transition: "color 160ms ease, text-underline-offset 160ms ease, transform 140ms ease",
});
globalStyle(`${panel} a:hover`, {
  textUnderlineOffset: "0.26em",
  transform: "translateY(-1px)",
});
globalStyle(`${panel} a:active`, { transform: "translateY(0)" });
globalStyle(`${panel} a:focus-visible`, {
  outline: `2px solid ${vars.color.focus}`,
  outlineOffset: "3px",
  borderRadius: `calc(${vars.radius.xs} + 2px)`,
});

/* Align helpers */
globalStyle(`${center} ${heading}, ${center} ${lede}, ${center} ${content}`, {
  textAlign: "center",
});
globalStyle(`${start} ${heading}, ${start} ${lede}, ${start} ${content}`, {
  textAlign: "left",
});

/* Dark-compat (API parity) */
export const onDark = style({});
globalStyle(`${onDark} ${lede}`, { opacity: 0.92 });
