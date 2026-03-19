// components/ServiceWorkerRegiste.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import { type ComponentType, useEffect, useState } from "react";

import type { ServiceWorkerRegisterProps } from "./ServiceWorkerRegister.inner";

// ==============================
// Constante
// ==============================
// Activ doar în producție + flag public
const PWA_ENABLED =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_PWA === "1";

// ==============================
// Dynamic import
// ==============================
const ServiceWorkerRegisterInner = dynamic(() => import("./ServiceWorkerRegister.inner"), {
  ssr: false,
  loading: () => null,
}) as ComponentType<ServiceWorkerRegisterProps>;

// ==============================
// Component
// ==============================
export default function ServiceWorkerRegister(props: ServiceWorkerRegisterProps) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!PWA_ENABLED) return;

    const onLoad = () => {
      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };

      const id =
        typeof w.requestIdleCallback === "function"
          ? w.requestIdleCallback(() => setIdle(true), { timeout: 1500 })
          : (setTimeout(() => setIdle(true), 600) as unknown as number);

      return () => {
        if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
        else clearTimeout(id as unknown as number);
      };
    };

    if (document.readyState === "complete") {
      const cleanup = onLoad();
      return cleanup;
    } else {
      let cleanup: (() => void) | undefined;
      const once = () => {
        cleanup = onLoad();
      };
      window.addEventListener("load", once, { once: true });
      return () => {
        window.removeEventListener("load", once);
        cleanup?.();
      };
    }
  }, []);

  if (!PWA_ENABLED || !idle) return null;
  return <ServiceWorkerRegisterInner {...props} />;
}
