// pages/admin/google-reviews.tsx
// Recenzii Google — listă + formular adăugare + ștergere, persistate în data/google-reviews.json.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { ReactElement } from "react";
import { useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../lib/admin/auth";
import { sanitizeHtml } from "../../lib/admin/sanitize";
import type { GoogleRating, GoogleReview } from "../../lib/googleReviews";
import { getGoogleReviewsFromGit } from "../../lib/googleReviews";
import * as lay from "../../styles/admin/layout.css";
import * as m from "../../styles/admin/menus.css";
import * as s from "../../styles/admin/reviews.css";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  reviews: GoogleReview[];
};

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

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

const RATING_OPTIONS: GoogleRating[] = [5, 4, 3, 2, 1];

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
  const [rating, setRating] = useState<GoogleRating>(5);
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/google-reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          rating,
          text: text.trim(),
          date,
          ...(reviewUrl.trim() ? { reviewUrl: reviewUrl.trim() } : {}),
        }),
      });
      const data = (await res.json()) as ApiResponse<GoogleReview>;
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setReviews((prev) =>
        [data.data, ...prev].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
      );
      setAuthorName("");
      setRating(5);
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
      const data = (await res.json()) as ApiResponse<undefined>;
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

      {/* Formular adăugare */}
      <form className={m.formCard} onSubmit={(e) => void handleCreate(e)}>
        <div className={m.fieldRow}>
          <div className={m.field}>
            <label className={m.label} htmlFor="gr-author">
              Nume autor
            </label>
            <input
              id="gr-author"
              className={m.input}
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
          </div>
          <div className={m.field}>
            <label className={m.label} htmlFor="gr-rating">
              Rating
            </label>
            <select
              id="gr-rating"
              className={m.select}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value) as GoogleRating)}
            >
              {RATING_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} {stars(r)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={m.fieldRow}>
          <div className={m.field}>
            <label className={m.label} htmlFor="gr-date">
              Data recenziei
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
            <label className={m.label} htmlFor="gr-url">
              Link recenzie (opțional)
            </label>
            <input
              id="gr-url"
              className={m.input}
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
            />
          </div>
        </div>

        <div className={m.field}>
          <label className={m.label} htmlFor="gr-text">
            Text recenzie
          </label>
          <textarea
            id="gr-text"
            className={m.textarea}
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>

        {error && <p className={m.errorMsg}>{error}</p>}

        <div className={m.actions}>
          <button type="submit" className={m.submitBtn} disabled={saving}>
            {saving ? "Se salvează..." : "Adaugă recenzia"}
          </button>
        </div>
      </form>

      {/* Lista recenzii */}
      {reviews.length === 0 ? (
        <p className={s.empty}>Nu există recenzii Google. Adaugă prima recenzie cu formularul de mai sus.</p>
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

                <p
                  className={s.reviewText}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(review.text) }}
                />

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
    const reviews = await getGoogleReviewsFromGit();
    return { props: { reviews } };
  } catch (err) {
    console.error("[admin/google-reviews] GitHub fetch error:", err);
    return { props: { reviews: [] } };
  }
};
