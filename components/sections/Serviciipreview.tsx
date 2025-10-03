// components/sections/Serviciipreview.tsx

"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { ServiciipreviewProps } from "./Serviciipreview.lazy";

// ==============================
// Dynamic import
// ==============================
const ServiciipreviewLazy = dynamic(() => import("./Serviciipreview.lazy"), {
  ssr: true,
  loading: () => null,
}) as ComponentType<ServiciipreviewProps>;

// ==============================
// Component
// ==============================
// Păstrăm exportul NUMIT, ca în versiunea ta.
export function Serviciipreview(props: ServiciipreviewProps) {
  return <ServiciipreviewLazy {...props} />;
}
