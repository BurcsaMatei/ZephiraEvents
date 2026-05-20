// components/admin/AdminLayout.tsx
// Layout comun pentru toate paginile admin — sidebar + main content.
// Fără Header/Footer public.

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useState } from "react";

import * as s from "../../styles/admin/layout.css";
import ThemeSwitcher from "../ThemeSwitcher";
import AdminInstallButton from "./AdminInstallButton";
import AdminSearch from "./AdminSearch";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  children: ReactNode;
  unreadCount?: number;
};

// ──────────────────────────────────────────────────────────
// Nav items
// ──────────────────────────────────────────────────────────
const NAV = [
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/reviews", label: "Recenzii" },
  { href: "/admin/menus", label: "Meniuri" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminLayout({ children, unreadCount = 0 }: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string): boolean {
    const p = router.pathname;
    return p === href || p.startsWith(href + "/");
  }

  function handleLogout() {
    void fetch("/api/admin/logout", { method: "POST" }).then(() => {
      void router.push("/admin/login");
    });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/admin-manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#12122a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ZE Admin" />
      </Head>

      {/* Hamburger — vizibil doar pe mobil via CSS */}
      <button
        type="button"
        className={s.hamburger}
        onClick={() => setSidebarOpen(true)}
        aria-label="Deschide meniu"
      >
        ☰
      </button>

      {/* Overlay — apare doar când sidebar-ul e deschis pe mobil */}
      {sidebarOpen && (
        <div
          className={s.overlay}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={s.wrapper}>
        <aside className={`${s.sidebar}${sidebarOpen ? ` ${s.sidebarOpen}` : ""}`}>
          <div className={s.brand}>
            <span className={s.brandName}>ZephiraEvents</span>
            <span className={s.brandSub}>Admin</span>
          </div>

          <AdminSearch />

          <nav className={s.nav}>
            {NAV.map(({ href, label }) => {
              const active = isActive(href);
              const badge = href === "/admin/inbox" && unreadCount > 0 ? unreadCount : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${s.navLink}${active ? ` ${s.navLinkActive}` : ""}`}
                  onClick={closeSidebar}
                >
                  {label}
                  {badge > 0 && <span className={s.navBadge}>{badge}</span>}
                </Link>
              );
            })}
          </nav>

          <AdminInstallButton />

          <div className={s.sidebarFooter}>
            <button type="button" onClick={handleLogout} className={s.logoutBtn}>
              Logout
            </button>
            <ThemeSwitcher />
          </div>
        </aside>

        <main className={s.main}>{children}</main>
      </div>
    </>
  );
}
