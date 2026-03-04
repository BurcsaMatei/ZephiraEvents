// components/sections/menus/ArcMenuGallery.lazy.tsx

"use client";

// ==============================
// Imports
// ==============================
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { withBase } from "../../../lib/config";
import { buildMenuJsonLd, type MenuData } from "../../../lib/seo/menuJsonLd";
import * as intro from "../../../styles/introSection.css";
import * as s from "../../../styles/sections/arcMenuGallery.css";
import type { Menu } from "../../../types/menu";
import Appear from "../../animations/Appear";
import Img from "../../ui/Img";

// ==============================
// Types
// ==============================
export type ArcMenuPresentation = {
  eyebrow?: ReactNode;
  title?: string;
  lede?: ReactNode;
};

export type ArcMenuGalleryProps = {
  id?: string;
  heading?: string;
  menus: Menu[];
  intervalMs?: number;
  tiltMax?: number;
  glowOpacity?: number;
  priorityFirst?: boolean;
  pauseWhenHidden?: boolean;
  presentation?: ArcMenuPresentation;
};

// ==============================
// Constante
// ==============================
const EASE = [0.4, 0, 0.2, 1] as const;

// Duratele “acceptate” de CSS pentru progress ring (fără inline styles).
const PROGRESS_DURATIONS = [4800, 5220, 5640, 6060] as const;

function clampDelay(v: number): number {
  return Math.min(0.48, Math.max(0, v));
}

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
// Utils
// ==============================
function normalizeMenuImages(menu: Menu): string[] {
  const base =
    Array.isArray(menu.images) && menu.images.length > 0 ? [...menu.images] : [menu.image];

  // Asigurăm exact 3 intrări (fallback sigur: repetăm ultima / image).
  const out: string[] = base.slice(0, 3);
  while (out.length < 3) {
    out.push(out[out.length - 1] ?? menu.image);
  }

  return out;
}

function menuToMenuData(menu: Menu): MenuData {
  return {
    slug: menu.slug,
    title: menu.title,
    pricePerPers: menu.pricePerPers,
    currency: menu.currency,
    image: menu.image,
    imageAlt: menu.imageAlt,
    sections: menu.sections,
  };
}

function hasMeaningfulPresentation(p: ArcMenuPresentation | undefined): boolean {
  return Boolean(p && (p.eyebrow || p.title || p.lede));
}

// ==============================
// Components
// ==============================

/* ───────────────────────────── Card ─────────────────────────────────── */
function ArcMenuCard({
  menu,
  baseMs,
  tiltMax,
  glowOpacity,
  pauseWhenHidden,
  priority,
  reducedMotion,
  pointerCoarse,
}: {
  menu: Menu;
  baseMs: (typeof PROGRESS_DURATIONS)[number];
  tiltMax: number;
  glowOpacity: number;
  pauseWhenHidden: boolean;
  priority: boolean;
  reducedMotion: boolean;
  pointerCoarse: boolean;
}) {
  const images = useMemo(() => normalizeMenuImages(menu), [menu]);

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
  const { idx, progressKey } = useAutoPlay(images.length, baseMs, paused);
  const current = images[Math.max(0, idx % Math.max(1, images.length))];

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

  const href = `/meniuri/${menu.slug}`;
  const ariaLabel = `Deschide ${menu.title}`;

  return (
    <article ref={wrapRef} className={s.cardWrap}>
      <Link href={withBase(href)} className={s.cardLink} aria-label={ariaLabel}>
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
                      src={current}
                      alt={menu.imageAlt || menu.title}
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

            <span className={s.openBtn} aria-hidden="true">
              <svg className={s.openIcon} viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M14.5 4H20v5.5M20 4l-9.5 9.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <svg key={progressKey} className={s.progress} viewBox="0 0 36 36" data-d={baseMs}>
                <circle className={s.progressBg} cx="18" cy="18" r="15" />
                <circle className={s.progressFg} cx="18" cy="18" r="15" />
              </svg>
            </span>
          </div>
        </motion.div>
      </Link>

      <div className={s.caption} aria-live="polite">
        {menu.title}
      </div>
    </article>
  );
}

/* ───────────────────────────── Galerie ──────────────────────────────── */
export default function ArcMenuGallery({
  id,
  heading = "Oferte de meniu",
  menus,
  intervalMs = 4800,
  tiltMax = 8,
  glowOpacity = 0.28,
  priorityFirst = false,
  pauseWhenHidden = true,
  presentation,
}: ArcMenuGalleryProps) {
  const reducedMotion = usePrefersReducedMotion();
  const pointerCoarse = usePointerCoarse();

  const safeMenus = useMemo(() => menus ?? [], [menus]);
  const jsonLd = useMemo(() => buildMenuJsonLd(safeMenus.map(menuToMenuData)), [safeMenus]);

  void intervalMs;

  const titleId = id ? `${id}-title` : "arc-menu-gallery-title";
  const showPresentation = hasMeaningfulPresentation(presentation);

  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <div className="container">
        {showPresentation ? (
          <>
            <div className={s.presentationWrap}>
              <div className={`${intro.panel} ${intro.onDark} ${s.presentationPanel}`}>
                <span className={s.ribbon} aria-hidden="true">
                  <Img
                    src="/images/decor/ribbon.png"
                    alt=""
                    fill
                    fit="contain"
                    sizes="(max-width: 768px) 185px, 260px"
                    quality={90}
                    priority={false}
                  />
                </span>

                <div className={`${intro.center} ${s.presentationContent}`}>
                  {presentation?.eyebrow ? (
                    <div className={intro.eyebrow}>{presentation.eyebrow}</div>
                  ) : null}

                  <h2 id={titleId} className={intro.heading}>
                    {presentation?.title ?? "MENIURI"}
                  </h2>

                  {presentation?.lede ? <p className={intro.lede}>{presentation.lede}</p> : null}
                </div>
              </div>
            </div>

            <p className={s.offersLabel}>{heading}</p>
          </>
        ) : (
          <h2 id={titleId}>{heading}</h2>
        )}

        <div className={s.grid}>
          {safeMenus.map((menu, i) => {
            const baseMs =
              PROGRESS_DURATIONS[i % PROGRESS_DURATIONS.length] ?? PROGRESS_DURATIONS[0];

            const delay = clampDelay(0.06 * i);

            return (
              <Appear key={menu.slug} as="div" delay={delay}>
                <ArcMenuCard
                  menu={menu}
                  baseMs={baseMs}
                  tiltMax={tiltMax}
                  glowOpacity={glowOpacity}
                  pauseWhenHidden={pauseWhenHidden}
                  priority={priorityFirst && i === 0}
                  reducedMotion={reducedMotion}
                  pointerCoarse={pointerCoarse}
                />
              </Appear>
            );
          })}
        </div>

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </section>
  );
}
