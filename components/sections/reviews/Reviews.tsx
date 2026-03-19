// components/sections/Reviews.tsx
// ==============================
// Reviews Section (Home + /reviews reuse)
// ==============================
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Review } from "../../../lib/reviews";
import {
  bandClass,
  bandsWrapClass,
  cardAffordanceBtn, // săgeată stânga-jos
  cardAutoClass,
  cardFixedClass,
  cardInteractiveBtn, // full-card toggle (page)
  cardOverlayLink, // click-through Home → /reviews
  cardPageCollapsedClass,
  cardPageExpandedClass,
  ctaRowClass,
  fullBleedClass,
  headerClass,
  listWrapClass,
  metaClass,
  sectionClass,
  starsClass,
  textAutoClass,
  textClampClass,
  titleClass,
  trackLeftClass,
  trackRightClass,
} from "../../../styles/sections/reviews/reviews.css";
import ReviewsForm from "./ReviewsForm";

type Props = {
  showForm?: boolean;
  limit?: number;
  fullBleed?: boolean;
  mode?: "home" | "page";
  heading?: string;
  formTitle?: string;
  formSubtitle?: string;
  /** SSR items pentru pagina /reviews — evită CLS */
  initialItems?: Review[];
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className={starsClass} aria-label={`${rating} din 5 stele`}>
      {"★★★★★".slice(0, rating)}
    </span>
  );
}

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReviewCard({
  it,
  fixed,
  pageMode = false,
}: {
  it: Review;
  fixed: boolean;
  pageMode?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentId = `rv-content-${it.id}`;

  const CardClass = fixed
    ? cardFixedClass
    : pageMode
      ? expanded
        ? `${cardAutoClass} ${cardPageExpandedClass}`
        : `${cardAutoClass} ${cardPageCollapsedClass}`
      : cardAutoClass;

  const TextClass = fixed ? textClampClass : pageMode && !expanded ? textClampClass : textAutoClass;

  return (
    <article
      className={CardClass}
      data-expanded={pageMode ? (expanded ? "true" : "false") : undefined}
    >
      {pageMode ? (
        <>
          {/* Full-card toggle pentru a păstra acțiunea existentă */}
          <button
            type="button"
            className={cardInteractiveBtn}
            aria-label={expanded ? "Restrânge recenzia" : "Extinde recenzia"}
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((v) => !v)}
          />
          {/* Affordance: săgeată stânga-jos */}
          <button
            type="button"
            className={cardAffordanceBtn}
            aria-label={expanded ? "Restrânge recenzia" : "Extinde recenzia"}
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((v) => !v)}
          />
        </>
      ) : (
        // Home: click pe card → /reviews (CTA generic)
        <Link
          href="/reviews"
          className={cardOverlayLink}
          aria-label="Deschide pagina cu toate recenziile"
        >
          <span />
        </Link>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={it.profilePhotoUrl || "/images/profiles/profile-01.jpg"}
        alt=""
        width={48}
        height={48}
        loading="lazy"
      />
      <div className={metaClass}>
        <strong>{it.authorName}</strong>
        <span>{formatDate(it.createdAt)}</span>
      </div>
      <Stars rating={it.rating} />
      <p className={TextClass} id={contentId}>
        {it.text}
      </p>
      {Array.isArray(it.photos) && it.photos.length > 0 && (
        <div className="photos">
          {it.photos.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt="Foto recenzie" loading="lazy" />
          ))}
        </div>
      )}
    </article>
  );
}

export default function Reviews({
  showForm = false,
  limit = 12,
  fullBleed = false,
  mode = "home",
  heading = "Recenzii",
  formTitle,
  formSubtitle,
  initialItems,
}: Props) {
  const items = useMemo(() => (initialItems ?? []).slice(0, limit), [initialItems, limit]);

  const topItems = useMemo(() => items.filter((_, i) => i % 2 === 0), [items]);
  const bottomItems = useMemo(() => items.filter((_, i) => i % 2 === 1), [items]);

  const loopTop = useMemo(() => [...topItems, ...topItems], [topItems]);
  const loopBottom = useMemo(() => [...bottomItems, ...bottomItems], [bottomItems]);

  return (
    <section
      className={`${sectionClass} ${fullBleed ? fullBleedClass : ""}`}
      data-full-bleed={fullBleed ? "true" : undefined}
    >
      <header className={headerClass}>
        <h2 className={titleClass}>{heading}</h2>
      </header>

      {showForm && (
        <>
          {mode === "page" && (formTitle || formSubtitle) ? (
            <div className="container" style={{ marginBottom: 12, textAlign: "center" }}>
              {formTitle ? <h3 style={{ marginBottom: 6 }}>{formTitle}</h3> : null}
              {formSubtitle ? (
                <p style={{ marginTop: 0, color: "var(--ve-color-muted, inherit)" }}>
                  {formSubtitle}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Centrare formular pe pagină */}
          <div className="container" style={{ maxWidth: 760, margin: "0 auto" }}>
            <ReviewsForm onCreated={() => {}} />
          </div>
        </>
      )}

      {mode === "home" ? (
        <>
          <div className={bandsWrapClass}>
            <div className={bandClass} aria-label="Recenzii — banda 1">
              <div className={trackLeftClass} aria-hidden="true">
                {loopTop.map((it, idx) => (
                  <ReviewCard key={`${it.id}-t-${idx}`} it={it} fixed />
                ))}
              </div>
            </div>

            <div className={bandClass} aria-label="Recenzii — banda 2">
              <div className={trackRightClass} aria-hidden="true">
                {loopBottom.map((it, idx) => (
                  <ReviewCard key={`${it.id}-b-${idx}`} it={it} fixed />
                ))}
              </div>
            </div>
          </div>

          <div className={ctaRowClass}>
            <Link href="/reviews" aria-label="Vezi toate recenziile sau publică și tu una">
              Vezi toate recenziile sau publică și tu una →
            </Link>
          </div>
        </>
      ) : (
        <div className={listWrapClass}>
          {items.map((it) => (
            <ReviewCard key={it.id} it={it} fixed={false} pageMode />
          ))}
        </div>
      )}
    </section>
  );
}
