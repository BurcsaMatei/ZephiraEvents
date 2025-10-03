// components/sections/MotivationCards.lazy.tsx
"use client";

// ==============================
// Imports
// ==============================
import * as React from "react";

import * as s from "../../styles/sections/motivationCards.css";

// ==============================
// Types
// ==============================
type Item = {
  title: string;
  points: [string, string, string] | string[];
};

export type MotivationCardsProps = {
  items: Item[];
  className?: string;
};

// ==============================
// Component
// ==============================
export default function MotivationCards({ items, className }: MotivationCardsProps): JSX.Element {
  const safeItems = (items ?? []).slice(0, 4);

  // ⚠️ Fără <section>; paginile vor înfășura cu .section > .container
  return (
    <>
      <div className={[s.grid, className].filter(Boolean).join(" ")}>
        {safeItems.map((it, idx) => (
          <Card key={idx} index={idx} title={it.title} points={it.points} />
        ))}
      </div>
    </>
  );
}

// ==============================
// Internals
// ==============================
function Card({
  index: _index, // păstrat pentru compat
  title,
  points,
}: {
  index: number;
  title: string;
  points: string[] | [string, string, string];
}) {
  const innerRef = React.useRef<HTMLDivElement>(null);

  // tilt pe hover (efect intern; SSR-safe)
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

      const rotX = dy * -6; // ±6°
      const rotY = dx * 8; // ±8°
      node.style.transform = `translateZ(0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    },
    [reduceMotion],
  );

  const onMouseLeave = React.useCallback(() => {
    const node = innerRef.current;
    if (!node) return;
    node.style.transform = "translateZ(0) rotateX(0deg) rotateY(0deg)";
  }, []);

  const liPoints = Array.isArray(points) ? points.slice(0, 6) : [];

  return (
    <div className={s.cardWrap} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <div className={s.card}>
        <div className={s.aurora} aria-hidden />
        <span className={s.orbA} aria-hidden />
        <span className={s.orbB} aria-hidden />

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
      </div>
    </div>
  );
}

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
