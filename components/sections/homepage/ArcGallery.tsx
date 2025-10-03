// components/sections/homepage/ArcGallery.tsx
"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { ArcGalleryProps } from "./ArcGallery.lazy";

// ==============================
// Dynamic import
// ==============================
// Încărcăm componenta grea doar pe client, după hidratare.
// Nu schimbăm vizualul; doar mutăm codul voluminos în fișierul .lazy.
const ArcGalleryLazy = dynamic(() => import("./ArcGallery.lazy"), {
  ssr: false,
  loading: () => null,
}) as ComponentType<ArcGalleryProps>;

// ==============================
// Component
// ==============================
export default function ArcGallery(props: ArcGalleryProps) {
  return <ArcGalleryLazy {...props} />;
}
