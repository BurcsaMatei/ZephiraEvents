// pages/admin/inbox/[id].tsx
// Detaliu mesaj din data/messages/ + buton mailto: pentru răspuns.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { getFile, listFiles, updateFile } from "../../../lib/admin/github";
import { sanitizeHtml } from "../../../lib/admin/sanitize";
import * as s from "../../../styles/admin/message.css";
import type { MessageJson } from "../../api/admin/messages/index";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
interface OfferExtra {
  address?: string;
  whatsapp?: boolean;
  details?: string;
  eventType?: string;
  eventDate?: string;
  guests?: number;
  lodging?: { kind?: string; rooms?: string; nights?: string; notes?: string };
  music?: { kind?: string; prefs?: string; genre?: string; interval?: string };
  photoVideo?: { kind?: string; package?: string; duration?: string; deliverables?: string };
}

type FullMessage = MessageJson & OfferExtra;

type Props = { message: FullMessage };

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeBadgeClass(t: MessageJson["type"]): string {
  return t === "offer" ? s.typeBadgeOffer : s.typeBadgeContact;
}

const TYPE_LABEL: Record<MessageJson["type"], string> = {
  contact: "Contact",
  offer: "Ofertă",
};

function buildMailto(msg: FullMessage): string {
  const subject =
    msg.type === "offer"
      ? encodeURIComponent(`Re: Ofertă ${msg.eventType ?? ""} — ${msg.name}`)
      : encodeURIComponent(`Re: Mesaj contact — ${msg.name}`);
  return `mailto:${msg.email}?subject=${subject}`;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminMessagePage({
  message,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const mailtoHref = buildMailto(message);

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
          <span className={message.read ? s.statusBadgeRead : s.statusBadgeNew}>
            {message.read ? "Citit" : "Nou"}
          </span>
          <span style={{ fontSize: "12px", color: "#aaa" }}>{fmt(message.createdAt)}</span>
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
              {message.eventType && (
                <>
                  <span className={s.detailLabel}>Tip eveniment</span>
                  <span className={s.detailValue}>{message.eventType}</span>
                </>
              )}
              {message.eventDate && (
                <>
                  <span className={s.detailLabel}>Dată eveniment</span>
                  <span className={s.detailValue}>{message.eventDate}</span>
                </>
              )}
              {message.guests != null && (
                <>
                  <span className={s.detailLabel}>Participanți</span>
                  <span className={s.detailValue}>{message.guests}</span>
                </>
              )}
              {message.address && (
                <>
                  <span className={s.detailLabel}>Adresă</span>
                  <span className={s.detailValue}>{message.address}</span>
                </>
              )}
              {message.lodging?.kind && (
                <>
                  <span className={s.detailLabel}>Cazare</span>
                  <span className={s.detailValue}>
                    {message.lodging.kind}
                    {message.lodging.rooms ? `, ${message.lodging.rooms} camere` : ""}
                    {message.lodging.nights ? `, ${message.lodging.nights} nopți` : ""}
                  </span>
                </>
              )}
              {message.music?.kind && (
                <>
                  <span className={s.detailLabel}>Muzică</span>
                  <span className={s.detailValue}>
                    {message.music.kind}
                    {message.music.genre ? ` — ${message.music.genre}` : ""}
                  </span>
                </>
              )}
              {message.photoVideo?.kind && (
                <>
                  <span className={s.detailLabel}>Foto/Video</span>
                  <span className={s.detailValue}>{message.photoVideo.kind}</span>
                </>
              )}
              {message.details && (
                <>
                  <span className={s.detailLabel}>Detalii</span>
                  <span
                    className={s.detailValue}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.details) }}
                  />
                </>
              )}
            </>
          )}
        </div>

        {message.message && (
          <div style={{ marginTop: "16px" }}>
            <div className={s.sectionTitle}>Mesaj</div>
            <p
              className={s.messageBody}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.message) }}
            />
          </div>
        )}
      </div>

      {/* Reply via mailto */}
      <div className={s.card}>
        <div className={s.sectionTitle} style={{ marginBottom: "16px" }}>
          Răspunde
        </div>
        <a href={mailtoHref} className={s.submitBtn} style={{ display: "inline-block" }}>
          Deschide client email →
        </a>
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

  try {
    const entries = await listFiles("data/messages");
    const entry = entries.find((e) => e.name === `${id}.json`);
    if (!entry) return { notFound: true };

    const { content, sha } = await getFile(entry.path);
    const message = JSON.parse(content) as FullMessage;

    if (!message.read) {
      const updated = { ...message, read: true };
      await updateFile(entry.path, JSON.stringify(updated, null, 2), sha);
      return { props: { message: updated } };
    }

    return { props: { message } };
  } catch (err) {
    console.error("[admin/inbox/[id]] SSR error:", err);
    return { notFound: true };
  }
};
