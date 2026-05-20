// pages/admin/inbox/index.tsx
// Lista mesaje admin — contact + oferte din data/messages/, ordonate desc.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactElement, useCallback, useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { getFile, listFiles } from "../../../lib/admin/github";
import * as s from "../../../styles/admin/inbox.css";
import type { MessageJson } from "../../api/admin/messages/index";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  messages: MessageJson[];
  unreadCount: number;
};

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_LABEL: Record<MessageJson["type"], string> = {
  contact: "Contact",
  offer: "Ofertă",
};

function typeBadgeClass(t: MessageJson["type"]): string {
  return t === "offer" ? s.typeBadgeOffer : s.typeBadgeContact;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminInboxPage({
  messages,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm("Ștergi acest mesaj?")) return;
      setDeleting(id);
      setDeleteError(null);
      try {
        const res = await fetch(`/api/admin/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete" }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setDeleteError(data.error ?? "Eroare la ștergere.");
          return;
        }
        await router.replace(router.asPath);
      } catch {
        setDeleteError("Eroare de rețea la ștergere.");
      } finally {
        setDeleting(null);
      }
    },
    [router],
  );

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>
          Inbox{messages.length > 0 ? ` (${messages.length})` : ""}
        </h1>
      </div>
      {deleteError && <p className={s.syncStatusError}>{deleteError}</p>}

      {messages.length === 0 ? (
        <p className={s.empty}>Nu există mesaje.</p>
      ) : (
        <div className={s.list}>
          {messages.map((msg) => {
            const isNew = !msg.read;
            const preview = msg.message ?? msg.eventType ?? "—";
            return (
              <div key={msg.id} className={s.itemWrap}>
                <Link
                  href={`/admin/inbox/${msg.id}`}
                  className={`${s.item}${isNew ? ` ${s.itemUnread}` : ""}`}
                >
                  <div className={s.itemTop}>
                    <span className={`${s.itemName}${isNew ? ` ${s.itemNameUnread}` : ""}`}>
                      {msg.name}
                    </span>
                    <span className={typeBadgeClass(msg.type)}>{TYPE_LABEL[msg.type]}</span>
                    <span className={isNew ? s.statusBadgeNew : s.statusBadgeRead}>
                      {isNew ? "Nou" : "Citit"}
                    </span>
                    <span className={s.itemDate}>{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className={s.itemEmail}>{msg.email}</div>
                  <div className={s.itemPreview}>{preview.slice(0, 120)}</div>
                </Link>
                <button
                  type="button"
                  className={s.deleteBtn}
                  onClick={(e) => void handleDelete(e, msg.id)}
                  disabled={deleting === msg.id}
                  title="Șterge mesaj"
                  aria-label="Șterge mesaj"
                >
                  {deleting === msg.id ? "..." : "Șterge"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

AdminInboxPage.getLayout = function getLayout(page: ReactElement) {
  const { unreadCount } = page.props as Props;
  return <AdminLayout unreadCount={unreadCount}>{page}</AdminLayout>;
};

export default AdminInboxPage;

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  try {
    const entries = await listFiles("data/messages");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    const all = await Promise.all(
      jsonFiles.map(async (entry) => {
        const { content } = await getFile(entry.path);
        return JSON.parse(content) as MessageJson;
      }),
    );

    const messages = all
      .filter((m) => !m.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = messages.filter((m) => !m.read).length;

    return { props: { messages, unreadCount } };
  } catch (err) {
    console.error("[admin/inbox] GitHub fetch error:", err);
    return { props: { messages: [], unreadCount: 0 } };
  }
};
