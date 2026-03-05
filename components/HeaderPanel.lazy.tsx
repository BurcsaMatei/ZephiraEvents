// components/HeaderPanel.lazy.tsx

"use client";

// ==============================
// Imports
// ==============================
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { withBase } from "../lib/config";
import { SERVICII_SUBMENU } from "../lib/nav";
import {
  closeBtn,
  closeIcon,
  overlay,
  overlayOpen,
  panel,
  panelAccordionBtn,
  panelAccordionChevron,
  panelAccordionContent,
  panelAccordionContentOpen,
  panelLink,
  panelNav,
  panelOpen,
  panelPhoneLink,
  panelPhoneRow,
  panelSocialRow,
  panelSubLink,
  socialLink,
} from "../styles/header.css";

// ==============================
// Types
// ==============================
export type HeaderPanelProps = {
  open: boolean;
  onClose: () => void;
  nav: ReadonlyArray<{ href: string; label: string }>;
  social: ReadonlyArray<{ href: string; label: string; iconClass: string }>;
  isActive: (href: string) => boolean;
  telHref: string;
  rawPhone: string;
  burgerBtnRef: React.RefObject<HTMLButtonElement>;
};

// ==============================
// Component
// ==============================
export default function HeaderPanel({
  open,
  onClose,
  nav,
  social,
  isActive,
  telHref,
  rawPhone,
  burgerBtnRef,
}: HeaderPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const mountedOnceRef = useRef(false);

  const [servicesOpen, setServicesOpen] = useState(false);
  const [menusOpen, setMenusOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setServicesOpen(false);
      setMenusOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!servicesOpen) setMenusOpen(false);
  }, [servicesOpen]);

  const servicesActive =
    isActive("/servicii") || isActive("/meniuri") || isActive("/cort-evenimente-la-locatia-ta");

  const closeAndRestoreFocus = useCallback(() => {
    onClose();
    setTimeout(() => burgerBtnRef.current?.focus(), 0);
  }, [onClose, burgerBtnRef]);

  // Focus trap + Esc
  useEffect(() => {
    if (!open || !panelRef.current) return;

    const panelEl = panelRef.current;
    const focusable = panelEl.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!mountedOnceRef.current) {
      mountedOnceRef.current = true;
      first?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAndRestoreFocus();
        return;
      }
      if (e.key === "Tab" && focusable.length > 0) {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last ?? first).focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          (first ?? last).focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeAndRestoreFocus]);

  return (
    <>
      <div
        className={`${overlay} ${open ? overlayOpen : ""}`}
        onClick={closeAndRestoreFocus}
        role="presentation"
        tabIndex={-1}
        aria-hidden
      />

      <div
        id="mobile-menu"
        ref={panelRef}
        className={`${panel} ${open ? panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Meniu"
        data-state={open ? "open" : "closed"}
      >
        <button
          type="button"
          className={closeBtn}
          aria-label="Închide meniul"
          onClick={closeAndRestoreFocus}
        >
          <span className={closeIcon} aria-hidden />
        </button>

        <nav className={panelNav}>
          {nav.map((item) => {
            if (item.href === "/servicii") {
              return (
                <div key={item.href}>
                  <button
                    type="button"
                    className={panelAccordionBtn}
                    onClick={() => setServicesOpen((v) => !v)}
                    aria-expanded={servicesOpen}
                    aria-controls="panel-servicii-submenu"
                    data-open={servicesOpen ? "true" : "false"}
                    data-active={servicesActive ? "true" : "false"}
                  >
                    <span>{item.label}</span>
                    <span className={panelAccordionChevron} aria-hidden />
                  </button>

                  <div
                    id="panel-servicii-submenu"
                    className={`${panelAccordionContent} ${
                      servicesOpen ? panelAccordionContentOpen : ""
                    }`}
                  >
                    <Link
                      className={panelSubLink}
                      href={withBase("/servicii")}
                      onClick={closeAndRestoreFocus}
                    >
                      Toate serviciile
                    </Link>

                    <button
                      type="button"
                      className={panelAccordionBtn}
                      onClick={() => setMenusOpen((v) => !v)}
                      aria-expanded={menusOpen}
                      aria-controls="panel-servicii-meniuri"
                      data-open={menusOpen ? "true" : "false"}
                    >
                      <span>{SERVICII_SUBMENU.meniuri.label}</span>
                      <span className={panelAccordionChevron} aria-hidden />
                    </button>

                    <div
                      id="panel-servicii-meniuri"
                      className={`${panelAccordionContent} ${
                        menusOpen ? panelAccordionContentOpen : ""
                      }`}
                    >
                      {SERVICII_SUBMENU.meniuri.items.map((sub) => (
                        <Link
                          key={sub.href}
                          className={panelSubLink}
                          href={withBase(sub.href)}
                          onClick={closeAndRestoreFocus}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>

                    <Link
                      className={panelSubLink}
                      href={withBase(SERVICII_SUBMENU.tent.href)}
                      onClick={closeAndRestoreFocus}
                    >
                      {SERVICII_SUBMENU.tent.label}
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                className={panelLink}
                href={withBase(item.href)}
                aria-current={isActive(item.href) ? "page" : undefined}
                data-active={isActive(item.href) ? "true" : "false"}
                onClick={closeAndRestoreFocus}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {rawPhone && (
          <div className={panelPhoneRow}>
            <a href={telHref} className={panelPhoneLink} aria-label={`Sună-ne la ${rawPhone}`}>
              {rawPhone}
            </a>
          </div>
        )}

        <div className={panelSocialRow}>
          {social.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className={`${socialLink} ${s.iconClass}`}
              aria-label={s.label}
            />
          ))}
        </div>
      </div>
    </>
  );
}
