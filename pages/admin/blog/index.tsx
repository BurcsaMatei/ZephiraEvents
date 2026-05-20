// pages/admin/blog/index.tsx
// Admin — lista articole blog cu butoane Edit / Șterge / Restaurează.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { type BlogPostAdmin,getAllPostsAdmin } from "../../../lib/blog.server";
import { formatDateISOtoRo } from "../../../lib/dates";
import * as s from "../../../styles/admin/blog.css";

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<{ posts: BlogPostAdmin[] }> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  try {
    const posts = getAllPostsAdmin();
    return { props: { posts } };
  } catch {
    return { props: { posts: [] } };
  }
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminBlogPage({
  posts: initialPosts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [posts, setPosts] = useState<BlogPostAdmin[]>(initialPosts);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Ștergi articolul "${title}"? Acțiunea poate fi anulată din admin.`)) return;
    setLoadingSlug(slug);
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        setPosts((prev) => prev.map((p) => p.slug === slug ? { ...p, deleted: true } : p));
      }
    } finally {
      setLoadingSlug(null);
    }
  }

  async function handleRestore(slug: string) {
    setLoadingSlug(slug);
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        setPosts((prev) => prev.map((p) => p.slug === slug ? { ...p, deleted: false } : p));
      }
    } finally {
      setLoadingSlug(null);
    }
  }

  const activeCount = posts.filter((p) => p.deleted !== true).length;

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Articole blog ({activeCount})</h1>
        <Link href="/admin/blog/new" className={s.newBtn}>
          + Articol nou
        </Link>
      </div>

      {posts.length === 0 && <p className={s.empty}>Nu există articole.</p>}

      <div className={s.list}>
        {posts.map((post) => (
          <div key={post.slug} className={`${s.card}${post.deleted ? ` ${s.cardDeleted}` : ""}`}>
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                width={80}
                height={56}
                className={s.cardCover}
                unoptimized
              />
            ) : (
              <div className={s.cardCoverPlaceholder}>📝</div>
            )}

            <div className={s.cardBody}>
              <p className={s.cardTitle}>{post.title}</p>
              <div className={s.cardMeta}>
                <span>{formatDateISOtoRo(post.date)}</span>
                {post.author && <span>{post.author}</span>}
                {post.tags && post.tags.length > 0 && (
                  <span>{post.tags.slice(0, 3).join(", ")}</span>
                )}
                {post.deleted && <span className={s.deletedBadge}>Șters</span>}
                {post.draft && <span className={s.draftBadge}>Draft</span>}
              </div>
            </div>

            <div className={s.cardActions}>
              {!post.deleted && (
                <Link href={`/admin/blog/${post.slug}`} className={s.editBtn}>
                  Editează
                </Link>
              )}
              {!post.deleted ? (
                <button
                  type="button"
                  className={s.deleteBtn}
                  disabled={loadingSlug === post.slug}
                  onClick={() => void handleDelete(post.slug, post.title)}
                >
                  Șterge
                </button>
              ) : (
                <button
                  type="button"
                  className={s.restoreBtn}
                  disabled={loadingSlug === post.slug}
                  onClick={() => void handleRestore(post.slug)}
                >
                  Restaurează
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

AdminBlogPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
