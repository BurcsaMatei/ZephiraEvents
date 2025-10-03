// components/PwaInstallCta.inner.tsx

"use client";

// ==============================
// Imports
// ==============================
import { useCallback, useEffect, useId, useState } from "react";

import * as s from "../styles/pwaCta.css";
import Button from "./Button";
import Img from "./ui/Img";

// ==============================
// Types
// ==============================
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

// ==============================
// Constante
// ==============================
const DISMISS_KEY = "pwaCta:dismissed";
const FOOTER_ROOT_MARGIN = "0px 0px 240px 0px";

// ==============================
// Utils
// ==============================
const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  const navStandalone = Boolean(
    (window.navigator as unknown as { standalone?: boolean }).standalone,
  );
  return mq || navStandalone;
};

const isIOS = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  // iPadOS 13+ poate raporta "Macintosh"; fallback pe touch
  const iDevice =
    /iPhone|iPad|iPod/i.test(ua) || (/\bMacintosh\b/i.test(ua) && "ontouchend" in window);
  return iDevice;
};

// ==============================
// Component
// ==============================
export default function PwaInstallCta(): JSX.Element | null {
  const [promptEvt, setPromptEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [hideNearFooter, setHideNearFooter] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const headingId = useId();
  const descId = useId();

  // inițializează starea "dismissed" din localStorage
  useEffect(() => {
    try {
      const val = localStorage.getItem(DISMISS_KEY);
      setDismissed(val === "1");
    } catch {
      // ignore
    }
  }, []);

  // Ascunde CTA-ul când footerul intră în viewport (o singură instanță de IO)
  useEffect(() => {
    const footerEl = document.getElementById("site-footer") || document.querySelector("footer");
    if (!footerEl) return;

    const io = new IntersectionObserver(
      (entries) => setHideNearFooter(Boolean(entries[0]?.isIntersecting)),
      { root: null, threshold: 0, rootMargin: FOOTER_ROOT_MARGIN },
    );

    io.observe(footerEl);
    return () => io.disconnect();
  }, []);

  // Gestionare evenimente PWA: beforeinstallprompt / appinstalled
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault?.();
      if (dismissed || isStandalone()) return;
      setPromptEvt(e as BeforeInstallPromptEvent);
      setIosHint(false);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setVisible(false);
      setPromptEvt(null);
      setIosHint(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [dismissed]);

  // Detecție iOS (nu emite beforeinstallprompt) + instalare
  useEffect(() => {
    if (dismissed) return;
    if (isStandalone()) {
      setVisible(false);
      return;
    }
    if (isIOS()) {
      setIosHint(true);
      setVisible(true);
    }
  }, [dismissed]);

  // Închidere cu Esc când este vizibil
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setPromptEvt(null);
    setIosHint(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
      setDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  if (!visible || hideNearFooter || dismissed) return null;

  const onInstall = async () => {
    if (promptEvt) {
      await promptEvt.prompt();
      try {
        await promptEvt.userChoice;
      } finally {
        handleClose();
      }
    } else if (iosHint) {
      // Pe iOS nu deschidem nimic — mesajul explicativ rămâne ca hint.
    }
  };

  return (
    <div className={`${s.pwaRoot} ${visible ? s.pwaOpen : ""}`}>
      {/* backdrop pentru click-away */}
      <div className={s.backdrop} aria-hidden onClick={handleClose} />

      {/* ancoră colț dreapta-jos */}
      <div className={`${s.boxWrap} ${visible ? s.boxOpen : ""}`}>
        <div
          className={s.box}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          aria-describedby={descId}
        >
          <div className={s.content}>
            <div className={s.headerRow}>
              <span className={s.logoWrap} aria-hidden>
                <Img
                  className={s.logo}
                  src="/icons/android-chrome-192x192.png"
                  alt=""
                  width={24}
                  height={24}
                  variant="icon"
                />
              </span>
              <h3 id={headingId} className={s.title}>
                Instalează aplicația
              </h3>
            </div>

            <p id={descId} className={s.excerpt}>
              {iosHint
                ? "Pe iOS: apasă Share și alege «Adaugă pe ecranul principal»."
                : "Acces rapid din ecranul principal."}
            </p>

            <div className={s.actions}>
              <Button onClick={onInstall} aria-label="Deschide dialogul de instalare">
                Instalează
              </Button>
            </div>

            <button type="button" className={s.closeBtn} aria-label="Închide" onClick={handleClose}>
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
