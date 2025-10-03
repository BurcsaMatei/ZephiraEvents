// components/blog/RelatedPosts.lazy.tsx
"use client";

// ==============================
// Imports
// ==============================
import Link from "next/link";

import { withBase } from "../../lib/config";
import {
  relatedLinkClass,
  relatedListClass,
  relatedTitleClass,
  relatedWrapClass,
} from "../../styles/relatedPosts.css";

// ==============================
// Types
// ==============================
type Item = { slug: string; title: string };
export type RelatedPostsProps = { items: Item[] };

// ==============================
// Component
// ==============================
export default function RelatedPosts({ items }: RelatedPostsProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className={relatedWrapClass} aria-labelledby="related-posts-title">
      <h3 id="related-posts-title" className={relatedTitleClass}>
        Poate te mai interesează și:
      </h3>
      <ul className={relatedListClass}>
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={withBase(`/blog/${p.slug}`)} className={relatedLinkClass}>
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
