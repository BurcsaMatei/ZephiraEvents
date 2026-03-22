// pages/admin/inbox/index.tsx
// Lista mesaje admin — contact + oferte, ordonate desc, badge necitite.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

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

const TYPE_LABEL: Record<MessageType, string> = { contact: "Contact", offer: "Ofertă" };
const STATUS_LABEL: Record<MessageStatus, string> = {
  new: "Nou",
  read: "Citit",
  replied: "Răspuns",
  archived: "Arhivat",
};

function typeBadgeClass(t: MessageType) {
  return t === "offer" ? s.typeBadgeOffer : s.typeBadgeContact;
}

function statusBadgeClass(st: MessageStatus) {
  const map: Record<MessageStatus, string> = {
    new: s.statusBadgeNew,
    read: s.statusBadgeRead,
    replied: s.statusBadgeReplied,
    archived: s.statusBadgeArchived,
  };
  return map[st];
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminInboxPage({
  messages,
  unreadCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <h1 className={s.pageTitle}>
        Inbox{messages.length > 0 ? ` (${messages.length})` : ""}
      </h1>

      {messages.length === 0 ? (
        <p className={s.empty}>Nu există mesaje.</p>
      ) : (
        <div className={s.list}>
          {messages.map((msg) => {
            const isNew = msg.status === "new";
            const preview = msg.message ?? msg.event_type ?? "—";
            return (
              <Link
                key={msg.id}
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
    .order("created_at", { ascending: false })) as {
    data: MessageRow[] | null;
    error: unknown;
  };

  const messages = data ?? [];
  const unreadCount = messages.filter((m) => m.status === "new").length;

  return { props: { messages, unreadCount } };
};
