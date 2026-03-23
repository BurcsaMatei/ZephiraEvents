// components/admin/AdminInstallButton.tsx
// Buton „Instalează aplicația" pentru PWA admin.
// - Android/Chrome: ascultă beforeinstallprompt, afișează buton nativ
// - iOS/Safari: beforeinstallprompt nu există — afișează instrucțiuni Share → Add to Home Screen
// - Se ascunde dacă e deja rulat în standalone (deja instalat)

import { useEffect, useState } from "react";

import * as s from "../../styles/admin/layout.css";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    // Dacă rulează deja în standalone, nu afișa nimic
    if (isInStandalone()) {
      setInstalled(true);
      return;
    }

    setIos(isIos());

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detectează instalarea
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setPrompt(null);
    }
  }

  // Deja instalat sau niciunul dintre cazuri nu se aplică
  if (installed) return null;

  // Android / Chrome — buton nativ
  if (prompt) {
    return (
      <button type="button" onClick={() => void handleInstall()} className={s.installBtn}>
        ↓ Instalează aplicația
      </button>
    );
  }

  // iOS — instrucțiuni manuale
  if (ios) {
    return (
      <div className={s.installIosHint}>
        Instalează: apasă{" "}
        <span aria-label="Share">⎙</span> → <strong>Adaugă pe ecranul principal</strong>
      </div>
    );
  }

  return null;
}
