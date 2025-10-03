// styles/outro.css.ts

// ==============================
// Imports
// ==============================
import { globalStyle, style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Classes
// ==============================
export const section = style({
  // Sub-fold: ușurăm hidratarea fără efect vizual
  contentVisibility: "auto",
  containIntrinsicSize: "auto 640px",
});

/* Panel — gradient-border + bară SUS 1px (jos eliminată) + glow static accentuat */
export const panel = style({
  position: "relative",
  borderRadius: vars.radius.xl,
  padding: `${vars.space.xl} 0`,
  border: "1px solid transparent",
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
    [mq.lg]: { padding: `${vars.space.xxl} 0` },
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
      selectors: { "&:hover": { transform: "none" }, "&::after": { transition: "none" } },
    },
  },
  selectors: {
    /* Glow static (ambiental) – ușor accentuat */
    "&::after": {
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
    "&:hover::after": { opacity: 0.38 }, // ↑ de la ~0.33
    "&:focus-within::after": { opacity: 0.42 }, // ↑ de la ~0.36
  },
});

/* Inner — măsură de citire locală (NU container global) */
export const inner = style({
  maxWidth: 880,
  margin: "0 auto",
  textAlign: "center",
  paddingInline: vars.space.md,
  "@media": { [mq.lg]: { paddingInline: vars.space.lg } },
});

/* Eyebrow / Title / Lead */
export const eyebrow = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
  padding: `2px ${vars.space.sm}`,
  borderRadius: "9999px",
  fontWeight: 750,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: vars.color.text,
  background: `linear-gradient(90deg,
    color-mix(in srgb, ${vars.color.primary} 15%, transparent) 0%,
    color-mix(in srgb, ${vars.color.primary} 6%, transparent) 100%
  )`,
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${vars.color.border} 78%, transparent)`,
});

export const title = style({
  margin: 0,
  fontWeight: 850,
  fontSize: "clamp(26px, 3.2vw, 42px)",
  lineHeight: 1.12,
  letterSpacing: "0.008em",
  color: vars.color.text, // fallback
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
});

export const lead = style({
  color: vars.color.muted,
  marginTop: vars.space.md,
  marginBottom: vars.space.md,
  fontWeight: 560,
  maxWidth: "70ch",
  marginInline: "auto",
});

/* Listă + bullets accent */
export const list = style({
  listStyle: "none",
  paddingInlineStart: 0,
  margin: `${vars.space.lg} auto 0`,
  display: "grid",
  gap: vars.space.sm,
  maxWidth: 720,
});

export const listItem = style({
  position: "relative",
  paddingLeft: 24,
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "0.62em",
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: `radial-gradient(circle at 30% 30%,
        ${vars.color.primary} 0%,
        color-mix(in srgb, ${vars.color.primary} 65%, transparent) 70%,
        transparent 100%)`,
      boxShadow: `0 0 0 1px color-mix(in srgb, ${vars.color.primary} 40%, transparent)`,
    },
  },
});

/* CTA + links/focus AA */
export const cta = style({ marginTop: vars.space.lg });

// ==============================
// Global styles
// ==============================
globalStyle(`${panel} a, ${panel} button`, {
  textDecorationThickness: "from-font",
  textUnderlineOffset: "0.18em",
  transition: "color 160ms ease, text-underline-offset 160ms ease, transform 140ms ease",
});
globalStyle(`${panel} a:hover`, {
  textUnderlineOffset: "0.26em",
  transform: "translateY(-1px)",
});
globalStyle(`${panel} a:active`, { transform: "translateY(0)" });
globalStyle(`${panel} a:focus-visible, ${panel} button:focus-visible`, {
  outline: `2px solid ${vars.color.focus}`,
  outlineOffset: "3px",
  borderRadius: `calc(${vars.radius.xs} + 2px)`,
});
