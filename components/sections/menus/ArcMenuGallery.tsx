// components/sections/menus/ArcMenuGallery.tsx

"use client";

// ==============================
// Rol
// ==============================
// Wrapper “.lazy” pentru ArcMenuGallery (SSR ON).
// Fix: folosim dynamic() cu import() standard (determinist server/client),
// ca să evităm interop-ul Promise/require care produce hydration mismatch.

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

import type { Menu } from "../../../types/menu";

// ==============================
// Types
// ==============================
export type ArcMenuPresentation = {
  eyebrow?: ReactNode;
  title?: string;
  lede?: ReactNode;
};

export type ArcMenuGalleryProps = {
  id?: string;
  heading?: string;
  menus?: Menu[];
  intervalMs?: number;
  tiltMax?: number;
  glowOpacity?: number;
  priorityFirst?: boolean;
  pauseWhenHidden?: boolean;
  presentation?: ArcMenuPresentation;
};

// ==============================
// Dynamic import (SSR ON)
// ==============================
const ArcMenuGalleryLazy = dynamic<ArcMenuGalleryProps>(
  () =>
    import("./ArcMenuGallery.lazy").then((m) => m.default as ComponentType<ArcMenuGalleryProps>),
  { loading: () => null },
);

// ==============================
// Component
// ==============================
export default function ArcMenuGallery(props: ArcMenuGalleryProps) {
  return <ArcMenuGalleryLazy {...props} />;
}
