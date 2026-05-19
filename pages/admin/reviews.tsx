// pages/admin/reviews.tsx
// Lista recenzii — filtru pending/approved/rejected, butoane Aprobă/Respinge via GitHub API.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import { useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../lib/admin/auth";
import { getFile, listFiles } from "../../lib/admin/github";
import { sanitizeHtml } from "../../lib/admin/sanitize";
import * as s from "../../styles/admin/reviews.css";
import type { ReviewJson, ReviewStatus } from "../api/admin/reviews/index";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  reviews: ReviewJson[];
  activeStatus: ReviewStatus | "all";
};

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

const STATUS_TABS: Array<{ value: ReviewStatus | "all"; label: string }> = [
  { value: "all", label: "Toate" },
  { value: "pending", label: "În așteptare" },
  { value: "approved", label: "Aprobate" },
  { value: "rejected", label: "Respinse" },
];

function statusClass(status: ReviewStatus) {
  const map: Record<ReviewStatus, string> = {
    pending: s.statusPending,
    approved: s.statusApproved,
    rejected: s.statusRejected,
  };
  return map[status];
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminReviewsPage({
  reviews: initialReviews,
  activeStatus,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [reviews, setReviews] = useState<ReviewJson[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject" | "delete") {
    if (action === "delete" && !confirm("Ștergi definitiv această recenzie?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { ok: boolean; data?: ReviewJson };
      if (data.ok) {
        if (action === "delete") {
          setReviews((prev) => prev.filter((r) => r.id !== id));
        } else if (data.data) {
          setReviews((prev) => prev.map((r) => (r.id === id ? (data.data as ReviewJson) : r)));
        }
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <h1 className={s.pageTitle}>Recenzii</h1>

      {/* Filter tabs */}
      <div className={s.tabs}>
        {STATUS_TABS.map(({ value, label }) => {
          const href = value === "all" ? "/admin/reviews" : `/admin/reviews?status=${value}`;
          const isActive = activeStatus === value;
          return (
            <Link key={value} href={href} className={`${s.tab}${isActive ? ` ${s.tabActive}` : ""}`}>
              {label}
            </Link>
          );
        })}
      </div>

      {reviews.length === 0 ? (
        <p className={s.empty}>Nu există recenzii în această categorie.</p>
      ) : (
        <div className={s.list}>
          {reviews.map((review) => {
            const isPending = review.status === "pending";
            const isLoading = loadingId === review.id;
            return (
              <div key={review.id} className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.reviewerName}>{review.name}</span>
                  <span className={s.rating}>{stars(review.rating)}</span>
                  <span className={s.reviewDate}>{formatDate(review.createdAt)}</span>
                </div>

                <p
                  className={s.reviewText}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(review.text) }}
                />

                <div className={s.actions}>
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        className={s.approveBtn}
                        disabled={isLoading}
                        onClick={() => void handleAction(review.id, "approve")}
                      >
                        {isLoading ? "..." : "Aprobă"}
                      </button>
                      <button
                        type="button"
                        className={s.rejectBtn}
                        disabled={isLoading}
                        onClick={() => void handleAction(review.id, "reject")}
                      >
                        {isLoading ? "..." : "Respinge"}
                      </button>
                    </>
                  ) : (
                    <span className={statusClass(review.status)}>
                      {review.status === "approved" ? "Aprobat" : "Respins"}
                    </span>
                  )}
                  <button
                    type="button"
                    className={s.rejectBtn}
                    disabled={isLoading}
                    onClick={() => void handleAction(review.id, "delete")}
                    title="Șterge recenzie"
                  >
                    {isLoading ? "..." : "🗑 Șterge"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

AdminReviewsPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminReviewsPage;

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, query }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const statusParam = typeof query["status"] === "string" ? query["status"] : "all";
  const activeStatus: ReviewStatus | "all" = VALID_STATUSES.includes(statusParam as ReviewStatus)
    ? (statusParam as ReviewStatus)
    : "all";

  try {
    const entries = await listFiles("data/reviews");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    const all = await Promise.all(
      jsonFiles.map(async (entry) => {
        const { content } = await getFile(entry.path);
        return JSON.parse(content) as ReviewJson;
      }),
    );

    const reviews = (activeStatus === "all" ? all : all.filter((r) => r.status === activeStatus))
      .filter((r) => !r.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { props: { reviews, activeStatus } };
  } catch (err) {
    console.error("[admin/reviews] GitHub fetch error:", err);
    return { props: { reviews: [], activeStatus } };
  }
};
