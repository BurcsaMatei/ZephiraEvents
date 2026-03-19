// components/PwaInstallCta.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ==============================
// Dynamic import
// ==============================
const PwaInstallCtaInner = dynamic(() => import("./PwaInstallCta.inner"), {
  ssr: false,
  loading: () => null,
});

// ==============================
// Component
// ==============================
export default function PwaInstallCta(): JSX.Element | null {
  // încărcăm în idle ca să nu concurăm cu LCP/JS critic
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const handle =
      typeof w.requestIdleCallback === "function"
        ? w.requestIdleCallback(() => setIdle(true), { timeout: 1500 })
        : (setTimeout(() => setIdle(true), 800) as unknown as number);

    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(handle);
      else clearTimeout(handle as unknown as number);
    };
  }, []);

  if (!idle) return null;
  return <PwaInstallCtaInner />;
}
