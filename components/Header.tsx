// components/Header.tsx

"use client";

// ==============================
// Imports
// ==============================
import type * as FM from "framer-motion";
import type { Transition as FMTransition } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ComponentType, useEffect, useRef, useState } from "react";

import { CONTACT, SITE, withBase } from "../lib/config";
import { NAV as NAV_DATA, SOCIAL as SOCIAL_DATA, type SocialKind } from "../lib/nav";
import {
  burgerBot,
  burgerBox,
  burgerLine,
  burgerMid,
  burgerTop,
  headerFixed,
  headerHidden,
  headerLogoBox,
  headerLogoImg,
  headerRoot,
  headerVisible,
  headerWrap,
  iconFacebook,
  iconInstagram,
  iconTiktok,
  mobileBtn,
  navDesktop,
  navLink,
  rightRow,
  themeSwitchWrap,
} from "../styles/header.css";
import type { HeaderPanelProps } from "./HeaderPanel.lazy";
import Img from "./ui/Img";

// ==============================
// Dynamic import
// ==============================
// Dynamic (client-only)
const ThemeSwitcher = dynamic(() => import("./ThemeSwitcher"), {
  ssr: false,
  loading: () => null,
});

const HeaderPanel = dynamic(() => import("./HeaderPanel.lazy"), {
  ssr: false,
  loading: () => null,
}) as ComponentType<HeaderPanelProps>;

// ==============================
// Types
// ==============================
type EventsAPI = {
  on: (t: string, cb: () => void) => void;
  off: (t: string, cb: () => void) => void;
};

type FMModule = typeof FM;

type MotionSpanProps = React.HTMLAttributes<HTMLSpanElement> & {
  animate?: Record<string, unknown> | undefined;
  transition?: FMTransition | undefined;
};

// ==============================
// Constante
// ==============================
const iconByKind: Record<SocialKind, string> = {
  facebook: iconFacebook,
  instagram: iconInstagram,
  tiktok: iconTiktok,
};

const NAV = NAV_DATA;
const SOCIAL = SOCIAL_DATA.filter((s) => !!s.href && /^https?:\/\//i.test(s.href)).map((s) => ({
  href: s.href,
  label: s.label,
  iconClass: iconByKind[s.kind],
}));

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ==============================
// Component
// ==============================
export default function Header() {
  const siteName = SITE.name || "Site";
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mountPanel, setMountPanel] = useState(false);

  const isHome = router.pathname === "/";
  const [isVisible, setIsVisible] = useState<boolean>(!isHome);

  const burgerBtnRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const fmRef = useRef<FMModule | null>(null);
  const [hasFM, setHasFM] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const burgerTransition: FMTransition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE };

  const midTransition: FMTransition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.2, ease: EASE };

  useEffect(() => {
    const handler = () => setOpen(false);
    const events = router.events as unknown as EventsAPI;
    events.on("routeChangeStart", handler);
    return () => events.off("routeChangeStart", handler);
  }, [router.events]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = open ? "hidden" : "";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  // Reveal pe Home: header-ul devine vizibil după ce Hero iese din viewport
  useEffect(() => {
    if (!isHome) {
      setIsVisible(true);
      return;
    }

    const sibling = headerRef.current?.nextElementSibling as HTMLElement | null;
    const targetFromDom: HTMLElement | null =
      sibling && sibling.tagName.toLowerCase() === "main"
        ? (sibling.firstElementChild as HTMLElement | null)
        : (sibling as HTMLElement | null);

    const targetFromQuery =
      document.querySelector<HTMLElement>("main > :first-child") ||
      document.querySelector<HTMLElement>(
        "[data-hero],[data-hero='index'],.section--heroBleed,.hero",
      );

    const targetEl = targetFromDom ?? targetFromQuery;

    if (!targetEl || typeof IntersectionObserver === "undefined") {
      const onScroll = () => {
        if (window.scrollY > 8) {
          setIsVisible(true);
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    io.observe(targetEl);
    return () => io.disconnect();
  }, [isHome]);

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  const rawPhone = CONTACT?.phone?.trim() || "";
  const telHref = rawPhone ? `tel:${rawPhone.replace(/[^\d+]/g, "")}` : "";

  const effectiveVisible = open || isVisible;

  function MotionSpan(props: MotionSpanProps) {
    const { animate, transition, ...rest } = props;

    if (hasFM && fmRef.current) {
      const Comp = fmRef.current.motion.span as unknown as React.ComponentType<
        React.ComponentProps<"span"> & {
          animate?: Record<string, unknown> | undefined;
          transition?: FMTransition | undefined;
        }
      >;

      const compProps = {
        ...rest,
        ...(animate !== undefined ? { animate } : {}),
        ...(transition !== undefined ? { transition } : {}),
      };

      return <Comp {...compProps} />;
    }

    return <span {...rest} />;
  }

  const onToggleBurger = () => {
    setOpen((v) => !v);
    if (!mountPanel) setMountPanel(true);
    if (!hasFM && typeof window !== "undefined") {
      import("framer-motion")
        .then((mod) => {
          fmRef.current = mod;
          setHasFM(true);
        })
        .catch(() => {});
    }
  };

  return (
    <header ref={headerRef} className={`${headerRoot} ${isHome ? headerFixed : ""}`} role="banner">
      <div className={`container ${headerWrap} ${effectiveVisible ? headerVisible : headerHidden}`}>
        <Link href={withBase("/")} aria-label={`${siteName} — Acasă`} className={headerLogoBox}>
          <Img
            className={headerLogoImg}
            src="/logo.svg"
            alt={siteName}
            variant="icon"
            width={120}
            height={32}
          />
          <strong>{siteName}</strong>
        </Link>

        <div className={rightRow}>
          <nav className={navDesktop} aria-label="Meniu principal">
            {NAV.map((item) => (
              <Link
                key={item.href}
                className={navLink}
                href={withBase(item.href)}
                aria-current={isActive(item.href) ? "page" : undefined}
                data-active={isActive(item.href) ? "true" : "false"}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={themeSwitchWrap}>
            <ThemeSwitcher />
          </div>

          <button
            ref={burgerBtnRef}
            type="button"
            className={mobileBtn}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            onClick={onToggleBurger}
          >
            <span className={burgerBox} aria-hidden>
              <MotionSpan
                className={`${burgerLine} ${burgerTop}`}
                {...(hasFM
                  ? {
                      animate: { y: open ? 7 : 0, rotate: open ? 45 : 0 },
                      transition: burgerTransition,
                    }
                  : {})}
              />
              <MotionSpan
                className={`${burgerLine} ${burgerMid}`}
                {...(hasFM
                  ? { animate: { opacity: open ? 0 : 1 }, transition: midTransition }
                  : {})}
              />
              <MotionSpan
                className={`${burgerLine} ${burgerBot}`}
                {...(hasFM
                  ? {
                      animate: { y: open ? -7 : 0, rotate: open ? -45 : 0 },
                      transition: burgerTransition,
                    }
                  : {})}
              />
            </span>
          </button>
        </div>
      </div>

      {mountPanel ? (
        <HeaderPanel
          open={open}
          onClose={() => {
            setOpen(false);
            setTimeout(() => burgerBtnRef.current?.focus(), 0);
          }}
          nav={NAV}
          social={SOCIAL}
          isActive={isActive}
          telHref={telHref}
          rawPhone={rawPhone}
          burgerBtnRef={burgerBtnRef}
        />
      ) : null}
    </header>
  );
}
