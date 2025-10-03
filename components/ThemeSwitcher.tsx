// components/ThemeSwitcher.tsx
"use client";

// ==============================
// Imports
// ==============================
import { type CSSProperties, useEffect, useState } from "react";

import { withBase } from "../lib/config";
import { themeClasses } from "../styles/theme.css";
import * as styles from "../styles/themeSwitcher.css";

// ==============================
// Types
// ==============================
type Theme = "light" | "dark";
/** Tip pentru stil ce acceptă variabila CSS --bulb-mask, fără any */
type BulbStyle = CSSProperties & { ["--bulb-mask"]?: string };

// ==============================
// Constante
// ==============================
const THEME_KEY = "theme";

// ==============================
// Utils
// ==============================
function applyTheme(theme: Theme) {
  const html = document.documentElement;
  const body = document.body;

  // curățăm vechile clase (semantic + VE) pe ambele noduri
  html.classList.remove("light", "dark", themeClasses.light, themeClasses.dark);
  body.classList.remove("light", "dark", themeClasses.light, themeClasses.dark);

  // adăugăm clasele curente pe ambele noduri
  const veClass = themeClasses[theme];
  html.classList.add(theme, veClass);
  body.classList.add(theme, veClass);

  // hint pentru UI native
  html.style.setProperty("color-scheme", theme);

  // eveniment opțional pentru sincronizări globale
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}

// ==============================
// Component
// ==============================
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    let initial: Theme = "light";
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") {
        initial = saved;
      } else {
        initial = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    } catch {
      initial = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const bulbToneClass = theme === "dark" ? styles.bulbDark : styles.bulbLight;
  const bulbStateClass = theme === "dark" ? styles.bulbOff : styles.bulbOn;

  /** Stil tipizat pentru variabila CSS personalizată, fără any */
  const bulbMaskStyle: BulbStyle = {
    ["--bulb-mask"]: `url(${withBase("/lightbulb-for-light-dark-theme.svg")})`,
  };

  return (
    <button
      type="button"
      className={styles.themeSwitcher}
      onClick={toggle}
      aria-label="Comută tema"
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? "Treci pe light" : "Treci pe dark"}
    >
      <span
        aria-hidden="true"
        className={`${styles.bulb} ${bulbToneClass} ${bulbStateClass}`}
        style={bulbMaskStyle}
      />
    </button>
  );
}
