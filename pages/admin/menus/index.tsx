// pages/admin/menus/index.tsx
// Admin — lista meniuri cu butoane Edit / Șterge (soft delete).

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { getAllMenusAdmin } from "../../../lib/menus.server";
import * as s from "../../../styles/admin/menus.css";
import type { Menu } from "../../../types/menu";

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<{ menus: Menu[] }> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  try {
    const menus = getAllMenusAdmin();
    const sorted = menus.sort((a, b) => a.slug.localeCompare(b.slug));
    return { props: { menus: sorted } };
  } catch {
    return { props: { menus: [] } };
  }
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminMenusPage({
  menus: initialMenus,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  async function handleDelete(slug: string) {
    if (!confirm(`Ștergi meniul "${slug}"? Acțiunea poate fi anulată din fișierul JSON.`)) return;
    setLoadingSlug(slug);
    try {
      const res = await fetch(`/api/admin/menus/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      const data = (await res.json()) as { ok: boolean; data?: Menu };
      if (data.ok && data.data) {
        setMenus((prev) => prev.map((m) => (m.slug === slug ? (data.data as Menu) : m)));
      }
    } finally {
      setLoadingSlug(null);
    }
  }

  async function handleRestore(slug: string) {
    setLoadingSlug(slug);
    try {
      const res = await fetch(`/api/admin/menus/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted: false }),
      });
      const data = (await res.json()) as { ok: boolean; data?: Menu };
      if (data.ok && data.data) {
        setMenus((prev) => prev.map((m) => (m.slug === slug ? (data.data as Menu) : m)));
      }
    } finally {
      setLoadingSlug(null);
    }
  }

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Meniuri ({menus.filter((m) => !m.deleted).length})</h1>
        <Link href="/admin/menus/new" className={s.newBtn}>
          + Meniu nou
        </Link>
      </div>

      {menus.length === 0 && <p className={s.empty}>Nu există meniuri.</p>}

      <div className={s.grid}>
        {menus.map((menu) => (
          <div key={menu.slug} className={`${s.card}${menu.deleted ? ` ${s.cardDeleted}` : ""}`}>
            {menu.image ? (
              <Image
                src={menu.image}
                alt={menu.imageAlt || menu.title}
                width={400}
                height={140}
                className={s.cardImg}
                unoptimized
              />
            ) : (
              <div className={s.cardImgPlaceholder}>🍽</div>
            )}
            <div className={s.cardBody}>
              <p className={s.cardTitle}>{menu.title}</p>
              <p className={s.cardMeta}>
                {menu.eventType} · {menu.currency} {menu.pricePerPers}/pers.
              </p>
              {menu.deleted && <span className={s.deletedBadge}>Șters</span>}
            </div>
            <div className={s.cardActions}>
              {!menu.deleted && (
                <Link href={`/admin/menus/${menu.slug}`} className={s.editBtn}>
                  Editează
                </Link>
              )}
              {!menu.deleted ? (
                <button
                  type="button"
                  className={s.deleteBtn}
                  disabled={loadingSlug === menu.slug}
                  onClick={() => void handleDelete(menu.slug)}
                >
                  Șterge
                </button>
              ) : (
                <button
                  type="button"
                  className={s.restoreBtn}
                  disabled={loadingSlug === menu.slug}
                  onClick={() => void handleRestore(menu.slug)}
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

AdminMenusPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
