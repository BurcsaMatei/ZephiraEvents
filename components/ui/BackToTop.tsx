// components/ui/BackToTop.tsx
// ==============================
// Imports
// ==============================
import { useEffect, useRef, useState, useCallback } from "react";
import { button, icon, hidden, visible } from "../../styles/ui/backToTop.css"
import { vars } from "../../styles/theme.css";

// ==============================
// Utils (SSR-safety + prefers-reduced-motion)
// ==============================
const isBrowser = typeof window !== "undefined";

const getPrm = (): boolean => {
  if (!isBrowser || !("matchMedia" in window)) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// ==============================
// Component
// ==============================
export default function BackToTop(): JSX.Element | null {
  const [show, setShow] = useState(false);
  const rafId = useRef<number | null>(null);

  const onScroll = useCallback(() => {
    if (!isBrowser) return;
    // rAF throttling
    if (rafId.current != null) return;
    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setShow(y > 600);
    });
  }, []);

  const handleClick = useCallback(() => {
    if (!isBrowser) return;
    if (getPrm()) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    // Passive listener for performance
    window.addEventListener("scroll", onScroll, { passive: true });
    // Initialize on mount (in case page loads scrolled)
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll as EventListener);
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [onScroll]);

  // Render
  return (
    <button
      type="button"
      aria-label="Înapoi sus"
      title="Înapoi sus"
      className={`${button} ${show ? visible : hidden}`}
      onClick={handleClick}
      // hit-area suficientă pe mobil; focus vizibil vine din CSS global + local
    >
      {/* Chevron-up inline SVG (fără dependențe) */}
      <svg
        className={icon}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6.7 14.7a1 1 0 0 1 0-1.4l4.6-4.6a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 1 1-1.4 1.4L12 10.41l-3.9 3.89a1 1 0 0 1-1.4 0z"
          fill={vars.color.primaryContrast}
        />
      </svg>
      <span className="sr-only">Înapoi sus</span>
    </button>
  );
}

