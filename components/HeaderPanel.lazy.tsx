// components/HeaderPanel.lazy.tsx

"use client";

// ==============================
// Imports
// ==============================
import Link from "next/link";
import { useEffect, useRef } from "react";

import { withBase } from "../lib/config";
import {
  closeBtn,
  closeIcon,
  overlay,
  overlayOpen,
  panel,
  panelLink,
  panelNav,
  panelOpen,
  panelPhoneLink,
  panelPhoneRow,
  panelSocialRow,
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
        onClose();
        setTimeout(() => burgerBtnRef.current?.focus(), 0);
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
  }, [open, onClose, burgerBtnRef]);

  return (
    <>
      <div
        className={`${overlay} ${open ? overlayOpen : ""}`}
        onClick={() => {
          onClose();
          setTimeout(() => burgerBtnRef.current?.focus(), 0);
        }}
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
          onClick={() => {
            onClose();
            setTimeout(() => burgerBtnRef.current?.focus(), 0);
          }}
        >
          <span className={closeIcon} aria-hidden />
        </button>

        <nav className={panelNav}>
          {nav.map((item) => (
            <Link
              key={item.href}
              className={panelLink}
              href={withBase(item.href)}
              aria-current={isActive(item.href) ? "page" : undefined}
              data-active={isActive(item.href) ? "true" : "false"}
            >
              {item.label}
            </Link>
          ))}
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
