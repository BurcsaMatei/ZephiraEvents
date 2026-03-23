// pages/admin/inbox/index.tsx
// Lista mesaje admin — contact + oferte + email inbound, ordonate desc.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactElement, useCallback, useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { supabaseAdmin } from "../../../lib/admin/supabase";
import type { MessageRow, MessageStatus, MessageType } from "../../../lib/admin/supabase.types";
import * as s from "../../../styles/admin/inbox.css";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  messages: MessageRow[];
  unreadCount: number;
};

interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

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

const TYPE_LABEL: Record<MessageType, string> = {
  contact: "Contact",
  offer: "Ofertă",
  email_inbound: "Email",
};

const STATUS_LABEL: Record<MessageStatus, string> = {
  new: "Nou",
  read: "Citit",
  replied: "Răspuns",
  archived: "Arhivat",
};

function typeBadgeClass(t: MessageType): string {
  if (t === "offer") return s.typeBadgeOffer;
  if (t === "email_inbound") return s.typeBadgeEmail;
  return s.typeBadgeContact;
}

function statusBadgeClass(st: MessageStatus): string {
  const map: Record<MessageStatus, string> = {
    new: s.statusBadgeNew,
    read: s.statusBadgeRead,
    replied: s.statusBadgeReplied,
    archived: s.statusBadgeArchived,
  };
  return map[st];
}

function getSubject(msg: MessageRow): string | null {
  if (msg.type !== "email_inbound") return null;
  const meta = msg.metadata as Record<string, unknown> | null;
  const sub = meta?.["subject"];
  return typeof sub === "string" ? sub : null;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminInboxPage({
  messages,
  unreadCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm("Ștergi acest mesaj?")) return;
      setDeleting(id);
      try {
        await fetch(`/api/admin/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete" }),
        });
        await router.replace(router.asPath);
      } finally {
        setDeleting(null);
      }
    },
    [router],
  );

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const res = await fetch("/api/admin/imap-sync", { method: "POST" });
      const data = (await res.json()) as SyncResult & { error?: string };
      if (!res.ok) {
        setSyncError(data.error ?? "Eroare necunoscută");
      } else {
        setSyncResult(data);
        if (data.synced > 0) {
          await router.replace(router.asPath);
        }
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Eroare de rețea");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>
          Inbox{messages.length > 0 ? ` (${messages.length})` : ""}
        </h1>
        <div className={s.syncArea}>
          <button
            className={`${s.syncBtn}${syncing ? ` ${s.syncBtnLoading}` : ""}`}
            onClick={handleSync}
            disabled={syncing}
            type="button"
          >
            {syncing ? "Se sincronizează…" : "Sincronizează email"}
          </button>
          {syncResult && (
            <span className={s.syncStatus}>
              {syncResult.synced > 0
                ? `${syncResult.synced} mesaj${syncResult.synced !== 1 ? "e" : ""} nou${syncResult.synced !== 1 ? "ă" : ""}`
                : "Nimic nou"}
              {syncResult.skipped > 0 ? `, ${syncResult.skipped} deja existente` : ""}
              {syncResult.errors.length > 0 ? ` · ${syncResult.errors.length} erori` : ""}
            </span>
          )}
          {syncError && <span className={s.syncStatusError}>{syncError}</span>}
        </div>
      </div>

      {messages.length === 0 ? (
        <p className={s.empty}>Nu există mesaje.</p>
      ) : (
        <div className={s.list}>
          {messages.map((msg) => {
            const isNew = msg.status === "new";
            const subject = getSubject(msg);
            const preview = subject
              ? `${subject} — ${msg.message ?? ""}`
              : (msg.message ?? msg.event_type ?? "—");
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
                    <span className={statusBadgeClass(msg.status)}>{STATUS_LABEL[msg.status]}</span>
                    <span className={s.itemDate}>{formatDate(msg.created_at)}</span>
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
                  🗑
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

  const { data } = (await supabaseAdmin
    .from("messages")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })) as {
    data: MessageRow[] | null;
    error: unknown;
  };

  const messages = data ?? [];
  const unreadCount = messages.filter((m) => m.status === "new").length;

  return { props: { messages, unreadCount } };
};
