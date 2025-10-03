// components/blog/RelatedPosts.tsx
"use client";

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// ==============================
// Types
// ==============================
import type { RelatedPostsProps } from "./RelatedPosts.lazy";

// ==============================
// Dynamic import
// ==============================
const RelatedPostsLazy = dynamic(() => import("./RelatedPosts.lazy"), {
  ssr: true,
  loading: () => null,
}) as ComponentType<RelatedPostsProps>;

// ==============================
// Component
// ==============================
export default function RelatedPosts(props: RelatedPostsProps) {
  return <RelatedPostsLazy {...props} />;
}
