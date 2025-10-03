// components/sections/IntroSection.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { IntroSectionProps } from "../sections/IntroSection.lazy";

// ==============================
// Dynamic import
// ==============================
const IntroSectionLazy = dynamic(() => import("../sections/IntroSection.lazy"), {
  ssr: true,
  loading: () => null,
}) as ComponentType<IntroSectionProps>;

// ==============================
// Component
// ==============================
export default function IntroSection(props: IntroSectionProps) {
  return <IntroSectionLazy {...props} />;
}
