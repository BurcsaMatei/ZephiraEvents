// pages/admin/index.tsx
// Dashboard admin — 4 carduri de statistici live.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import LogoMark from "../../components/brand/LogoMark";

const IconInbox = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const IconReviews = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconMenus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3 2h18v4H3zM3 10h18v4H3zM3 18h18v4H3z" />
  </svg>
);

const IconBlog = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
import { verifyAdminSession } from "../../lib/admin/auth";
import { getFile, listFiles } from "../../lib/admin/github";
import { getAllPostsAdmin } from "../../lib/blog.server";
import { getAllMenusAdmin } from "../../lib/menus.server";
import * as s from "../../styles/admin/dashboard.css";
import type { MessageJson } from "../api/admin/messages/index";
import type { ReviewJson } from "../api/admin/reviews/index";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Stats = {
  messages: { total: number; unread: number };
  reviews: { total: number; pending: number };
  menus: { active: number };
  posts: { active: number };
};

type Props = { stats: Stats };

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
const CARDS: Array<{
  title: string;
  href: string;
  icon: ReactElement;
  primary: (s: Stats) => number;
  label: string;
  secondary?: (s: Stats) => string;
}> = [
  {
    title: "Inbox",
    href: "/admin/inbox",
    icon: <IconInbox />,
    primary: (s) => s.messages.unread,
    label: "necitite",
    secondary: (s) => `${s.messages.total} total`,
  },
  {
    title: "Recenzii",
    href: "/admin/reviews",
    icon: <IconReviews />,
    primary: (s) => s.reviews.pending,
    label: "în așteptare",
    secondary: (s) => `${s.reviews.total} total`,
  },
  {
    title: "Meniuri",
    href: "/admin/menus",
    icon: <IconMenus />,
    primary: (s) => s.menus.active,
    label: "meniuri active",
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: <IconBlog />,
    primary: (s) => s.posts.active,
    label: "articole active",
  },
];

export default function AdminDashboardPage({
  stats,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <h1 className={s.pageTitle}>Dashboard</h1>

      <div className={s.welcome}>
        <LogoMark className={s.welcomeLogo} label="ZephiraEvents" />
        <div>
          <p className={s.welcomeGreeting}>Bun venit,</p>
          <p className={s.welcomeName}>ZephiraEvents</p>
        </div>
      </div>

      <div className={s.grid}>
        {CARDS.map(({ title, href, icon, primary, label, secondary }) => (
          <Link key={href} href={href} className={s.cardLink}>
            <div className={s.card}>
              <div className={s.cardTitleRow}>
                <div className={s.cardIcon}>{icon}</div>
                <p className={s.cardTitle}>{title}</p>
              </div>
              <p className={s.statNumber}>{primary(stats)}</p>
              <p className={s.statLabel}>{label}</p>
              {secondary && (
                <p className={s.statSecondary}>{secondary(stats)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

AdminDashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
const ZERO_STATS: Stats = {
  messages: { total: 0, unread: 0 },
  reviews: { total: 0, pending: 0 },
  menus: { active: 0 },
  posts: { active: 0 },
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  try {
    // Nivel 1: listFiles în paralel
    const [msgEntries, revEntries] = await Promise.all([
      listFiles("data/messages"),
      listFiles("data/reviews"),
    ]);

    const msgFiles = msgEntries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );
    const revFiles = revEntries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    // Nivel 2: getFile în paralel per secțiune
    const [allMessages, allReviews] = await Promise.all([
      Promise.all(msgFiles.map(async (e) => {
        const { content } = await getFile(e.path);
        return JSON.parse(content) as MessageJson;
      })),
      Promise.all(revFiles.map(async (e) => {
        const { content } = await getFile(e.path);
        return JSON.parse(content) as ReviewJson;
      })),
    ]);

    // fs — zero GitHub API calls
    const allMenus = getAllMenusAdmin();
    const allPosts = getAllPostsAdmin();

    const stats: Stats = {
      messages: {
        total: allMessages.filter((m) => !m.deleted).length,
        unread: allMessages.filter((m) => !m.deleted && !m.read).length,
      },
      reviews: {
        total: allReviews.filter((r) => !r.deleted).length,
        pending: allReviews.filter((r) => !r.deleted && r.status === "pending").length,
      },
      menus: {
        active: allMenus.filter((m) => !m.deleted).length,
      },
      posts: {
        active: allPosts.filter((p) => !p.deleted).length,
      },
    };

    return { props: { stats } };
  } catch (err) {
    console.error("[admin/dashboard] fetch error:", err);
    return { props: { stats: ZERO_STATS } };
  }
};
