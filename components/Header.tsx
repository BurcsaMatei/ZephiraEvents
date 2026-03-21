"use client";

// components/Header.tsx

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
import {
  NAV as NAV_DATA,
  SERVICII_SUBMENU,
  SOCIAL as SOCIAL_DATA,
  type SocialKind,
} from "../lib/nav";
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
  navChevron,
  navDesktop,
  navItemWithMenu,
  navLink,
  navMenuButton,
  navSubDivider,
  navSubGroup,
  navSubGroupBtn,
  navSubGroupChevron,
  navSubGroupOpen,
  navSubLink,
  navSubmenu,
  navSubmenuOpen,
  rightRow,
  themeSwitchWrap,
} from "../styles/header.css";
import LogoMark from "./brand/LogoMark";
import type { HeaderPanelProps } from "./HeaderPanel.lazy";

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

  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesMenusOpen, setServicesMenusOpen] = useState(false);
  const servicesWrapRef = useRef<HTMLDivElement | null>(null);

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

  const closeDesktopMenus = () => {
    setServicesOpen(false);
    setServicesMenusOpen(false);
  };

  useEffect(() => {
    const handler = () => {
      setOpen(false);
      closeDesktopMenus();
    };
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

  // Close desktop submenu on outside click / ESC
  useEffect(() => {
    if (!servicesOpen) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      const wrap = servicesWrapRef.current;
      if (!wrap || !target) return;
      if (!wrap.contains(target)) closeDesktopMenus();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDesktopMenus();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

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

  const isServicesActive =
    router.pathname.startsWith("/servicii") ||
    router.pathname.startsWith("/meniuri") ||
    router.pathname.startsWith("/cort-evenimente-la-locatia-ta");

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

  const toggleServices = () => {
    setServicesOpen((v) => {
      const next = !v;
      if (!next) setServicesMenusOpen(false);
      return next;
    });
  };

  return (
    <header ref={headerRef} className={`${headerRoot} ${isHome ? headerFixed : ""}`} role="banner">
      <div className={`container ${headerWrap} ${effectiveVisible ? headerVisible : headerHidden}`}>
        <Link href={withBase("/")} aria-label={`${siteName} — Acasă`} className={headerLogoBox}>
          <LogoMark className={headerLogoImg} />
          <strong>{siteName}</strong>
        </Link>

        <div className={rightRow}>
          <nav className={navDesktop} aria-label="Meniu principal">
            {NAV.map((item) => {
              if (item.href === "/servicii") {
                return (
                  <div key={item.href} ref={servicesWrapRef} className={navItemWithMenu}>
                    <button
                      type="button"
                      className={navMenuButton}
                      onClick={toggleServices}
                      aria-expanded={servicesOpen}
                      aria-controls="nav-servicii-submenu"
                      data-open={servicesOpen ? "true" : "false"}
                      data-active={isServicesActive ? "true" : "false"}
                    >
                      <span>{item.label}</span>
                      <span className={navChevron} aria-hidden />
                    </button>

                    <div
                      id="nav-servicii-submenu"
                      className={`${navSubmenu} ${servicesOpen ? navSubmenuOpen : ""}`}
                      role="menu"
                      aria-label="Submeniu Servicii"
                    >
                      <Link
                        role="menuitem"
                        className={navSubLink}
                        href={withBase("/servicii")}
                        onClick={closeDesktopMenus}
                      >
                        Toate serviciile
                      </Link>

                      <div className={navSubDivider} aria-hidden />

                      <button
                        role="menuitem"
                        type="button"
                        className={navSubGroupBtn}
                        onClick={() => setServicesMenusOpen((v) => !v)}
                        aria-expanded={servicesMenusOpen}
                        aria-controls="nav-servicii-meniuri"
                        data-open={servicesMenusOpen ? "true" : "false"}
                      >
                        <span>{SERVICII_SUBMENU.meniuri.label}</span>
                        <span className={navSubGroupChevron} aria-hidden />
                      </button>

                      <div
                        id="nav-servicii-meniuri"
                        className={`${navSubGroup} ${servicesMenusOpen ? navSubGroupOpen : ""}`}
                      >
                        {SERVICII_SUBMENU.meniuri.items.map((sub) => (
                          <Link
                            key={sub.href}
                            className={navSubLink}
                            href={withBase(sub.href)}
                            onClick={closeDesktopMenus}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>

                      <div className={navSubDivider} aria-hidden />

                      <Link
                        role="menuitem"
                        className={navSubLink}
                        href={withBase(SERVICII_SUBMENU.tent.href)}
                        onClick={closeDesktopMenus}
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
                  className={navLink}
                  href={withBase(item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  data-active={isActive(item.href) ? "true" : "false"}
                  onClick={closeDesktopMenus}
                >
                  {item.label}
                </Link>
              );
            })}
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
