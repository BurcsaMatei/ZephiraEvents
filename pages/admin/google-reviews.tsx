// pages/admin/google-reviews.tsx
// Admin — recenzii Google (GBP): listă + formular adăugare + ștergere.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { ReactElement } from "react";
import { useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../lib/admin/auth";
import { getGoogleReviewsFromGit } from "../../lib/googleReviews";
import * as lay from "../../styles/admin/layout.css";
import * as m from "../../styles/admin/menus.css";
import * as s from "../../styles/admin/reviews.css";
import type { GoogleReview } from "../../types/googleReview";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  reviews: GoogleReview[];
};

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function formatDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

type ApiResp = { ok: boolean; data?: GoogleReview; error?: string };

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminGoogleReviewsPage({
  reviews: initialReviews,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [reviews, setReviews] = useState<GoogleReview[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState("5");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/google-reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          rating: Number(rating),
          text: text.trim(),
          date,
          reviewUrl: reviewUrl.trim(),
        }),
      });
      const data = (await res.json()) as ApiResp;
      if (!data.ok || !data.data) {
        setError(data.error ?? "Eroare la salvare.");
        return;
      }
      setReviews((prev) =>
        [data.data as GoogleReview, ...prev].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
      setAuthorName("");
      setRating("5");
      setDate("");
      setText("");
      setReviewUrl("");
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Ștergi definitiv această recenzie Google?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/google-reviews/${id}/delete`, { method: "DELETE" });
      const data = (await res.json()) as ApiResp;
      if (data.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <h1 className={s.pageTitle}>Google Reviews</h1>

      {error && <div className={m.errorMsg}>{error}</div>}

      {/* ── Formular adăugare ── */}
      <form onSubmit={(e) => void handleCreate(e)}>
        <div className={m.formCard}>
          <div className={m.formSection}>
            <p className={m.formSectionTitle}>Adaugă recenzie Google</p>

            <div className={m.fieldRow}>
              <div className={m.field}>
                <label htmlFor="gr-author" className={m.label}>
                  Nume autor *
                </label>
                <input
                  id="gr-author"
                  className={m.input}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="ex: Maria Popescu"
                  required
                />
              </div>
              <div className={m.field}>
                <label htmlFor="gr-rating" className={m.label}>
                  Rating *
                </label>
                <select
                  id="gr-rating"
                  className={m.select}
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  {["5", "4", "3", "2", "1"].map((r) => (
                    <option key={r} value={r}>
                      {r} ★
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={m.fieldRow}>
              <div className={m.field}>
                <label htmlFor="gr-date" className={m.label}>
                  Data recenziei *
                </label>
                <input
                  id="gr-date"
                  className={m.input}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className={m.field}>
                <label htmlFor="gr-url" className={m.label}>
                  Link recenzie Google (opțional)
                </label>
                <input
                  id="gr-url"
                  className={m.input}
                  value={reviewUrl}
                  onChange={(e) => setReviewUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>

            <div className={m.field}>
              <label htmlFor="gr-text" className={m.label}>
                Text recenzie *
              </label>
              <textarea
                id="gr-text"
                className={m.textarea}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Textul recenziei, exact ca pe Google..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className={m.actions}>
            <button type="submit" className={m.submitBtn} disabled={saving}>
              {saving ? "Se salvează..." : "Adaugă recenzia"}
            </button>
          </div>
        </div>
      </form>

      {/* ── Lista recenzii ── */}
      {reviews.length === 0 ? (
        <p className={s.empty}>Nu există recenzii Google adăugate.</p>
      ) : (
        <div className={s.list}>
          {reviews.map((review) => {
            const isLoading = loadingId === review.id;
            return (
              <div key={review.id} className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.reviewerName}>{review.authorName}</span>
                  <span className={s.rating}>{stars(review.rating)}</span>
                  <span className={s.reviewDate}>{formatDate(review.date)}</span>
                </div>

                <p className={s.reviewText}>{review.text}</p>

                <div className={s.actions}>
                  {review.reviewUrl && (
                    <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer">
                      Vezi pe Google →
                    </a>
                  )}
                  <button
                    type="button"
                    className={lay.deleteBtn}
                    disabled={isLoading}
                    onClick={() => void handleDelete(review.id)}
                    title="Șterge recenzie"
                  >
                    {isLoading ? "..." : "Șterge"}
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

AdminGoogleReviewsPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminGoogleReviewsPage;

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  try {
    const { items } = await getGoogleReviewsFromGit();
    return { props: { reviews: items } };
  } catch (err) {
    console.error("[admin/google-reviews] GitHub fetch error:", err);
    return { props: { reviews: [] } };
  }
};
