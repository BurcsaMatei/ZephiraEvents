// components/InstallAppButton.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import { type ComponentType, useEffect, useState } from "react";

import type { InstallAppButtonInnerProps } from "./InstallAppButton.inner";

// ==============================
// Types
// ==============================
export type InstallAppButtonProps = InstallAppButtonInnerProps;

// ==============================
// Constante
// ==============================
const PWA_ENABLED =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_PWA === "1";

// ==============================
// Dynamic import
// ==============================
const InstallAppButtonInner = dynamic(() => import("./InstallAppButton.inner"), {
  ssr: false,
  loading: () => null,
}) as ComponentType<InstallAppButtonInnerProps>;

// ==============================
// Component
// ==============================
export default function InstallAppButton(props: InstallAppButtonProps) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!PWA_ENABLED) return;

    let handle: number;

    if (typeof window.requestIdleCallback === "function") {
      handle = window.requestIdleCallback(() => setIdle(true), { timeout: 1500 });
    } else {
      handle = window.setTimeout(() => setIdle(true), 800);
    }

    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, []);

  if (!PWA_ENABLED || !idle) return null;
  return <InstallAppButtonInner {...props} />;
}
