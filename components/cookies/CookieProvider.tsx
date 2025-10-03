// components/cookies/CookieProvider.tsx

"use client";

// ==============================
// Imports
// ==============================
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

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
import CookieBanner from "./CookieBanner";

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

// Augmentări sigure pentru obiectul global window (fără any)
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// ==============================
// ENV
// ==============================
const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID || "").trim();
const GA_MEASUREMENT_ID = (
  process.env.NEXT_PUBLIC_GA4_ID ||
  process.env.NEXT_PUBLIC_GA_ID ||
  ""
).trim();
const FB_PIXEL_ID = (process.env.NEXT_PUBLIC_FB_PIXEL_ID || "").trim();

// ==============================
// Utils
// ==============================
function getNonce(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const s = document.querySelector<HTMLScriptElement>("script[nonce]");
  return s?.nonce;
}

function ensureDataLayer(): void {
  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = [];
  }
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      // gtag tipic împinge arguments în dataLayer
      window.dataLayer!.push(args);
    };
  }
}

function injectScript(src: string, id: string): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  el.id = id;
  const nonce = getNonce();
  if (nonce) el.setAttribute("nonce", nonce);
  document.head.appendChild(el);
}

function injectInline(code: string, id: string): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  const nonce = getNonce();
  if (nonce) el.setAttribute("nonce", nonce);
  el.text = code;
  document.head.appendChild(el);
}

function gtagConsentUpdate(opts: { analytics: boolean; marketing: boolean }): void {
  const val = {
    analytics_storage: opts.analytics ? "granted" : "denied",
    ad_storage: opts.marketing ? "granted" : "denied",
  } as const;
  try {
    window.gtag?.("consent", "update", val);
  } catch {
    /* no-op */
  }
}

function fbqConsentUpdate(granted: boolean): void {
  try {
    window.fbq?.("consent", granted ? "grant" : "revoke");
  } catch {
    /* no-op */
  }
}

// ==============================
// Context
// ==============================
const CookieContext = createContext<ConsentCtx | null>(null);

// ==============================
// Provider
// ==============================
export default function CookieProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadedRef = useRef({ gtm: false, ga: false, fb: false });

  // init din storage
  useEffect(() => {
    const stored = readConsent();
    if (isGrantedConsent(stored)) {
      setAnalytics(!!stored.granted.analytics);
      setMarketing(!!stored.granted.marketing);
      setBannerVisible(false);
    } else {
      setAnalytics(false);
      setMarketing(false);
      setBannerVisible(true);
    }
  }, []);

  // cross-tab sync
  useEffect(() => {
    const onStorage = () => {
      const stored = readConsent();
      if (isGrantedConsent(stored)) {
        setAnalytics(!!stored.granted.analytics);
        setMarketing(!!stored.granted.marketing);
        setBannerVisible(false);
      } else {
        setAnalytics(false);
        setMarketing(false);
        setBannerVisible(true);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // gating + inject – analytics
  useEffect(() => {
    if (!analytics) {
      gtagConsentUpdate({ analytics: false, marketing });
      return;
    }

    if (GTM_ID && !loadedRef.current.gtm) {
      ensureDataLayer();
      window.gtag?.("consent", "default", {
        analytics_storage: "denied",
        ad_storage: marketing ? "granted" : "denied",
      });
      injectScript(
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`,
        "gtm-js",
      );
      loadedRef.current.gtm = true;
    } else if (GA_MEASUREMENT_ID && !loadedRef.current.ga) {
      ensureDataLayer();
      injectScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`,
        "ga4-js",
      );
      injectInline(
        [
          "window.dataLayer=window.dataLayer||[];",
          "function gtag(){dataLayer.push(arguments);}",
          "gtag('js', new Date());",
          "gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied'});",
          `gtag('config','${GA_MEASUREMENT_ID}',{anonymize_ip:true,transport_type:'beacon'});`,
        ].join(""),
        "ga4-init",
      );
      loadedRef.current.ga = true;
    }

    gtagConsentUpdate({ analytics: true, marketing });
  }, [analytics, marketing]);

  // gating + inject – marketing
  useEffect(() => {
    if (!marketing) {
      fbqConsentUpdate(false);
      return;
    }
    if (!FB_PIXEL_ID || loadedRef.current.fb) {
      fbqConsentUpdate(true);
      return;
    }
    injectInline(
      [
        "!function(f,b,e,v,n,t,s){",
        "if(f.fbq)return;n=f.fbq=function(){n.callMethod?",
        "n.callMethod.apply(n,arguments):n.queue.push(arguments)};",
        "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';",
        "n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;",
        "s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)",
        "}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');",
        `fbq('init','${FB_PIXEL_ID}');`,
        "fbq('consent','revoke');",
      ].join(""),
      "fb-init",
    );
    loadedRef.current.fb = true;
    fbqConsentUpdate(true);
  }, [marketing]);

  // API
  const hasConsent = useCallback(
    (cat: ConsentCategory) =>
      cat === "necessary" ? true : cat === "analytics" ? analytics : marketing,
    [analytics, marketing],
  );

  const openSettings = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  const acceptAll = useCallback(() => {
    setAnalytics(true);
    setMarketing(true);
    writeConsent({ granted: { necessary: true, analytics: true, marketing: true } });
    setBannerVisible(false);
    setDialogOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    setAnalytics(false);
    setMarketing(false);
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
    setAnalytics(false);
    setMarketing(false);
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
      <CookieDialog />
      <CookieBanner />
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
