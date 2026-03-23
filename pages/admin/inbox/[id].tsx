// pages/admin/inbox/[id].tsx
// Detaliu mesaj + istoricul reply-urilor + formular reply.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import { useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { sanitizeHtml } from "../../../lib/admin/sanitize";
import { supabaseAdmin } from "../../../lib/admin/supabase";
import type {
  AdminReplyRow,
  MessageRow,
  MessageStatus,
  MessageType,
} from "../../../lib/admin/supabase.types";
import * as s from "../../../styles/admin/message.css";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type MessageWithReplies = MessageRow & { replies: AdminReplyRow[] };
type Props = { message: MessageWithReplies };

type QuerySingle<T> = { data: T | null; error: { message: string } | null };
type QueryList<T> = { data: T[] | null; error: { message: string } | null };

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function fmt(iso: string | null): string {
  if (!iso) return "—";
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
  replied: "Răspuns trimis",
  archived: "Arhivat",
};

function typeBadgeClass(t: MessageType): string {
  if (t === "offer") return s.typeBadgeOffer;
  if (t === "email_inbound") return s.typeBadgeEmail;
  return s.typeBadgeContact;
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
function AdminMessagePage({
  message,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const defaultSubject =
    message.type === "offer"
      ? `Re: Ofertă ${message.event_type ?? ""} — ${message.name}`
      : `Re: Mesaj contact — ${message.name}`;

  const [subject, setSubject] = useState(defaultSubject);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [replies, setReplies] = useState<AdminReplyRow[]>(message.replies);

  async function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, subject, replyBody }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; dbWarning?: boolean };

      if (data.ok) {
        setSuccess(
          data.dbWarning
            ? "Răspuns trimis. Atenție: nu s-a putut salva în Trimise."
            : "Răspuns trimis cu succes.",
        );
        setReplyBody("");
        setReplies((prev) => [
          ...prev,
          {
            id: `tmp-${Date.now()}`,
            created_at: new Date().toISOString(),
            message_id: message.id,
            body: replyBody,
            sent_at: new Date().toISOString(),
            sent_by: "admin",
          },
        ]);
      } else {
        setError(data.message ?? "Eroare la trimitere.");
      }
    } catch {
      setError("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Link href="/admin/inbox" className={s.backLink}>
        ← Inbox
      </Link>

      {/* Header */}
      <div className={s.header}>
        <h1 className={s.senderName}>{message.name}</h1>
        <div className={s.headerBadges}>
          <span className={typeBadgeClass(message.type)}>{TYPE_LABEL[message.type]}</span>
          <span className={statusBadgeClass(message.status)}>{STATUS_LABEL[message.status]}</span>
          <span style={{ fontSize: "12px", color: "#aaa" }}>{fmt(message.created_at)}</span>
        </div>
      </div>

      {/* Contact details */}
      <div className={s.card}>
        <div className={s.detailGrid}>
          <span className={s.detailLabel}>Email</span>
          <span className={s.detailValue}>{message.email}</span>

          {message.phone && (
            <>
              <span className={s.detailLabel}>Telefon</span>
              <span className={s.detailValue}>{message.phone}</span>
            </>
          )}

          {message.type === "offer" && (
            <>
              {message.event_type && (
                <>
                  <span className={s.detailLabel}>Tip eveniment</span>
                  <span className={s.detailValue}>{message.event_type}</span>
                </>
              )}
              {message.event_date && (
                <>
                  <span className={s.detailLabel}>Dată eveniment</span>
                  <span className={s.detailValue}>{message.event_date}</span>
                </>
              )}
              {message.guests !== null && (
                <>
                  <span className={s.detailLabel}>Participanți</span>
                  <span className={s.detailValue}>{message.guests}</span>
                </>
              )}
              {message.lodging && (
                <>
                  <span className={s.detailLabel}>Cazare</span>
                  <span className={s.detailValue}>
                    {message.lodging}
                    {message.rooms ? `, ${message.rooms} camere` : ""}
                    {message.nights ? `, ${message.nights} nopți` : ""}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {message.message && (
          <div style={{ marginTop: "16px" }}>
            <div className={s.sectionTitle}>Mesaj</div>
            {/* sanitizeHtml: strip tags + escape entități — safe cu dangerouslySetInnerHTML */}
            <p
              className={s.messageBody}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.message) }}
            />
          </div>
        )}
      </div>

      {/* Replies history */}
      {replies.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div className={s.sectionTitle}>Răspunsuri trimise ({replies.length})</div>
          {replies.map((r) => (
            <div key={r.id} className={s.replyCard}>
              <div className={s.replyMeta}>{fmt(r.sent_at)} · {r.sent_by ?? "admin"}</div>
              <div
                className={s.replyText}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(r.body) }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      <div className={s.card}>
        <div className={s.sectionTitle} style={{ marginBottom: "16px" }}>
          Trimite răspuns
        </div>

        {success && <div className={s.successMsg}>{success}</div>}
        {error && <div className={s.errorMsg}>{error}</div>}

        <form onSubmit={handleReply} noValidate>
          <div className={s.formField}>
            <label htmlFor="reply-subject" className={s.formLabel}>
              Subiect
            </label>
            <input
              id="reply-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={s.formInput}
              required
              disabled={loading}
            />
          </div>

          <div className={s.formField}>
            <label htmlFor="reply-body" className={s.formLabel}>
              Mesaj
            </label>
            <textarea
              id="reply-body"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className={s.formTextarea}
              required
              disabled={loading}
              placeholder="Scrie răspunsul tău..."
            />
          </div>

          <button type="submit" className={s.submitBtn} disabled={loading || !replyBody.trim()}>
            {loading ? "Se trimite..." : "Trimite răspuns"}
          </button>
        </form>
      </div>
    </>
  );
}

AdminMessagePage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminMessagePage;

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async ({ req, params }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const id = typeof params?.["id"] === "string" ? params["id"] : "";
  if (!id) return { notFound: true };

  const [msgRes, repliesRes] = (await Promise.all([
    supabaseAdmin.from("messages").select("*").eq("id", id).single(),
    supabaseAdmin
      .from("admin_replies")
      .select("*")
      .eq("message_id", id)
      .order("created_at", { ascending: true }),
  ])) as [QuerySingle<MessageRow>, QueryList<AdminReplyRow>];

  if (msgRes.error || !msgRes.data) return { notFound: true };

  // Auto-mark as read
  if (msgRes.data.status === "new") {
    await supabaseAdmin.from("messages").update({ status: "read" }).eq("id", id);
  }

  return {
    props: {
      message: { ...msgRes.data, replies: repliesRes.data ?? [] },
    },
  };
};
