// components/sections/MotivationCards.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { MotivationCardsProps } from "./MotivationCards.lazy";

// ==============================
// Dynamic import
// ==============================
const MotivationCardsLazy = dynamic(() => import("./MotivationCards.lazy"), {
  ssr: true,
  loading: () => null,
}) as ComponentType<MotivationCardsProps>;

// ==============================
// Component
// ==============================
export default function MotivationCards(props: MotivationCardsProps) {
  return <MotivationCardsLazy {...props} />;
}
