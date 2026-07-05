// components/sections/GoogleReviews.tsx
// ==============================
// Google Reviews Section (Home = marquee; /reviews = grid)
// Date din data/google-reviews.json — primite via props (SSG).
// ==============================
"use client";

import Link from "next/link";
import { useMemo } from "react";

import { SOCIAL_URLS } from "../../lib/config";
import type { GoogleReview, GoogleReviewsStats } from "../../lib/googleReviews";
import {
  avatarClass,
  badgeClass,
  bandClass,
  bandsWrapClass,
  cardAutoClass,
  cardFixedClass,
  cardHeaderClass,
  cardLinkClass,
  ctaRowClass,
  fullBleedClass,
  headerClass,
  listWrapClass,
  metaClass,
  sectionClass,
  starsClass,
  summaryRowClass,
  summaryValueClass,
  textAutoClass,
  textClampClass,
  titleClass,
  trackLeftClass,
  trackRightClass,
} from "../../styles/sections/googleReviews.css";

type Props = {
  items: GoogleReview[];
  stats: GoogleReviewsStats;
  mode: "home" | "page";
  fullBleed?: boolean;
};

// Logo Google „G" — culori brand oficiale (excepție legitimă de la tokens vars)
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4.01-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={starsClass} aria-label={`${rating} din 5 stele`}>
      {"★★★★★".slice(0, rating)}
    </span>
  );
}

function formatDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ReviewCard({ it, fixed }: { it: GoogleReview; fixed: boolean }) {
  return (
    <article className={fixed ? cardFixedClass : cardAutoClass}>
      <div className={cardHeaderClass}>
        <span className={avatarClass} aria-hidden="true">
          {it.authorName.charAt(0).toUpperCase()}
        </span>
        <div className={metaClass}>
          <strong>{it.authorName}</strong>
          <span>{formatDate(it.date)}</span>
        </div>
        <GoogleLogo />
      </div>
      <Stars rating={it.rating} />
      <p className={fixed ? textClampClass : textAutoClass}>{it.text}</p>
      <a
        href={it.reviewUrl ?? SOCIAL_URLS.googleMaps}
        target="_blank"
        rel="noopener noreferrer"
        className={cardLinkClass}
      >
        Vezi pe Google →
      </a>
    </article>
  );
}

export default function GoogleReviews({ items, stats, mode, fullBleed = false }: Props) {
  // Marquee seamless: conținutul se dublează exact x2 (translateX(-50%));
  // cu puține recenzii, repetăm baza până la minim 8 carduri per bandă.
  const { loopTop, loopBottom } = useMemo(() => {
    const top = items.filter((_, i) => i % 2 === 0);
    const bottom = items.filter((_, i) => i % 2 === 1);
    const fill = (list: GoogleReview[]): GoogleReview[] => {
      if (list.length === 0) return [];
      const base: GoogleReview[] = [];
      while (base.length < 8) base.push(...list);
      return [...base, ...base];
    };
    return { loopTop: fill(top), loopBottom: fill(bottom) };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section
      className={`${sectionClass} ${fullBleed ? fullBleedClass : ""}`}
      data-full-bleed={fullBleed ? "true" : undefined}
    >
      <header className={headerClass}>
        <h2 className={titleClass}>Recenzii Google</h2>
        <div className={summaryRowClass}>
          <span className={badgeClass}>
            <GoogleLogo size={16} />
            Google
          </span>
          <span className={summaryValueClass}>{stats.ratingValue.toFixed(1)}</span>
          <Stars rating={Math.round(stats.ratingValue)} />
          <span>
            {stats.ratingCount} {stats.ratingCount === 1 ? "recenzie" : "recenzii"}
          </span>
        </div>
      </header>

      {mode === "home" ? (
        <>
          <div className={bandsWrapClass}>
            {loopTop.length > 0 && (
              <div role="region" className={bandClass} aria-label="Recenzii Google — banda 1">
                <div className={trackLeftClass} aria-hidden="true">
                  {loopTop.map((it, idx) => (
                    <ReviewCard key={`${it.id}-t-${idx}`} it={it} fixed />
                  ))}
                </div>
              </div>
            )}

            {loopBottom.length > 0 && (
              <div role="region" className={bandClass} aria-label="Recenzii Google — banda 2">
                <div className={trackRightClass} aria-hidden="true">
                  {loopBottom.map((it, idx) => (
                    <ReviewCard key={`${it.id}-b-${idx}`} it={it} fixed />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={ctaRowClass}>
            <Link href="/reviews" aria-label="Vezi toate recenziile Google">
              Vezi toate recenziile →
            </Link>
          </div>
        </>
      ) : (
        <div className={listWrapClass}>
          {items.map((it) => (
            <ReviewCard key={it.id} it={it} fixed={false} />
          ))}
        </div>
      )}
    </section>
  );
}
