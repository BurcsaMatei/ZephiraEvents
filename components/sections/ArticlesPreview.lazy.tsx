// components/sections/ArticlesPreview.lazy.tsx
"use client";

// ==============================
// Imports
// ==============================
import Link from "next/link";
import React, { useMemo } from "react";

import { type BlogPost } from "../../lib/blogData";
import { withBase } from "../../lib/config";
import {
  cardWrap,
  ctaRowClass,
  emptyClass,
  gridClass,
  headerClass,
  subtitleClass,
  titleClass,
} from "../../styles/articlesPreview.css";
import { btn, primary as btnPrimary } from "../../styles/button.css";
import type { Post } from "../../types/blog";
import Appear from "../animations/Appear";
import BlogCard from "../blog/BlogCard";
import Grid from "../Grid";

// ==============================
// Types
// ==============================
export type ArticlesPreviewProps = {
  posts: BlogPost[];
  title?: string;
  subtitle?: string;
  showCta?: boolean;
  limit?: number;
};

// ==============================
// Utils
// ==============================
const adaptToPost = (p: BlogPost): Post => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  date: p.date,
  tags: p.tags ?? [],
  ...(p.coverImage ? { cover: p.coverImage } : {}),
});

// ==============================
// Component
// ==============================
export default function ArticlesPreview({
  posts,
  title = "Articole recente",
  subtitle = "Noutăți și ghiduri scurte.",
  showCta = true,
  limit = 4,
}: ArticlesPreviewProps): JSX.Element {
  const hasPosts = Array.isArray(posts) && posts.length > 0;
  const postsAsFull = useMemo(() => posts.slice(0, limit).map(adaptToPost), [posts, limit]);

  return (
    <>
      {/* Header */}
      <div className={headerClass}>
        <h2 id="articles-preview-title" className={titleClass}>
          {title}
        </h2>
        <p className={subtitleClass}>{subtitle}</p>
      </div>

      {/* Grid / Empty */}
      {!hasPosts ? (
        <div className={emptyClass}>Nu avem încă articole publice. Revino curând.</div>
      ) : (
        <>
          <Grid cols={{ base: 2, md: 2, lg: 4 }} gap="20px" className={gridClass}>
            {postsAsFull.map((post, i) => (
              <Appear as="div" key={post.slug} className={cardWrap} delay={0.1 * i}>
                <BlogCard post={post} />
              </Appear>
            ))}
          </Grid>

          {showCta && (
            <div className={ctaRowClass}>
              <Link
                href={withBase("/blog")}
                className={`${btn} ${btnPrimary}`}
                aria-label="Vezi toate articolele"
              >
                Vezi toate articolele →
              </Link>
            </div>
          )}
        </>
      )}
    </>
  );
}
