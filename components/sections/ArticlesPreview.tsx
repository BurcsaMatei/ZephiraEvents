// components/sections/ArticlesPreview.tsx
"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { ArticlesPreviewProps } from "./ArticlesPreview.lazy";

// ==============================
// Dynamic import
// ==============================
// Component
const ArticlesPreviewLazy = dynamic(() => import("./ArticlesPreview.lazy"), {
  ssr: false,
  loading: () => null,
}) as ComponentType<ArticlesPreviewProps>;

// ==============================
// Component
// ==============================
export default function ArticlesPreview(props: ArticlesPreviewProps) {
  return <ArticlesPreviewLazy {...props} />;
}
