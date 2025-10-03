// components/sections/Outro.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { OutroProps } from "./Outro.lazy";

// ==============================
// Dynamic import
// ==============================
const OutroLazy = dynamic(() => import("./Outro.lazy"), {
  ssr: true,
  loading: () => null,
}) as ComponentType<OutroProps>;

// ==============================
// Component
// ==============================
export default function Outro(props: OutroProps) {
  return <OutroLazy {...props} />;
}
