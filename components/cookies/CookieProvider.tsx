// components/cookies/CookieProvider.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { isGrantedConsent, readConsent, removeConsent, writeConsent } from "../../lib/cookies";
import { btn, btnGhost, btnPrimary, btnPrimaryOutline } from "../../styles/cookieBanner.css";
import {
  card,
  dialogActions,
  fieldset as fsClass,
  labelRow,
  legend as lgClass,
  overlay,
  overlayCloser,
} from "../../styles/cookieDialog.css";

const CookieBanner = dynamic(() => import("./CookieBanner"), { ssr: false });

// ==============================
// Types
// ==============================
type ConsentCategory = "necessary" | "analytics" | "marketing";

type ConsentCtx = {
  analytics: boolean;
  marketing: boolean;
  bannerVisible: boolean;
  dialogOpen: boolean;
  openSettings: () => void;
  closeDialog: () => void;
  setAnalytics: (v: boolean) => void;
  setMarketing: (v: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePrefs: () => void;
  resetConsent: () => void;
  hasConsent: (cat: ConsentCategory) => boolean;
};

// ==============================
// Context
// ==============================
const CookieContext = createContext<ConsentCtx | null>(null);

// ==============================
// Provider
// ==============================
export default function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consentState, setConsentState] = useState({ analytics: false, marketing: false });
  const analytics = consentState.analytics;
  const marketing = consentState.marketing;

  const [bannerVisible, setBannerVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // init din storage + mount gate pentru CookieDialog/Banner
  useEffect(() => {
    setMounted(true);
    const stored = readConsent();
    if (isGrantedConsent(stored)) {
      setConsentState({
        analytics: !!stored.granted.analytics,
        marketing: !!stored.granted.marketing,
      });
      setBannerVisible(false);
    } else {
      setConsentState({ analytics: false, marketing: false });
      setBannerVisible(true);
    }
  }, []);

  // cross-tab sync
  useEffect(() => {
    const onStorage = () => {
      const stored = readConsent();
      if (isGrantedConsent(stored)) {
        setConsentState({
          analytics: !!stored.granted.analytics,
          marketing: !!stored.granted.marketing,
        });
        setBannerVisible(false);
      } else {
        setConsentState({ analytics: false, marketing: false });
        setBannerVisible(true);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // API
  const setAnalytics = useCallback(
    (v: boolean) => setConsentState((prev) => ({ ...prev, analytics: v })),
    [],
  );
  const setMarketing = useCallback(
    (v: boolean) => setConsentState((prev) => ({ ...prev, marketing: v })),
    [],
  );

  const hasConsent = useCallback(
    (cat: ConsentCategory) =>
      cat === "necessary" ? true : cat === "analytics" ? analytics : marketing,
    [analytics, marketing],
  );

  const openSettings = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  const acceptAll = useCallback(() => {
    setConsentState({ analytics: true, marketing: true });
    writeConsent({ granted: { necessary: true, analytics: true, marketing: true } });
    setBannerVisible(false);
    setDialogOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    setConsentState({ analytics: false, marketing: false });
    writeConsent({ denied: true });
    setBannerVisible(false);
    setDialogOpen(false);
  }, []);

  const savePrefs = useCallback(() => {
    writeConsent({ granted: { necessary: true, analytics, marketing } });
    setBannerVisible(false);
    setDialogOpen(false);
  }, [analytics, marketing]);

  const resetConsent = useCallback(() => {
    removeConsent();
    setConsentState({ analytics: false, marketing: false });
    setBannerVisible(true);
    setDialogOpen(false);
  }, []);

  const value: ConsentCtx = {
    analytics,
    marketing,
    bannerVisible,
    dialogOpen,
    openSettings,
    closeDialog,
    setAnalytics,
    setMarketing,
    acceptAll,
    rejectAll,
    savePrefs,
    resetConsent,
    hasConsent,
  };

  return (
    <CookieContext.Provider value={value}>
      {children}
      {mounted && <CookieDialog />}
      {mounted && <CookieBanner />}
    </CookieContext.Provider>
  );
}

// ==============================
// Hook
// ==============================
export function useCookieConsent() {
  const ctx = useContext(CookieContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieProvider");
  return ctx;
}

// ==============================
// Dialog
// ==============================
function CookieDialog(): JSX.Element | null {
  const {
    dialogOpen,
    closeDialog,
    analytics,
    marketing,
    setAnalytics,
    setMarketing,
    rejectAll,
    acceptAll,
    savePrefs,
  } = useCookieConsent();

  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen, closeDialog]);

  if (!dialogOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="cookie-dialog-title" className={overlay}>
      <button
        className={overlayCloser}
        onClick={closeDialog}
        aria-label="Închide preferințe cookie"
      />
      <div className={card}>
        <h2 id="cookie-dialog-title">Preferințe cookie</h2>

        <fieldset className={fsClass}>
          <legend className={lgClass}>Necesare</legend>
          <div className={labelRow}>
            <input type="checkbox" checked readOnly aria-readonly />
            <span>Necesare funcționării site-ului</span>
          </div>
        </fieldset>

        <fieldset className={fsClass}>
          <legend className={lgClass}>Analitice</legend>
          <label className={labelRow}>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.currentTarget.checked)}
            />
            <span>Măsurare anonimă a traficului</span>
          </label>
        </fieldset>

        <fieldset className={fsClass}>
          <legend className={lgClass}>Marketing</legend>
          <label className={labelRow}>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.currentTarget.checked)}
            />
            <span>Personalizare reclame</span>
          </label>
        </fieldset>

        <div className={dialogActions}>
          <button type="button" onClick={rejectAll} className={`${btn} ${btnGhost}`}>
            Refuză tot
          </button>
          <button type="button" onClick={acceptAll} className={`${btn} ${btnPrimary}`}>
            Acceptă tot
          </button>
          <button type="button" onClick={savePrefs} className={`${btn} ${btnPrimaryOutline}`}>
            Salvează
          </button>
        </div>
      </div>
    </div>
  );
}
