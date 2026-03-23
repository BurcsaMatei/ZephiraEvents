// pages/admin/sent.tsx
// View mesaje trimise — composed_emails + admin_replies, ordonate sent_at DESC.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { type ReactElement, useCallback, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../lib/admin/auth";
import { supabaseAdmin } from "../../lib/admin/supabase";
import type {
  AdminReplyRow,
  ComposedEmailRow,
  MessageRow,
} from "../../lib/admin/supabase.types";
import * as s from "../../styles/admin/sent.css";
import type { SentItem, SentKind } from "../api/admin/sent";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  items: SentItem[];
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

function kindBadgeClass(kind: SentKind): string {
  return kind === "reply" ? s.badgeReply : s.badgeNew;
}

function kindLabel(kind: SentKind): string {
  return kind === "reply" ? "Reply" : "Nou";
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminSentPage({
  items,
  unreadCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, item: SentItem) => {
      e.preventDefault();
      if (item.kind !== "new") return;
      if (!confirm("Ștergi acest email?")) return;
      setDeleting(item.id);
      try {
        await fetch(`/api/admin/sent/${item.id}`, {
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

  return (
    <>
      <h1 className={s.pageTitle}>
        Trimise{items.length > 0 ? ` (${items.length})` : ""}
      </h1>

      {items.length === 0 ? (
        <p className={s.empty}>Nu există mesaje trimise.</p>
      ) : (
        <div className={s.list}>
          {items.map((item) => (
            <div key={`${item.kind}-${item.id}`} className={s.item}>
              <div className={s.itemBody}>
                <div className={s.itemTop}>
                  <span className={s.itemTo}>
                    {item.to_name ? `${item.to_name} <${item.to_email}>` : item.to_email}
                  </span>
                  <span className={kindBadgeClass(item.kind)}>{kindLabel(item.kind)}</span>
                  <span className={s.itemDate}>{formatDate(item.sent_at)}</span>
                </div>
                <div className={s.itemSubject}>{item.subject}</div>
                <div className={s.itemPreview}>{item.body.slice(0, 140)}</div>
              </div>
              {item.kind === "new" && (
                <button
                  type="button"
                  className={s.deleteBtn}
                  onClick={(e) => void handleDelete(e, item)}
                  disabled={deleting === item.id}
                  title="Șterge email"
                  aria-label="Șterge email"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

AdminSentPage.getLayout = function getLayout(page: ReactElement) {
  const { unreadCount } = page.props as Props;
  return <AdminLayout unreadCount={unreadCount}>{page}</AdminLayout>;
};

export default AdminSentPage;

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  // composed_emails
  const { data: emailRows } = (await supabaseAdmin
    .from("composed_emails")
    .select("*")
    .eq("status", "sent")
    .is("deleted_at", null)
    .order("sent_at", { ascending: false })
    .limit(200)) as { data: ComposedEmailRow[] | null };

  const fromEmails: SentItem[] = (emailRows ?? [])
    .filter((r) => r.sent_at !== null)
    .map((r) => ({
      id: r.id,
      kind: "new" as SentKind,
      to_email: r.to_email,
      to_name: r.to_name ?? null,
      subject: r.subject,
      body: r.body,
      sent_at: r.sent_at as string,
    }));

  // admin_replies + join
  const { data: replyRows } = (await supabaseAdmin
    .from("admin_replies")
    .select("*")
    .not("sent_at", "is", null)
    .order("sent_at", { ascending: false })
    .limit(200)) as { data: AdminReplyRow[] | null };

  const replies = replyRows ?? [];
  let fromReplies: SentItem[] = [];

  if (replies.length > 0) {
    const msgIds = [...new Set(replies.map((r) => r.message_id))];
    const { data: msgRows } = (await supabaseAdmin
      .from("messages")
      .select("id, email, name, metadata")
      .in("id", msgIds)) as {
      data: Pick<MessageRow, "id" | "email" | "name" | "metadata">[] | null;
    };

    const msgMap = new Map<string, Pick<MessageRow, "id" | "email" | "name" | "metadata">>();
    for (const m of msgRows ?? []) msgMap.set(m.id, m);

    fromReplies = replies.map((r) => {
      const msg = msgMap.get(r.message_id);
      const meta = msg?.metadata as Record<string, unknown> | null;
      const subject =
        typeof meta?.["subject"] === "string"
          ? `Re: ${meta["subject"]}`
          : `Re: mesaj de la ${msg?.name ?? r.message_id}`;
      return {
        id: r.id,
        kind: "reply" as SentKind,
        to_email: msg?.email ?? "",
        to_name: msg?.name ?? null,
        subject,
        body: r.body,
        sent_at: r.sent_at as string,
      };
    });
  }

  const items = [...fromEmails, ...fromReplies].sort(
    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
  );

  // unreadCount pentru badge inbox
  const { data: unreadData } = await supabaseAdmin
    .from("messages")
    .select("id")
    .eq("status", "new");
  const unreadCount = (unreadData ?? []).length;

  return { props: { items, unreadCount } };
};
