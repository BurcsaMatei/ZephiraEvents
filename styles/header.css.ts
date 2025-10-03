// styles/header.css.ts

// ==============================
// Imports
// ==============================
import { style } from "@vanilla-extract/css";

import { mq, vars } from "./theme.css";

// ==============================
// Tokens & utilities
// ==============================
// Constante (tranziții)
const transition =
  `transform ${vars.motion.normal} ${vars.motion.easing}, ` +
  `opacity ${vars.motion.normal} ${vars.motion.easing}`;

// Social icons base
const iconBase = {
  display: "inline-block",
  width: 22,
  height: 22,
  backgroundColor: "currentColor",
  WebkitMaskRepeat: "no-repeat" as const,
  maskRepeat: "no-repeat" as const,
  WebkitMaskPosition: "center" as const,
  maskPosition: "center" as const,
  WebkitMaskSize: "contain" as const,
  maskSize: "contain" as const,
};

// ==============================
// Classes
// ==============================

// Root
export const headerRoot = style({
  position: "sticky",
  top: 0,
  zIndex: vars.z.header,
  background: vars.color.bg,
  boxShadow: vars.shadow.md,
});

export const headerFixed = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  width: "100%",
  zIndex: vars.z.header,
});

// Wrapper bară (controlăm înălțimea aici)
export const headerWrap = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "var(--headerHeight, 64px)",
});

// ⚠️ IMPORTANT: stările se aplică pe .headerWrap (NU pe <header> root)
export const headerHidden = style({
  opacity: 0,
  transform: "translateY(-8px)",
  pointerEvents: "none",
  height: 0, // << colapsăm spațiul pentru ca Hero să pornească din top
  overflow: "hidden",
  transition,
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none", transform: "none" } },
});

export const headerVisible = style({
  opacity: 1,
  transform: "translateY(0)",
  pointerEvents: "auto",
  height: "var(--headerHeight, 64px)", // << revenim la înălțimea normală
  transition,
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none" } },
});

// Logo
export const headerLogoBox = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  color: "inherit",
  lineHeight: 0,
});

export const headerLogoImg = style({
  display: "block",
  height: "auto",
  width: "auto",
  maxWidth: "none",
  objectFit: "contain",
  maxHeight: "min(28px, calc(var(--headerHeight, 64px) - 16px))",
  "@media": {
    [mq.md]: { maxHeight: "min(28px, calc(var(--headerHeight, 64px) - 16px))" },
    [mq.lg]: { maxHeight: "min(32px, calc(var(--headerHeight, 64px) - 16px))" },
  },
});

// Dreapta
export const rightRow = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

export const themeSwitchWrap = style({
  display: "flex",
  alignItems: "center",
});

// Social icons
export const iconFacebook = style({
  ...iconBase,
  WebkitMaskImage: "url('/icons/facebook.svg')",
  maskImage: "url('/icons/facebook.svg')",
});
export const iconInstagram = style({
  ...iconBase,
  WebkitMaskImage: "url('/icons/instagram.svg')",
  maskImage: "url('/icons/instagram.svg')",
});
export const iconTiktok = style({
  ...iconBase,
  WebkitMaskImage: "url('/icons/tiktok.svg')",
  maskImage: "url('/icons/tiktok.svg')",
});

// Nav desktop
export const navDesktop = style({
  display: "none",
  justifySelf: "end",
  "@media": { [mq.lg]: { display: "flex", gap: vars.space.lg } },
});

export const navLink = style({
  textDecoration: "none",
  color: vars.color.text,
  fontWeight: 600,
  lineHeight: 1,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.md,
  ":focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  selectors: {
    "&:hover": { background: vars.color.surfaceHover },
    '&[data-active="true"]': { background: vars.color.surfaceActive, color: vars.color.link },
  },
});

// Burger
export const mobileBtn = style({
  justifySelf: "end",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  ":focus-visible": {
    outline: `2px solid ${vars.color.focus}`,
    outlineOffset: 2,
    borderRadius: vars.radius.md,
  },
  "@media": { [mq.lg]: { display: "none" } },
});

