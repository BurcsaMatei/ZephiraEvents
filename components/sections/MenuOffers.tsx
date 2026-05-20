// components/sections/MenuOffers.tsx
// ==============================
// Oferte de meniu — carduri expandabile (single-open) — arrow moves to bottom when open
// ==============================

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  arrowBtn,
  card,
  currency as currencyClass,
  grid,
  list,
  media,
  panel,
  panelFooter,
  panelInner,
  price as priceClass,
  priceWrap,
  sectionBlock,
  sectionTitle,
  title,
  titleRow,
  trigger,
} from "../../styles/sections/menuOffers.css";
import type { Menu } from "../../types/menu";

// ==============================
// Types
// ==============================
type BtnRefMap = Record<string, HTMLButtonElement | null>;

export interface MenuOffersProps {
  /**
   * ID pentru ancora secțiunii: ex. "meniuri-Nunta".
   * Va fi folosit ca `id` pe <section> și ca prefix pentru heading.
   */
  id?: string;
  /**
   * Titlul secțiunii (H2). Ex: "Meniuri nuntă".
   * Default: "Oferte de meniu".
   */
  heading?: string;
  /**
   * Lista de meniuri de afișat. Dacă nu e furnizată,
   * se folosește getAllMenus() (fallback compatibil cu implementarea actuală).
   */
  menus?: Menu[];
}

// ==============================
// Component
// ==============================
export default function MenuOffers(props: MenuOffersProps = {}) {
  const { id, heading = "Oferte de meniu", menus: menusProp } = props;

  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const bottomBtnRefs = useRef<BtnRefMap>({});

  const menus = useMemo<Menu[]>(() => menusProp ?? [], [menusProp]);

  const headingId = id ? `${id}-title` : "menu-offers-title";

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node | null;
      if (target && !root.contains(target)) {
        setOpenSlug(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenSlug(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Move focus to bottom toggle when a card opens (A11y)
  useEffect(() => {
    if (!openSlug) return;
    const btn = bottomBtnRefs.current[openSlug];
    if (btn) {
      // slight delay ca să fie sigur în DOM după expand
      setTimeout(() => btn.focus(), 0);
    }
  }, [openSlug]);

  const toggle = useCallback((slug: string) => {
    setOpenSlug((cur) => (cur === slug ? null : slug));
  }, []);

  const sizes = "100vw"; // single-column

  return (
    <section
      id={id}
      ref={rootRef as unknown as React.RefObject<HTMLElement>}
      className="section"
      aria-labelledby={headingId}
    >
      <div className="container">
        <h2 id={headingId}>{heading}</h2>

        <div className={grid}>
          {menus.map((m) => {
            const isOpen = openSlug === m.slug;
            const panelId = `menu-panel-${m.slug}`;
            const labelId = `menu-label-${m.slug}`;
            const toggleLabel = `${isOpen ? "Inchide" : "Deschide"} meniul ${m.title}`;

            return (
              <article key={m.slug} className={card} data-open={isOpen} aria-labelledby={labelId}>
                {/* Trigger area (card clickable) */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-labelledby={labelId}
                  className={trigger}
                  onClick={() => toggle(m.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(m.slug);
                    }
                  }}
                >
                  <div className={media} aria-hidden="true">
                    <Image
                      src={m.image}
                      alt={m.imageAlt}
                      fill
                      sizes={sizes}
                      priority={false}
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  {/* Header: titlu stânga, preț dreapta, săgeată doar când e ÎNCHIS */}
                  <div className={titleRow}>
                    <h3 id={labelId} className={title}>
                      {m.title}
                    </h3>

                    <div className={priceWrap}>
                      <strong className={priceClass}>{m.pricePerPers}</strong>
                      <span className={currencyClass}>{m.currency}/pers.</span>
                    </div>

                    {!isOpen && (
                      <button
                        type="button"
                        className={arrowBtn}
                        data-open={isOpen}
                        aria-label={toggleLabel}
                        onClick={(e) => {
                          e.stopPropagation(); // evită dublu-toggle de la trigger
                          toggle(m.slug);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M12 15.5L5 8.5l1.4-1.4L12 12.7l5.6-5.6L19 8.5z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={labelId}
                  className={panel}
                  data-open={isOpen}
                >
                  <div className={panelInner}>
                    <div className={sectionBlock}>
                      <div className={sectionTitle}>Starter rece</div>
                      <ul className={list}>
                        {m.sections.starterRece.map((it, idx) => (
                          <li key={idx}>{it}</li>
                        ))}
                      </ul>
                    </div>

                    <div className={sectionBlock}>
                      <div className={sectionTitle}>Antreu cald</div>
                      <p>{m.sections.antreuCald}</p>
                    </div>

                    <div className={sectionBlock}>
                      <div className={sectionTitle}>Fel intermediar</div>
                      <p>{m.sections.felIntermediar}</p>
                    </div>

                    <div className={sectionBlock}>
                      <div className={sectionTitle}>Fel principal</div>
                      {Array.isArray(m.sections.felPrincipal) ? (
                        <ul className={list}>
                          {m.sections.felPrincipal.map((it, idx) => (
                            <li key={idx}>{it}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{m.sections.felPrincipal}</p>
                      )}
                    </div>

                    <div className={sectionBlock}>
                      <div className={sectionTitle}>Pachet bar</div>
                      <ul className={list}>
                        {m.sections.pachetBar.map((it, idx) => (
                          <li key={idx}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom actions: săgeată doar când e DESCHIS (dreapta) */}
                  {isOpen && (
                    <div className={panelFooter}>
                      <button
                        type="button"
                        ref={(el) => {
                          bottomBtnRefs.current[m.slug] = el;
                        }}
                        className={arrowBtn}
                        data-open={isOpen}
                        aria-label={toggleLabel}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(m.slug);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M12 15.5L5 8.5l1.4-1.4L12 12.7l5.6-5.6L19 8.5z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
