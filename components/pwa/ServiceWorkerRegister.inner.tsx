// components/ServiceWorkerRegister.inner.tsx

"use client";

// ==============================
// Imports
// ==============================
import { useEffect, useRef } from "react";

// ==============================
// Types
// ==============================
type UpdateMode = "visibilitychange" | "interval" | "none";

export type ServiceWorkerRegisterProps = {
  /** URL către SW (next-pwa output implicit: /sw.js) */
  swUrl?: string;
  /** Scope-ul SW (de regulă "/") */
  scope?: string;
  /** Cheamă UI-ul tău când există o versiune nouă disponibilă */
  onNeedRefresh?: (registration: ServiceWorkerRegistration) => void;
  /** Notifică momentul când aplicația este gata de offline (prima instalare) */
  onOfflineReady?: (registration: ServiceWorkerRegistration) => void;
  /** Dacă true, face auto reload când SW-ul nou devine activ */
  autoReloadOnUpdate?: boolean;
  /**
   * Când să ceară update la SW:
   *  - "visibilitychange": când fila devine vizibilă (implicita)
   *  - "interval": la fiecare `updateIntervalMs`
   *  - "none": nu cere update automat
   */
  updateOn?: UpdateMode;
  /** Intervalul pentru update (ms) – folosit doar când updateOn="interval" */
  updateIntervalMs?: number;
  /** Loguri utile în consolă */
  debug?: boolean;
};

// ==============================
// Constante
// ==============================
const DEFAULTS = {
  swUrl: "/sw.js",
  scope: "/",
  updateOn: "visibilitychange" as const,
  updateIntervalMs: 60 * 60 * 1000, // 1h
};

// ⚑ PWA toggle: activ doar în producție și când flag-ul public este "1".
const PWA_ENABLED =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_PWA === "1";

// ==============================
// Utils
// ==============================
const log = (debug?: boolean, ...args: unknown[]) =>
  debug ? console.log("[SW]", ...args) : undefined;

const isSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator;
const isSecure = () => typeof window !== "undefined" && window.isSecureContext;

/** Returnează (dacă există) înregistrarea pentru scope-ul dorit */
async function findRegistrationForScope(scope: string) {
  const regs = await navigator.serviceWorker.getRegistrations();
  const expected = new URL(scope, location.origin).href;
  return regs.find((r) => r.scope === expected);
}

// ==============================
// Component
// ==============================
export default function ServiceWorkerRegister({
  swUrl = DEFAULTS.swUrl,
  scope = DEFAULTS.scope,
  onNeedRefresh,
  onOfflineReady,
  autoReloadOnUpdate,
  updateOn = DEFAULTS.updateOn,
  updateIntervalMs = DEFAULTS.updateIntervalMs,
  debug,
}: ServiceWorkerRegisterProps) {
  const reloadedRef = useRef(false);
  const registeredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Gate pe flag-ul public (OFF local by default)
    if (!PWA_ENABLED) {
      log(debug, "PWA disabled via NEXT_PUBLIC_ENABLE_PWA");
      return;
    }
    if (!isSupported()) {
      log(debug, "ServiceWorker not supported");
      return;
    }
    if (!isSecure()) {
      log(debug, "Not a secure context (HTTPS required except localhost)");
      return;
    }
    if (registeredRef.current) return; // safety

    const cleanupFns: Array<() => void> = [];

    const doRegister = async () => {
      try {
        // Evită dublarea: vezi dacă există deja un SW pe același scope
        const existing = await findRegistrationForScope(scope);
        if (existing) {
          log(debug, "Existing registration found:", existing.scope);

          wireUpdateFlow(existing);
          wireUpdateTriggers(existing);
          registeredRef.current = true;
          return;
        }

        // Înregistrează după ce s-a încărcat pagina (evită aglomerarea inițială)
        const registerNow = async () => {
          try {
            const reg = await navigator.serviceWorker.register(swUrl, { scope });
            log(debug, "Registered SW:", reg.scope);

            wireUpdateFlow(reg);
            wireUpdateTriggers(reg);

            registeredRef.current = true;
          } catch (err) {
            log(debug, "Register failed:", err);
          }
        };

        if (document.readyState === "complete") {
          await registerNow();
        } else {
          window.addEventListener("load", registerNow, { once: true });
          cleanupFns.push(() => window.removeEventListener("load", registerNow));
        }
      } catch (err) {
        log(debug, "Setup failed:", err);
      }
    };

    // Gestionează fluxul de update/offline
    const wireUpdateFlow = (registration: ServiceWorkerRegistration) => {
      // 1) Detectează instalări noi
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (installing.state !== "installed") return;

          // Dacă există un controller, avem deja un SW activ => acesta e un UPDATE
          if (navigator.serviceWorker.controller) {
            log(debug, "Update available");
            onNeedRefresh?.(registration);
          } else {
            // prima instalare: offline ready
            log(debug, "Offline ready");
            onOfflineReady?.(registration);
          }
        });
      });

      // 2) Opțional: auto-reload când trece controlul către noul SW
      const onControllerChange = () => {
        if (!autoReloadOnUpdate) return;
        if (reloadedRef.current) return;
        reloadedRef.current = true;
        log(debug, "Controller changed → reload");
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

      // Cleanup controllerchange la unmount
      cleanupFns.push(() =>
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange),
      );
    };

    // Triggers pentru a căuta versiuni noi
    const wireUpdateTriggers = (registration: ServiceWorkerRegistration) => {
      // A) visibilitychange
      if (updateOn === "visibilitychange") {
        const onVisible = () => {
          if (document.visibilityState === "visible") {
            log(debug, "Visibility → registration.update()");
            registration.update().catch(() => {});
          }
        };
        document.addEventListener("visibilitychange", onVisible);
        cleanupFns.push(() => document.removeEventListener("visibilitychange", onVisible));
      }

      // B) interval
      if (updateOn === "interval") {
        intervalRef.current = setInterval(
          () => {
            log(debug, "Interval → registration.update()");
            registration.update().catch(() => {});
          },
          Math.max(15_000, updateIntervalMs),
        ); // minim 15s de siguranță
        cleanupFns.push(() => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        });
      }
    };

    // rulează tot
    void doRegister();

    // cleanup la unmount
    return () => {
      cleanupFns.forEach((fn) => fn());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    swUrl,
    scope,
    onNeedRefresh,
    onOfflineReady,
    autoReloadOnUpdate,
    updateOn,
    updateIntervalMs,
    debug,
  ]);

  return null;
}
