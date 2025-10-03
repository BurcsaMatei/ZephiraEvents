// components/sections/homepage/ArcGallery.lazy.tsx
"use client";

// ==============================
// Imports
// ==============================
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { withBase } from "../../../lib/config";
import { getGalleryItems } from "../../../lib/gallery";
import * as s from "../../../styles/homepage/arcGallery.css";
import Appear from "../../animations/Appear";
import Img from "../../ui/Img";

// ==============================
// Types
// ==============================
type GalleryItem = ReturnType<typeof getGalleryItems>[number];

export type ArcGalleryProps = {
  ranges?: Array<[number, number]>;
  intervalMs?: number;
  tiltMax?: number;
  glowOpacity?: number;
  priorityFirst?: boolean;
  pauseWhenHidden?: boolean;
  ctaHref?: string;
  dense?: boolean; // compat
};

// ==============================
// Constante
// ==============================
const EASE = [0.4, 0, 0.2, 1] as const;
const DEFAULT_RANGES: Array<[number, number]> = [
  [0, 3],
  [4, 8],
  [9, 13],
  [14, 18],
];

// ==============================
// Hooks
// ==============================
function usePrefersReducedMotion() {
  const [pref, setPref] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h = () => setPref(mq.matches);
    h();
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return pref;
}

function usePointerCoarse() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const h = () => setCoarse(mq.matches);
    h();
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return coarse;
}

function useResizeDebounced(elRef: React.RefObject<HTMLElement>, ms = 160) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const el = elRef.current;
    if (!el || !("ResizeObserver" in window)) return;
    let t: number | null = null;
    const ro = new ResizeObserver(() => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => setTick((p) => p + 1), ms);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (t) window.clearTimeout(t);
    };
  }, [elRef, ms]);
}

function useAutoPlay(length: number, baseMs: number, paused: boolean) {
  const [idx, setIdx] = useState<number>(0);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (length <= 1) return;
    const jitter = Math.round(baseMs * 0.08);
    const period = baseMs + Math.floor(Math.random() * jitter);

    const tick = () => {
      setIdx((p) => (p + 1) % length);
      setProgressKey((k) => k + 1);
    };

    let timer: number | null = null;
    const arm = () => (timer = window.setInterval(() => !paused && tick(), period));
    arm();

    const onVis = () => {
      if (document.hidden) {
        if (timer) window.clearInterval(timer);
      } else {
        if (timer) window.clearInterval(timer);
        arm();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [length, baseMs, paused]);

  return { idx, progressKey };
}

// ==============================
// Components
// ==============================

/* ───────────────────────────── Card ─────────────────────────────────── */
function ArcCard({
  items,
  baseMs,
  tiltMax,
  glowOpacity,
  pauseWhenHidden,
  ctaHref,
  priority,
  reducedMotion,
  pointerCoarse,
}: {
  items: GalleryItem[];
  baseMs: number;
  tiltMax: number;
  glowOpacity: number;
  pauseWhenHidden: boolean;
  ctaHref: string;
  priority: boolean;
  reducedMotion: boolean;
  pointerCoarse: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(true);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useResizeDebounced(wrapRef, 160);

  useEffect(() => {
    if (!pauseWhenHidden) return;
    const el = wrapRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pauseWhenHidden]);

  const paused = hover || (pauseWhenHidden && !inView);
  const { idx, progressKey } = useAutoPlay(items.length, baseMs, paused);
  const current = items[Math.max(0, idx % Math.max(1, items.length))];

  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const enableTilt = !reducedMotion && !pointerCoarse;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt) return;
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const dead = 0.06;
    const ndx = Math.abs(dx) < dead ? 0 : dx;
    const ndy = Math.abs(dy) < dead ? 0 : dy;

    setTilt({
      rx: Math.max(-tiltMax, Math.min(tiltMax, -ndy * tiltMax)),
      ry: Math.max(-tiltMax, Math.min(tiltMax, ndx * tiltMax)),
    });
  };

  const onMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <article ref={wrapRef} className={s.cardWrap}>
      <motion.div
        ref={frameRef}
        className={s.frame}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          onMouseLeave();
        }}
        onMouseMove={onMouseMove}
        animate={enableTilt ? { rotateX: tilt.rx, rotateY: tilt.ry } : { rotateX: 0, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.6 }}
      >
        <div className={s.aurora} style={{ opacity: glowOpacity }} aria-hidden />

        <div className={s.card} aria-live="off">
          <div className={s.stage}>
            <AnimatePresence mode="wait" initial={false}>
              {current && (
                <motion.div
                  key={`${idx}`}
                  className={s.layer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0.35 : 0.6, ease: EASE }}
                >
                  <Img
                    src={current.src}
                    alt={current.alt ?? current.caption ?? "Galerie"}
                    variant="card"
                    fill
                    fit="cover"
                    sizes="(max-width:700px) 45vw, (max-width:1200px) 25vw, 280px"
                    quality={75}
                    priority={priority}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href={withBase(ctaHref)} className={s.openBtn} aria-label="Deschide galeria">
            <svg
              className={s.openIcon}
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                d="M14.5 4H20v5.5M20 4l-9.5 9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* progress ring sincron cu autoplay */}
            <svg
              key={progressKey}
              className={s.progress}
              viewBox="0 0 36 36"
              aria-hidden="true"
              data-d={baseMs}
            >
              <circle className={s.progressBg} cx="18" cy="18" r="15" />
              <circle className={s.progressFg} cx="18" cy="18" r="15" />
            </svg>
          </Link>
        </div>
      </motion.div>

      <div className={s.caption} aria-live="polite">
        {current ? current.alt : "—"}
      </div>
    </article>
  );
}

/* ───────────────────────────── Galerie ──────────────────────────────── */
export default function ArcGallery({
  ranges = DEFAULT_RANGES,
  intervalMs = 4800,
  tiltMax = 8,
  glowOpacity = 0.28,
  priorityFirst = true,
  pauseWhenHidden = true,
  ctaHref = "/galerie",
  dense: _dense = false,
}: ArcGalleryProps) {
  const reducedMotion = usePrefersReducedMotion();
  const pointerCoarse = usePointerCoarse();

  const all = useMemo(() => getGalleryItems().slice(0, 19), []);
  const decks = useMemo(() => {
    const res: GalleryItem[][] = [];
    for (const [start, end] of ranges) {
      const slice = all.slice(start, end + 1);
      res.push(slice.length ? slice : all.slice(0, 1));
    }
    return res;
  }, [all, ranges]);

  return (
    <div className={s.grid}>
      {decks.map((deck, i) => (
        <Appear key={i} as="div" delay={0.1 * i}>
          <ArcCard
            items={deck}
            baseMs={intervalMs + i * 420}
            tiltMax={tiltMax}
            glowOpacity={glowOpacity}
            pauseWhenHidden={pauseWhenHidden}
            ctaHref={ctaHref}
            priority={priorityFirst && i === 0}
            reducedMotion={reducedMotion}
            pointerCoarse={pointerCoarse}
          />
        </Appear>
      ))}
    </div>
  );
}
