// components/admin/AdminLayout.tsx
// Layout comun pentru toate paginile admin — sidebar + main content.
// Fără Header/Footer public.

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useState } from "react";

// ──────────────────────────────────────────────────────────
// Nav icons (inline SVG, currentColor)
// ──────────────────────────────────────────────────────────
const IconInbox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 10h5l2 3h6l2-3h5"/>
  </svg>
);

const IconReviews = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
  </svg>
);

const IconMenus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11V3a1 1 0 0 1 2 0v3h2V3a1 1 0 0 1 2 0v8a4 4 0 0 1-3 3.87V21a1 1 0 0 1-2 0v-6.13A4 4 0 0 1 3 11z"/>
    <path d="M16 3v7c0 1.66 1.34 3 3 3v8a1 1 0 0 1-2 0V3a1 1 0 0 1 2 0z"/>
  </svg>
);

const IconBlog = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
  </svg>
);

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
  { href: "/admin/inbox", label: "Inbox", icon: <IconInbox /> },
  { href: "/admin/reviews", label: "Recenzii", icon: <IconReviews /> },
  { href: "/admin/menus", label: "Meniuri", icon: <IconMenus /> },
  { href: "/admin/blog", label: "Blog", icon: <IconBlog /> },
];

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
          <Link href="/admin" className={s.brand} onClick={closeSidebar}>
            <span className={s.brandName}>ZephiraEvents</span>
            <span className={s.brandSub}>Admin</span>
          </Link>

          <AdminSearch />

          <nav className={s.nav}>
            {NAV.map(({ href, label, icon }) => {
              const active = isActive(href);
              const badge = href === "/admin/inbox" && unreadCount > 0 ? unreadCount : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${s.navLink}${active ? ` ${s.navLinkActive}` : ""}`}
                  onClick={closeSidebar}
                >
                  <span className={s.navIcon}>{icon}</span>
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
