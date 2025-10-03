// components/cookies/CookieBanner.tsx
"use client";

// ==============================
// Imports
// ==============================
import Link from "next/link";
import { type CSSProperties, useId } from "react";
import { createPortal } from "react-dom";

import { withBase } from "../../lib/config";
import {
  actions,
  banner,
  btn,
  btnGhost,
  btnPrimary,
  linkClass,
  srOnly,
  text,
} from "../../styles/cookieBanner.css";
import { useCookieConsent } from "./CookieProvider";

// ==============================
// Constante
// ==============================
// Overlay fix — iese din flow (rezolvă CLS)
const fixedOverlayStyle: CSSProperties = {
  position: "fixed",
  left: "max(12px, env(safe-area-inset-left))",
  right: "max(12px, env(safe-area-inset-right))",
  bottom: "max(12px, env(safe-area-inset-bottom))",
  zIndex: 1000,
  maxWidth: 680,
  margin: "0 auto",
  pointerEvents: "auto",
  transform: "translateY(0)",
  willChange: "transform",
};

// ==============================
// Component
// ==============================
export default function CookieBanner() {
  const { bannerVisible, acceptAll, rejectAll, openSettings } = useCookieConsent();

  // IDs înainte de early return
  const titleId = useId();
  const descId = useId();

  if (!bannerVisible) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={banner}
      style={fixedOverlayStyle}
    >
      <h2 id={titleId} className={srOnly}>
        Consimțământ cookie
      </h2>

      <p id={descId} className={text}>
        Folosim cookie-uri pentru funcționare și analiză. Vezi{" "}
        <Link href={withBase("/cookie-policy")} className={linkClass}>
          politica cookie
        </Link>
        .
      </p>

      <div className={actions}>
        <button type="button" onClick={rejectAll} className={`${btn} ${btnGhost}`}>
          Refuză tot
        </button>
        <button type="button" onClick={acceptAll} className={`${btn} ${btnPrimary}`}>
          Acceptă tot
        </button>
        <button type="button" onClick={openSettings} className={`${btn} ${btnGhost}`}>
          Setări
        </button>
      </div>
    </div>,
    document.body,
  );
}