export const burgerBox = style({
  position: "relative",
  width: 22,
  height: 14,
  display: "inline-block",
});

export const burgerLine = style({
  position: "absolute",
  left: 0,
  right: 0,
  height: 2,
  background: vars.color.text,
  borderRadius: 2,
  willChange: "transform, opacity",
  transition: "transform 180ms ease, opacity 180ms ease", // fallback CSS când FM nu e încă încărcat
});
export const burgerTop = style({ top: 0 });
export const burgerMid = style({ top: 6 });
export const burgerBot = style({ bottom: 0 });

// Overlay (full)
export const overlay = style({
  position: "fixed",
  inset: 0,
  background: vars.color.overlay,
  opacity: 0,
  pointerEvents: "none",
  transition,
  zIndex: vars.z.header, // peste conținutul paginii
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none" } },
});
export const overlayOpen = style({ opacity: 1, pointerEvents: "auto" });

// Panel – 75% pe mobil; revine la min(82vw, 420px) pe ecrane mari
export const panel = style({
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  width: "75vw", // cerință: ~75% din ecran pe mobil
  background: vars.color.bg,
  transform: "translateX(100%)",
  transition,
  boxShadow: vars.shadow.lg,
  padding: vars.space.md,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
  borderTopLeftRadius: vars.radius.xl,
  borderBottomLeftRadius: vars.radius.xl,
  zIndex: vars.z.header, // peste conținutul paginii
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
    [mq.lg]: { width: "min(82vw, 420px)" },
  },
});
export const panelOpen = style({ transform: "translateX(0)" });

// Close
export const closeBtn = style({
  position: "absolute",
  top: 10,
  left: 10,
  width: 40,
  height: 40,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  ":focus-visible": {
    outline: `2px solid ${vars.color.focus}`,
    outlineOffset: 2,
    borderRadius: vars.radius.md,
  },
});
export const closeIcon = style({
  position: "relative",
  width: 22,
  height: 22,
  display: "inline-block",
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: "50%",
      height: 2,
      background: vars.color.text,
      transform: "translateY(-50%) rotate(45deg)",
      borderRadius: 2,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: "50%",
      height: 2,
      background: vars.color.text,
      transform: "translateY(-50%) rotate(-45deg)",
      borderRadius: 2,
    },
  },
});

// Nav în panoul mobil
export const panelNav = style({
  display: "grid",
  gap: vars.space.xs,
  marginTop: "56px",
});

export const panelLink = style({
  textDecoration: "none",
  color: vars.color.text,
  fontWeight: 700,
  padding: vars.space.md,
  borderRadius: vars.radius.lg,
  ":focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: 2 },
  selectors: {
    "&:hover": { background: vars.color.surfaceHover },
    '&[data-active="true"]': { background: vars.color.surfaceActive, color: vars.color.link },
  },
});

// Telefon + Social
export const panelPhoneRow = style({
  marginTop: "auto",
  display: "flex",
  justifyContent: "center",
  paddingBottom: vars.space.sm,
});
export const panelPhoneLink = style({
  textDecoration: "none",
  color: vars.color.text,
  fontWeight: 800,
  fontSize: "1.05rem",
  letterSpacing: "0.2px",
  ":hover": { color: vars.color.link },
  ":focus-visible": {
    outline: `2px solid ${vars.color.focus}`,
    outlineOffset: 2,
    borderRadius: 8,
  },
});

export const panelSocialRow = style({
  marginTop: 0,
  display: "flex",
  justifyContent: "center",
  gap: 16,
  paddingTop: vars.space.md,
  borderTop: `1px solid ${vars.color.border}`,
});

export const socialLink = style({
  color: vars.color.text,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  ":hover": { color: vars.color.link },
  ":focus-visible": {
    outline: `2px solid ${vars.color.focus}`,
    outlineOffset: 2,
    borderRadius: 8,
  },
});
