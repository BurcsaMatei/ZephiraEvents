// pages/admin/sent/[id].tsx
// Detaliu mesaj trimis — composed_emails (kind=new) sau admin_replies (kind=reply).

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { sanitizeHtml } from "../../../lib/admin/sanitize";
import { supabaseAdmin } from "../../../lib/admin/supabase";
import type {
  AdminReplyRow,
  ComposedEmailRow,
  MessageRow,
} from "../../../lib/admin/supabase.types";
import * as s from "../../../styles/admin/sent.css";
import type { SentItem, SentKind } from "../../../types/admin";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type ParentMessage = { id: string; name: string; email: string };

type Props = {
  item: SentItem;
  parentMessage: ParentMessage | null;
  unreadCount: number;
};

type QuerySingle<T> = { data: T | null; error: { message: string } | null };

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function fmt(iso: string): string {
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
  return kind === "reply" ? "Reply" : "Email nou";
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminSentDetailPage({
  item,
  parentMessage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const recipient = item.to_name
    ? `${item.to_name} <${item.to_email}>`
    : item.to_email;

  return (
    <>
      <Link href="/admin/sent" className={s.backLink}>
        ← Înapoi la Trimise
      </Link>

      {/* Header */}
      <div className={s.detailHeader}>
        <h1 className={s.detailTitle}>{recipient}</h1>
        <div className={s.detailBadges}>
          <span className={kindBadgeClass(item.kind)}>{kindLabel(item.kind)}</span>
          <span className={s.detailDate}>{fmt(item.sent_at)}</span>
        </div>
      </div>

      {/* Metadata */}
      <div className={s.card}>
        <div className={s.detailGrid}>
          <span className={s.detailLabel}>Destinatar</span>
          <span className={s.detailValue}>{item.to_email}</span>

          <span className={s.detailLabel}>Subiect</span>
          <span className={s.detailValue}>{item.subject}</span>

          {parentMessage && (
            <>
              <span className={s.detailLabel}>Răspuns la</span>
              <Link
                href={`/admin/inbox/${parentMessage.id}`}
                className={s.parentRef}
              >
                Mesaj de la {parentMessage.name} ({parentMessage.email}) →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={s.card}>
        <div className={s.sectionTitle}>Conținut</div>
        <p
          className={s.messageBody}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }}
        />
      </div>
    </>
  );
}

AdminSentDetailPage.getLayout = function getLayout(page: ReactElement) {
  const { unreadCount } = page.props as Props;
  return <AdminLayout unreadCount={unreadCount}>{page}</AdminLayout>;
};

export default AdminSentDetailPage;

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  params,
  query,
}) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const id = typeof params?.["id"] === "string" ? params["id"] : "";
  if (!id) return { notFound: true };

  const kind: SentKind = query["kind"] === "reply" ? "reply" : "new";

  const { count: unreadCount } = (await supabaseAdmin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "new")) as { count: number | null };

  // ── kind = "new" → composed_emails ───────────────────────
  if (kind === "new") {
    const { data, error } = (await supabaseAdmin
      .from("composed_emails")
      .select("id, to_email, to_name, subject, body, sent_at")
      .eq("id", id)
      .is("deleted_at", null)
      .single()) as QuerySingle<
      Pick<ComposedEmailRow, "id" | "to_email" | "to_name" | "subject" | "body" | "sent_at">
    >;

    if (error || !data || !data.sent_at) return { notFound: true };

    const item: SentItem = {
      id: data.id,
      kind: "new",
      to_email: data.to_email,
      to_name: data.to_name ?? null,
      subject: data.subject,
      body: data.body,
      sent_at: data.sent_at,
    };

    return { props: { item, parentMessage: null, unreadCount: unreadCount ?? 0 } };
  }

  // ── kind = "reply" → admin_replies + parent message ──────
  const { data: reply, error: replyError } = (await supabaseAdmin
    .from("admin_replies")
    .select("id, message_id, body, sent_at")
    .eq("id", id)
    .single()) as QuerySingle<
    Pick<AdminReplyRow, "id" | "message_id" | "body" | "sent_at">
  >;

  if (replyError || !reply || !reply.sent_at) return { notFound: true };

  const { data: parentMsg } = (await supabaseAdmin
    .from("messages")
    .select("id, name, email, metadata")
    .eq("id", reply.message_id)
    .single()) as QuerySingle<Pick<MessageRow, "id" | "name" | "email" | "metadata">>;

  const meta = parentMsg?.metadata as Record<string, unknown> | null;
  const subject =
    typeof meta?.["subject"] === "string"
      ? `Re: ${meta["subject"]}`
      : `Re: mesaj de la ${parentMsg?.name ?? reply.message_id}`;

  const item: SentItem = {
    id: reply.id,
    kind: "reply",
    to_email: parentMsg?.email ?? "",
    to_name: parentMsg?.name ?? null,
    subject,
    body: reply.body,
    sent_at: reply.sent_at,
  };

  const parentMessage: ParentMessage | null = parentMsg
    ? { id: parentMsg.id, name: parentMsg.name, email: parentMsg.email }
    : null;

  return {
    props: { item, parentMessage, unreadCount: unreadCount ?? 0 },
  };
};
