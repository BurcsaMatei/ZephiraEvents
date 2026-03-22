// components/admin/AdminLayout.tsx
// Layout comun pentru toate paginile admin — sidebar + main content.
// Fără Header/Footer public.

import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

import * as s from "../../styles/admin/layout.css";

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
  { href: "/admin/compose", label: "Compune email" },
] as const;

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminLayout({ children, unreadCount = 0 }: Props) {
  const router = useRouter();

  function isActive(href: string): boolean {
    const p = router.pathname;
    return p === href || p.startsWith(href + "/");
  }

  function handleLogout() {
    void fetch("/api/admin/logout", { method: "POST" }).then(() => {
      void router.push("/admin/login");
    });
  }

  return (
    <div className={s.wrapper}>
      <aside className={s.sidebar}>
        <div className={s.brand}>
          <span className={s.brandName}>ZephiraEvents</span>
          <span className={s.brandSub}>Admin</span>
        </div>

        <nav className={s.nav}>
          {NAV.map(({ href, label }) => {
            const active = isActive(href);
            const badge = href === "/admin/inbox" && unreadCount > 0 ? unreadCount : 0;
            return (
              <Link
                key={href}
                href={href}
                className={`${s.navLink}${active ? ` ${s.navLinkActive}` : ""}`}
              >
                {label}
                {badge > 0 && <span className={s.navBadge}>{badge}</span>}
              </Link>
            );
          })}
        </nav>

        <button type="button" onClick={handleLogout} className={s.logoutBtn}>
          Logout
        </button>
      </aside>

      <main className={s.main}>{children}</main>
    </div>
  );
}
