// components/InstallAppButton.inner.tsx

"use client";

// ==============================
// Imports
// ==============================
import { type CSSProperties, useEffect, useState } from "react";

// ==============================
// Types
// ==============================
/** Tip pentru evenimentul Chrome/Edge „beforeinstallprompt” */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type InstallAppButtonInnerProps = {
  label?: string;
  className?: string;
  "aria-label"?: string;
};

// ==============================
// Constante
// ==============================
/**
 * Activăm butonul doar când:
 *  - build de producție și
 *  - NEXT_PUBLIC_ENABLE_PWA === "1"
 */
const PWA_ENABLED =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_PWA === "1";

// overlay fix la colțul din dreapta-jos (nu afectează layout-ul)
const fixedBtnStyle: CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 16,
  zIndex: 50,
};

// ==============================
// Component
// ==============================
export default function InstallAppButtonInner({
  label = "Instalează aplicația",
  className,
  "aria-label": ariaLabel,
}: InstallAppButtonInnerProps) {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!PWA_ENABLED) return;
    if (typeof window === "undefined") return;

    const onBip = (e: Event) => {
      const bip = e as BeforeInstallPromptEvent;
      bip.preventDefault(); // reținem evenimentul pentru gestul utilizatorului
      setEvt(bip);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    try {
      await evt.userChoice; // "accepted" | "dismissed"
    } finally {
      setEvt(null); // nu e reutilizabil
    }
  };

  // OFF local sau dacă nu e eligibil → nu afișăm
  if (!PWA_ENABLED || !evt) return null;

  return (
    <button
      type="button"
      onClick={install}
      className={className}
      style={fixedBtnStyle}
      aria-label={ariaLabel ?? label}
    >
      {label}
    </button>
  );
}
