// components/sections/MotivationsCards.lazy.tsx

"use client";

// ==============================
// Imports
// ==============================
import Link from "next/link";
import * as React from "react";

import * as s from "../../styles/sections/motivationCards.css";

// ==============================
// Types
// ==============================
type Item = {
  title: string;
  points: [string, string, string] | string[];
  mediaSrc?: string; // override per pagină
  ctaHref?: string; // fallback /servicii
  ctaLabel?: string; // fallback Descoperă serviciile →
  backMsg?: string; // mesaj contextual pe spate; fallback BACK_MESSAGE
};

export type MotivationCardsProps = {
  items: Item[];
  className?: string;
};

// ==============================
// Constants
// ==============================
const DEFAULT_MEDIA = [
  "/images/motivationcards/mc-01.jpg",
  "/images/motivationcards/mc-02.jpg",
  "/images/motivationcards/mc-03.jpg",
  "/images/motivationcards/mc-04.jpg",
] as const;

const BACK_MESSAGE = "Planifică evenimentul ideal la Zephira — servicii complete și flexibile.";

// ==============================
// Component
// ==============================
export default function MotivationCards({ items, className }: MotivationCardsProps): JSX.Element {
  const safeItems = (items ?? []).slice(0, 4);
  return (
    <div className={[s.grid, className].filter(Boolean).join(" ")}>
      {safeItems.map((it, idx) => (
        <Card
          key={idx}
          index={idx}
          title={it.title}
          points={it.points}
          mediaSrc={it.mediaSrc}
          ctaHref={it.ctaHref}
          ctaLabel={it.ctaLabel}
          backMsg={it.backMsg}
        />
      ))}
    </div>
  );
}

// ==============================
// Subcomponents
// ==============================
function Card({
  index,
  title,
  points,
  mediaSrc,
  ctaHref,
  ctaLabel,
  backMsg,
}: {
  index: number;
  title: string;
  points: string[] | [string, string, string];
  mediaSrc: string | undefined;
  ctaHref: string | undefined;
  ctaLabel: string | undefined;
  backMsg: string | undefined;
}) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const onMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const node = innerRef.current;
      if (!node) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const rotX = dy * -6;
      const rotY = dx * 8;
      node.style.transform = `translateZ(0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    },
    [reduceMotion],
  );

  const onMouseLeave = React.useCallback(() => {
    const node = innerRef.current;
    if (!node) return;
    node.style.transform = "translateZ(0) rotateX(0deg) rotateY(0deg)";
  }, []);

  // A11y: suport Enter/Space pe rol de „button” (nu schimbăm logica; flip-ul e pe :focus-within)
  const onKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      // prevenim scroll pe Space și lăsăm focusul pe card ca să declanșeze flip-ul via :focus-within
      e.preventDefault();
    }
  }, []);

  const liPoints = Array.isArray(points) ? points.slice(0, 5) : [];
  const media = mediaSrc ?? DEFAULT_MEDIA[index % DEFAULT_MEDIA.length];
  const bgStyle = { backgroundImage: `url("${media}")` };

  return (
    <div className={s.cardWrap}>
      {/* card devine focusabil pentru tap/keyboard, respectând jsx-a11y */}
      <div
        className={s.card}
        role="button"
        tabIndex={0}
        aria-label={`Deschide detalii: ${title}`}
        onKeyDown={onKeyDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div className={s.aurora} aria-hidden />
        <span className={s.orbA} aria-hidden />
        <span className={s.orbB} aria-hidden />

        {/* === Flipper: față + spate === */}
        <div className={s.flipper}>
          {/* === Front === */}
          <div className={s.frontFace}>
            <div ref={innerRef} className={s.inner}>
              <h3 className={s.title}>{title}</h3>
              <ul className={s.list}>
                {liPoints.map((p, i) => (
                  <li key={i} className={s.item}>
                    <CheckIcon />
                    <span className={s.pointText}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Media: pătrat stânga-jos (thumbnail) */}
            <div className={s.mediaBadge} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.mediaImg} src={media} alt="" loading="lazy" decoding="async" />
            </div>
          </div>

          {/* === Back === */}
          <div className={s.backFace} style={bgStyle} aria-hidden={false}>
            <div className={s.backOverlay} />
            <div className={s.backContent}>
              <h3 className={s.backTitle}>{title}</h3>
              <p className={s.backMsg}>{backMsg ?? BACK_MESSAGE}</p>
              <Link
                href={ctaHref ?? "/servicii"}
                className={s.cta}
                aria-label={ctaLabel ?? "Descoperă serviciile →"}
              >
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Icons
// ==============================
function CheckIcon() {
  return (
    <svg className={s.check} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 12.5l3.5 3.5L18 8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className={s.ctaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h12m0 0l-4-4m4 4l-4 4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
