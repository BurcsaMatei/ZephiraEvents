// components/sections/GoogleReviews.tsx
// Recenzii Google (GBP) — Home: bandă marquee; /reviews: grid static.
// Client-safe: datele vin exclusiv prin props (getStaticProps).

import { SOCIAL_URLS } from "../../lib/config";
import * as s from "../../styles/sections/googleReviews.css";
import type { GoogleReview, GoogleReviewsStats } from "../../types/googleReview";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  items: GoogleReview[];
  stats: GoogleReviewsStats;
  mode: "home" | "page";
  fullBleed?: boolean;
};

// ──────────────────────────────────────────────────────────
// Badge Google (logo oficial "G" — culori brand, excepție documentată)
// ──────────────────────────────────────────────────────────
function GoogleBadge() {
  return (
    <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className={s.stars} aria-label={`${rating} din 5 stele`}>
      {"★★★★★".slice(0, rating)}
    </span>
  );
}

function formatDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initialOf(name: string): string {
  return (name.trim().charAt(0) || "•").toUpperCase();
}

// ──────────────────────────────────────────────────────────
// Card
// ──────────────────────────────────────────────────────────
function ReviewCard({ it, clamp }: { it: GoogleReview; clamp: boolean }) {
  return (
    <article className={clamp ? s.cardHome : s.cardPage}>
      <span className={s.avatar} aria-hidden="true">
        {initialOf(it.authorName)}
      </span>
      <div className={s.meta}>
        <strong>{it.authorName}</strong>
        <span>{formatDate(it.date)}</span>
      </div>
      <Stars rating={it.rating} />
      <p className={clamp ? s.textClamp : s.textAuto}>{it.text}</p>
      {!clamp && it.reviewUrl && (
        <a className={s.cardLink} href={it.reviewUrl} target="_blank" rel="noopener noreferrer">
          Vezi recenzia pe Google →
        </a>
      )}
    </article>
  );
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function GoogleReviews({ items, stats, mode, fullBleed = false }: Props) {
  const isHome = mode === "home";

  // Pe Home nu afișăm secțiunea fără recenzii
  if (isHome && items.length === 0) return null;

  // Marquee: pista = 2 jumătăți identice; fiecare jumătate repetă items suficient pentru loop
  const repeat = Math.max(1, Math.ceil(6 / Math.max(items.length, 1)));
  const half = Array.from({ length: repeat }, () => items).flat();

  return (
    <section
      className={`${s.section}${fullBleed ? ` ${s.fullBleed}` : ""}`}
      aria-label="Recenzii Google"
    >
      <header className={s.header}>
        <div className={s.badgeRow}>
          <GoogleBadge />
          <h2 className={s.title}>Recenzii Google</h2>
        </div>
        {stats.ratingCount > 0 && (
          <p className={s.statsRow}>
            <span className={s.statsStars} aria-hidden="true">
              ★
            </span>
            {stats.ratingValue} din 5 · {stats.ratingCount}{" "}
            {stats.ratingCount === 1 ? "recenzie" : "recenzii"} pe Google
          </p>
        )}
      </header>

      {isHome ? (
        <div className={s.band}>
          <div className={s.track}>
            {half.map((it, i) => (
              <ReviewCard key={`a-${it.id}-${i}`} it={it} clamp />
            ))}
            {half.map((it, i) => (
              <div key={`b-${it.id}-${i}`} aria-hidden="true">
                <ReviewCard it={it} clamp />
              </div>
            ))}
          </div>
        </div>
      ) : items.length > 0 ? (
        <div className={s.grid}>
          {items.map((it) => (
            <ReviewCard key={it.id} it={it} clamp={false} />
          ))}
        </div>
      ) : (
        <p className={s.emptyNote}>Recenziile Google vor apărea aici în curând.</p>
      )}

      <div className={s.ctaRow}>
        <a
          className={s.ctaLink}
          href={SOCIAL_URLS.googleMaps}
          target="_blank"
          rel="noopener noreferrer"
        >
          Vezi pe Google →
        </a>
      </div>
    </section>
  );
}
