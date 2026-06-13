# KonceptID — Admin Panel for Clients: Code Audit

> Analiză pură. Conținut complet al fișierelor relevante. Fără rezumare, fără parafrazare.
> Data: 2026-05-30 — actualizat 2026-06-13 (PR #161 — billing fix KonceptID)

---

## CUPRINS

1. [Auth & Session](#1-auth--session)
2. [Layout & UI Admin](#2-layout--ui-admin)
3. [Inbox](#3-inbox)
4. [Login Page](#4-login-page)
5. [Payments / Stripe / KonceptID](#5-payments--stripe--konceptid)
6. [Theme Tokens](#6-theme-tokens)
7. [ENV Example](#7-env-example)

---

## 1. AUTH & SESSION

### `lib/admin/auth.ts`

```ts
// lib/admin/auth.ts
// Autentificare admin simplă bazată pe cookie httpOnly + HMAC.
// Folosit exclusiv în API routes — nu importa din componente client-side.

import crypto from "crypto";

// Duck type — acceptat de NextApiRequest (API routes) și IncomingMessage (getServerSideProps).
// Record<string, ...> e satisfăcut de IncomingHttpHeaders care extinde NodeJS.Dict<string | string[]>.
type RequestWithCookieHeader = { headers: Record<string, string | string[] | undefined> };

// ──────────────────────────────────────────────────────────
// Constante
// ──────────────────────────────────────────────────────────
export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SHORT = 8 * 3600;       // 8 ore în secunde
export const SESSION_MAX_AGE_LONG  = 30 * 24 * 3600; // 30 zile în secunde
/** @deprecated folosește SESSION_MAX_AGE_SHORT sau SESSION_MAX_AGE_LONG */
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SHORT;

// ──────────────────────────────────────────────────────────
// Token derivat din credențiale + secret
// Token-ul este stabil (nu expiră server-side) — expirarea e gestionată de cookie max-age.
// Schimbarea ADMIN_PASSWORD sau ADMIN_SESSION_SECRET invalidează toate sesiunile active.
// ──────────────────────────────────────────────────────────
function buildExpectedToken(): string {
  const email = process.env.ADMIN_EMAIL ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "fallback-insecure-please-change";
  return crypto
    .createHmac("sha256", secret)
    .update(`${email}:${password}`)
    .digest("hex");
}

export function generateSessionToken(): string {
  return buildExpectedToken();
}

// ──────────────────────────────────────────────────────────
// Verificare sesiune din cookie
// ──────────────────────────────────────────────────────────
function parseCookieValue(header: string, name: string): string | undefined {
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (key === name) return trimmed.slice(eqIdx + 1);
  }
  return undefined;
}

export function verifyAdminSession(req: RequestWithCookieHeader): boolean {
  const raw = req.headers["cookie"];
  const cookieHeader = Array.isArray(raw) ? raw.join("; ") : (raw ?? "");
  const token = parseCookieValue(cookieHeader, COOKIE_NAME);
  if (!token) return false;

  try {
    const expected = buildExpectedToken();
    const a = Buffer.from(token, "hex");
    const b = Buffer.from(expected, "hex");
    // timingSafeEqual necesită aceeași lungime
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────
// Verificare credențiale la login
// ──────────────────────────────────────────────────────────
export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPassword) return false;
  return email === adminEmail && password === adminPassword;
}
```

---

### `lib/admin/response.ts`

```ts
// lib/admin/response.ts
// Helpers pentru format uniform de răspuns în API routes admin.
// Format: { ok: true [, data: T] } | { ok: false, error: string }

export interface ErrResp {
  ok: false;
  error: string;
}

export function okResponse(): { ok: true };
export function okResponse<T>(data: T): { ok: true; data: T };
export function okResponse<T>(data?: T): { ok: true } | { ok: true; data: T } {
  if (data !== undefined) return { ok: true as const, data };
  return { ok: true as const };
}

export function errorResponse(message: string): ErrResp {
  return { ok: false, error: message };
}
```

---

### `lib/admin/sanitize.ts`

```ts
// lib/admin/sanitize.ts
// Sanitizare text pentru afișare sigură în admin UI.
// Output: HTML safe — tag-uri strippate, entități escapate.
// Folosit cu dangerouslySetInnerHTML în paginile admin.

export function sanitizeHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")  // strip HTML tags
    .replace(/&/g, "&amp;")    // escape & primul (înainte de celelalte)
    .replace(/</g, "&lt;")     // escape < rămas (e.g., "pret < 100")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\s{2,}/g, " ")   // colapsează spații multiple
    .trim();
}
```

---

> **NOTĂ:** `lib/admin/login.ts` și `lib/admin/logout.ts` — fișiere inexistente în repo (logica de login/logout e direct în API routes).

---

### `pages/api/admin/login.ts`

```ts
// pages/api/admin/login.ts
// POST — verifică credențiale admin, setează cookie httpOnly admin_session.

import type { NextApiRequest, NextApiResponse } from "next";

import {
  COOKIE_NAME,
  generateSessionToken,
  SESSION_MAX_AGE_LONG,
  SESSION_MAX_AGE_SHORT,
  verifyCredentials,
} from "../../../lib/admin/auth";
import type { ErrResp } from "../../../lib/admin/response";
import { errorResponse, okResponse } from "../../../lib/admin/response";

// ──────────────────────────────────────────────────────────
// Rate limiting — in-memory, per IP
// ──────────────────────────────────────────────────────────
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minute
const RATE_MAX_FAILS = 5;

const _failedAttempts = new Map<string, { count: number; since: number }>();

function getClientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return (fwd.split(",")[0] ?? fwd).trim();
  return req.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const entry = _failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.since > RATE_WINDOW_MS) {
    _failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= RATE_MAX_FAILS;
}

function recordFailure(ip: string): void {
  const entry = _failedAttempts.get(ip);
  if (!entry || Date.now() - entry.since > RATE_WINDOW_MS) {
    _failedAttempts.set(ip, { count: 1, since: Date.now() });
  } else {
    entry.count++;
  }
}

function clearFailures(ip: string): void {
  _failedAttempts.delete(ip);
}

// ──────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────
type Ok = { ok: true };
type Resp = Ok | ErrResp;

export default function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }

  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res.status(429).json(errorResponse("Prea multe încercări. Încearcă din nou în 15 minute."));
  }

  const body = req.body as { email?: unknown; password?: unknown; rememberMe?: unknown };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rememberMe = Boolean(body.rememberMe) === true;

  if (!verifyCredentials(email, password)) {
    recordFailure(ip);
    return res.status(401).json(errorResponse("Email sau parolă incorecte."));
  }

  clearFailures(ip);

  const token = generateSessionToken();
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = rememberMe ? SESSION_MAX_AGE_LONG : SESSION_MAX_AGE_SHORT;

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${isProd ? "; Secure" : ""}`,
  );

  return res.status(200).json(okResponse());
}
```

---

### `pages/api/admin/logout.ts`

```ts
// pages/api/admin/logout.ts
// POST — șterge cookie-ul de sesiune admin.

import type { NextApiRequest, NextApiResponse } from "next";

import { COOKIE_NAME } from "../../../lib/admin/auth";
import { okResponse } from "../../../lib/admin/response";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Accept GET și POST pentru ușurința utilizării din link-uri
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,
  );
  return res.status(200).json(okResponse());
}
```

---

## 2. LAYOUT & UI ADMIN

### `components/admin/AdminLayout.tsx`

```tsx
// components/admin/AdminLayout.tsx
// Layout comun pentru toate paginile admin — sidebar + main content.
// Fără Header/Footer public.

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useState } from "react";

// ──────────────────────────────────────────────────────────
// Nav icons (inline SVG, currentColor)
// ──────────────────────────────────────────────────────────
const IconInbox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 10h5l2 3h6l2-3h5"/>
  </svg>
);

const IconReviews = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
  </svg>
);

const IconMenus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11V3a1 1 0 0 1 2 0v3h2V3a1 1 0 0 1 2 0v8a4 4 0 0 1-3 3.87V21a1 1 0 0 1-2 0v-6.13A4 4 0 0 1 3 11z"/>
    <path d="M16 3v7c0 1.66 1.34 3 3 3v8a1 1 0 0 1-2 0V3a1 1 0 0 1 2 0z"/>
  </svg>
);

const IconBlog = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
  </svg>
);

const IconKonceptID = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

import * as s from "../../styles/admin/layout.css";
import ThemeSwitcher from "../ThemeSwitcher";
import AdminInstallButton from "./AdminInstallButton";
import AdminSearch from "./AdminSearch";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  children: ReactNode;
  unreadCount?: number;
};

// ──────────────────────────────────────────────────────────
// Nav items
// ──────────────────────────────────────────────────────────
const NAV = [
  { href: "/admin/inbox", label: "Inbox", icon: <IconInbox /> },
  { href: "/admin/reviews", label: "Recenzii", icon: <IconReviews /> },
  { href: "/admin/menus", label: "Meniuri", icon: <IconMenus /> },
  { href: "/admin/blog", label: "Blog", icon: <IconBlog /> },
  { href: "/admin/konceptid", label: "KonceptID", icon: <IconKonceptID /> },
];

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminLayout({ children, unreadCount = 0 }: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string): boolean {
    const p = router.pathname;
    return p === href || p.startsWith(href + "/");
  }

  function handleLogout() {
    void fetch("/api/admin/logout", { method: "POST" }).then(() => {
      void router.push("/admin/login");
    });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/admin-manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#12122a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ZE Admin" />
      </Head>

      {/* Overlay — apare doar când sidebar-ul e deschis pe mobil */}
      {sidebarOpen && (
        <div
          className={s.overlay}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={s.wrapper}>
        <aside className={`${s.sidebar}${sidebarOpen ? ` ${s.sidebarOpen}` : ""}`}>
          <Link href="/admin" className={s.brand} onClick={closeSidebar}>
            <span className={s.brandName}>ZephiraEvents</span>
            <span className={s.brandSub}>Admin</span>
          </Link>

          <AdminSearch />

          <nav className={s.nav}>
            {NAV.map(({ href, label, icon }) => {
              const active = isActive(href);
              const badge = href === "/admin/inbox" && unreadCount > 0 ? unreadCount : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${s.navLink}${active ? ` ${s.navLinkActive}` : ""}`}
                  onClick={closeSidebar}
                >
                  <span className={s.navIcon}>{icon}</span>
                  {label}
                  {badge > 0 && <span className={s.navBadge}>{badge}</span>}
                </Link>
              );
            })}
          </nav>

          <AdminInstallButton />

          <div className={s.sidebarFooter}>
            <button type="button" onClick={handleLogout} className={s.logoutBtn}>
              Logout
            </button>
            <ThemeSwitcher />
          </div>

          <button
            type="button"
            className={s.sidebarTab}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Închide meniu" : "Deschide meniu"}
          >
            <svg width="18" height="18" viewBox="0 0 12 12" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              {sidebarOpen
                ? <><polyline points="8,2 4,6 8,10" /></>
                : <><polyline points="4,2 8,6 4,10" /></>
              }
            </svg>
          </button>
        </aside>

        <main className={s.main}>{children}</main>
      </div>
    </>
  );
}
```

---

### `components/admin/AdminSearch.tsx`

```tsx
// components/admin/AdminSearch.tsx
// Componentă de căutare globală în sidebar admin.
// Caută simultan în messages și reviews via /api/admin/search.

import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SearchResults } from "../../pages/api/admin/search";
import * as s from "../../styles/admin/search.css";

export default function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = useCallback(() => {
    setQuery("");
    setResults(null);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
          const json = (await res.json()) as { ok: boolean; data?: SearchResults };
          if (json.ok && json.data) {
            setResults(json.data);
          } else {
            setResults({ messages: [], reviews: [] });
          }
        } catch {
          setResults({ messages: [], reviews: [] });
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && query.length > 0) {
        clear();
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [clear, query]);

  function navigate(href: string) {
    clear();
    void router.push(href);
  }

  const showPanel = query.length >= 2;
  const hasMessages = (results?.messages.length ?? 0) > 0;
  const hasReviews = (results?.reviews.length ?? 0) > 0;
  const noResults = results !== null && !hasMessages && !hasReviews;

  return (
    <div className={s.searchWrap}>
      <div className={s.inputWrap}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută…"
          className={s.input}
          aria-label="Caută mesaje și recenzii"
          autoComplete="off"
          spellCheck={false}
        />
        {query.length > 0 && (
          <button type="button" className={s.clearBtn} onClick={clear} aria-label="Șterge căutarea">
            ×
          </button>
        )}
      </div>
      {showPanel && (
        <div className={s.results} role="region" aria-label="Rezultate căutare">
          {loading && <div className={s.statusText}>Se caută…</div>}
          {!loading && noResults && <div className={s.statusText}>Niciun rezultat</div>}
          {!loading && hasMessages && (
            <div className={s.section}>
              <div className={s.sectionLabel}>Mesaje</div>
              {results!.messages.map((m) => (
                <button key={m.id} type="button" className={s.resultItem} onClick={() => navigate(`/admin/inbox/${m.id}`)}>
                  <span className={s.itemName}>{m.name}</span>
                  <span className={s.itemSub}>{m.email}{m.preview ? ` — ${m.preview}` : ""}</span>
                </button>
              ))}
            </div>
          )}
          {!loading && hasMessages && hasReviews && <div className={s.divider} aria-hidden="true" />}
          {!loading && hasReviews && (
            <div className={s.section}>
              <div className={s.sectionLabel}>Recenzii</div>
              {results!.reviews.map((r) => (
                <button key={r.id} type="button" className={s.resultItem} onClick={() => navigate(`/admin/reviews?highlight=${r.id}`)}>
                  <span className={s.itemName}>{r.name}{" — "}{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className={s.itemSub}>{r.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### `components/admin/AdminInstallButton.tsx`

```tsx
// components/admin/AdminInstallButton.tsx
// Buton „Instalează aplicația" pentru PWA admin.

import { useEffect, useState } from "react";
import * as s from "../../styles/admin/layout.css";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export default function AdminInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isInStandalone()) { setInstalled(true); return; }
    setIos(isIos());
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setInstalled(true); setPrompt(null); });
    return () => { window.removeEventListener("beforeinstallprompt", handler); };
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") { setInstalled(true); setPrompt(null); }
  }

  if (installed) return null;
  if (prompt) {
    return (
      <button type="button" onClick={() => void handleInstall()} className={s.installBtn}>
        ↓ Instalează aplicația
      </button>
    );
  }
  if (ios) {
    return (
      <div className={s.installIosHint}>
        Instalează: apasă <span aria-label="Share">⎙</span> → <strong>Adaugă pe ecranul principal</strong>
      </div>
    );
  }
  return null;
}
```

---

### `styles/admin/layout.css.ts`

```ts
// styles/admin/layout.css.ts

import { style } from "@vanilla-extract/css";
import { themeClassDark, vars } from "../theme.css";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const wrapper = style({
  display: "flex",
  minHeight: "100vh",
  fontFamily: FONT,
});

export const sidebar = style({
  width: "232px",
  flexShrink: 0,
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  borderRight: `1px solid ${vars.color.border}`,
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 100,
  height: "100vh",
  overflowY: "auto",
  transition: "transform 300ms ease",
  "@media": {
    "screen and (max-width: 767px)": {
      zIndex: 300,
      transform: "translateX(-100%)",
      overflow: "visible",
    },
  },
});

export const sidebarOpen = style({
  "@media": {
    "screen and (max-width: 767px)": {
      transform: "translateX(0)",
    },
  },
});

export const overlay = style({
  position: "fixed",
  inset: 0,
  backgroundColor: vars.color.overlay,
  zIndex: 200,
});

export const sidebarTab = style({
  display: "none",
  "@media": {
    "screen and (max-width: 767px)": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: "50%",
      right: "-28px",
      transform: "translateY(-50%)",
      width: "28px",
      height: "56px",
      backgroundColor: vars.color.primary,
      border: "none",
      borderRadius: "0 56px 56px 0",
      color: vars.color.primaryContrast,
      cursor: "pointer",
      zIndex: 301,
      padding: 0,
      boxShadow: "3px 0 10px rgba(0,0,0,0.25)",
    },
  },
});

export const brand = style({
  padding: "20px 18px 16px",
  borderBottom: `1px solid ${vars.color.border}`,
  marginBottom: "4px",
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  textDecoration: "none",
  cursor: "pointer",
});

export const brandName = style({
  fontWeight: vars.typography.weight.bold,
  fontSize: "15px",
  color: vars.color.text,
  letterSpacing: "-0.01em",
});

export const brandSub = style({
  fontSize: "10px",
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
});

export const nav = style({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  padding: "8px 10px",
  flex: 1,
});

export const navLink = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: "9px 10px",
  borderRadius: "7px",
  color: vars.color.muted,
  textDecoration: "none",
  fontSize: "13.5px",
  fontWeight: vars.typography.weight.medium,
  transition: `background-color ${vars.motion.normal}, color ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.surface,
      color: vars.color.text,
    },
  },
});

export const navLinkActive = style({
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.primaryHover,
    },
  },
});

export const navIcon = style({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  opacity: 0.75,
  selectors: {
    [`${navLinkActive} &`]: { opacity: 1 },
  },
});

export const navBadge = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "auto",
  minWidth: "19px",
  height: "19px",
  padding: "0 5px",
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  borderRadius: vars.radius.md,
  fontSize: "11px",
  fontWeight: vars.typography.weight.bold,
});

export const installBtn = style({
  margin: "0 10px 8px",
  padding: "9px 10px",
  backgroundColor: "rgba(85,97,242,0.15)",
  border: "1px solid rgba(85,97,242,0.35)",
  color: vars.color.text,
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "7px",
  transition: `background-color ${vars.motion.normal}, color ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(85,97,242,0.28)",
      color: vars.color.text,
    },
  },
});

export const installIosHint = style({
  margin: "0 10px 8px",
  padding: "9px 10px",
  backgroundColor: vars.color.surfaceHover,
  border: `1px solid ${vars.color.border}`,
  borderRadius: "7px",
  fontSize: "11.5px",
  color: vars.color.muted,
  lineHeight: 1.5,
});

export const logoutBtn = style({
  flex: 1,
  padding: "9px 10px",
  backgroundColor: "transparent",
  border: "none",
  color: vars.color.muted,
  fontSize: "13.5px",
  fontWeight: vars.typography.weight.medium,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "7px",
  transition: `color ${vars.motion.normal}, background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover": {
      color: "#ff7070",
      backgroundColor: "rgba(255,112,112,0.1)",
    },
  },
});

export const sidebarFooter = style({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  margin: "0 10px",
  padding: "12px 0 16px",
  borderTop: `1px solid ${vars.color.border}`,
});

// ── Buton Șterge — stil unitar pentru toate paginile admin ──
export const deleteBtn = style({
  padding: "6px 12px",
  backgroundColor: vars.color.danger,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: vars.radius.sm,
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  transition: `opacity ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { opacity: 0.88 },
    "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
  },
});

export const main = style({
  flex: 1,
  minWidth: 0,
  marginLeft: "232px",
  padding: "32px 36px",
  backgroundColor: "#f2f3f7",
  selectors: {
    [`.${themeClassDark} &`]: { backgroundColor: vars.color.bg },
  },
  "@media": {
    "screen and (max-width: 767px)": {
      marginLeft: 0,
      padding: "24px 16px 24px",
    },
  },
});
```

---

### `styles/admin/login.css.ts`

```ts
// styles/admin/login.css.ts

import { style } from "@vanilla-extract/css";
import { themeClassDark, vars } from "../theme.css";

export const wrapper = style({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "#f4f5f7",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  selectors: {
    [`.${themeClassDark} &`]: { backgroundColor: vars.color.bg },
  },
});

export const card = style({
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.lg,
  padding: "40px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
});

export const logo = style({
  margin: "0 0 4px",
  fontSize: "22px",
  fontWeight: vars.typography.weight.bold,
  color: vars.color.text,
  textAlign: "center",
  letterSpacing: "-0.02em",
});

export const subtitle = style({
  margin: "0 0 32px",
  fontSize: "13px",
  color: vars.color.muted,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
});

export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "16px",
});

export const label = style({
  fontSize: "13px",
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const input = style({
  padding: "10px 14px",
  border: "1.5px solid #d8d8e0",
  borderRadius: vars.radius.sm,
  fontSize: "15px",
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: "none",
  transition: `border-color ${vars.motion.normal}`,
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: {
    "&:focus": { borderColor: vars.color.primary },
  },
});

export const rememberRow = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "16px",
});

export const checkbox = style({
  width: "16px",
  height: "16px",
  cursor: "pointer",
  accentColor: vars.color.primary,
  flexShrink: 0,
});

export const rememberLabel = style({
  fontSize: "13.5px",
  color: vars.color.muted,
  cursor: "pointer",
  userSelect: "none",
});

export const errorBox = style({
  padding: "10px 14px",
  backgroundColor: "#fff0f0",
  border: "1px solid #f5c6c6",
  borderRadius: vars.radius.sm,
  fontSize: "14px",
  color: "#b00020",
  marginBottom: "16px",
});

export const button = style({
  width: "100%",
  padding: "12px",
  backgroundColor: vars.color.primary,
  color: vars.color.primaryContrast,
  border: "none",
  borderRadius: vars.radius.sm,
  fontSize: "15px",
  fontWeight: vars.typography.weight.semibold,
  cursor: "pointer",
  marginTop: "8px",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: vars.color.primaryHover },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});
```

---

### `styles/admin/search.css.ts`

```ts
// styles/admin/search.css.ts

import { style } from "@vanilla-extract/css";
import { vars } from "../theme.css";

export const searchWrap = style({
  padding: "8px 10px 10px",
  borderBottom: `1px solid ${vars.color.border}`,
});

export const inputWrap = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const input = style({
  width: "100%",
  padding: "7px 28px 7px 10px",
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: "7px",
  color: vars.color.text,
  fontSize: "13px",
  lineHeight: "1.4",
  outline: "none",
  transition: `border-color ${vars.motion.normal}, background-color ${vars.motion.normal}`,
  selectors: {
    "&::placeholder": { color: vars.color.muted },
    "&:focus": { borderColor: vars.color.primary, backgroundColor: vars.color.surfaceHover },
    "&::-webkit-search-cancel-button": { display: "none" },
  },
});

export const clearBtn = style({
  position: "absolute",
  right: "7px",
  background: "none",
  border: "none",
  color: vars.color.muted,
  cursor: "pointer",
  fontSize: vars.typography.size.md,
  lineHeight: "1",
  padding: "0",
  display: "flex",
  alignItems: "center",
  transition: `color ${vars.motion.fast}`,
  selectors: {
    "&:hover": { color: vars.color.text },
  },
});

export const results = style({
  marginTop: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});

export const statusText = style({
  padding: "4px 4px",
  fontSize: vars.typography.size.xs,
  color: vars.color.muted,
  fontStyle: "italic",
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
});

export const sectionLabel = style({
  fontSize: "10px",
  fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: vars.color.muted,
  padding: "6px 6px 3px",
});

export const resultItem = style({
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  padding: "6px 8px",
  borderRadius: vars.radius.xs,
  cursor: "pointer",
  transition: `background-color ${vars.motion.fast}`,
  selectors: {
    "&:hover": { backgroundColor: vars.color.surfaceActive },
    "&:focus-visible": { outline: `2px solid ${vars.color.focus}`, outlineOffset: "1px" },
  },
});

export const itemName = style({
  display: "block",
  fontSize: "12.5px",
  fontWeight: vars.typography.weight.semibold,
  color: vars.color.text,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const itemSub = style({
  display: "block",
  fontSize: "11.5px",
  color: vars.color.muted,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  marginTop: "1px",
});

export const divider = style({
  height: "1px",
  backgroundColor: vars.color.border,
  margin: "4px 0",
});
```

---

### `public/admin-manifest.json`

```json
{
  "name": "ZephiraEvents Admin",
  "short_name": "ZE Admin",
  "description": "Dashboard admin ZephiraEvents",
  "start_url": "/admin/inbox",
  "scope": "/admin/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#12122a",
  "theme_color": "#12122a",
  "icons": [
    { "src": "/icons/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/android-chrome-256x256.png", "sizes": "256x256", "type": "image/png", "purpose": "any" },
    { "src": "/icons/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/android-chrome-maskable-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/android-chrome-maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

### `public/admin-sw.js`

```js
// public/admin-sw.js
// Service worker admin — scope izolat /admin/, cache minimal.

const CACHE = "ze-admin-v1";
const PRECACHE = ["/admin/login", "/admin/inbox"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith("/admin")) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && event.request.method === "GET") {
          const clone = res.clone();
          void caches.open(CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});
```

---

## 3. INBOX

### `pages/admin/inbox/index.tsx`

```tsx
// pages/admin/inbox/index.tsx
// Lista mesaje admin — contact + oferte din data/messages/, ordonate desc.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactElement, useCallback, useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { getFile, listFiles } from "../../../lib/admin/github";
import * as s from "../../../styles/admin/inbox.css";
import type { MessageJson } from "../../api/admin/messages/index";

type Props = {
  messages: MessageJson[];
  unreadCount: number;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const TYPE_LABEL: Record<MessageJson["type"], string> = {
  contact: "Contact",
  offer: "Ofertă",
};

function typeBadgeClass(t: MessageJson["type"]): string {
  return t === "offer" ? s.typeBadgeOffer : s.typeBadgeContact;
}

function AdminInboxPage({ messages }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm("Ștergi acest mesaj?")) return;
      setDeleting(id);
      setDeleteError(null);
      try {
        const res = await fetch(`/api/admin/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete" }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setDeleteError(data.error ?? "Eroare la ștergere.");
          return;
        }
        await router.replace(router.asPath);
      } catch {
        setDeleteError("Eroare de rețea la ștergere.");
      } finally {
        setDeleting(null);
      }
    },
    [router],
  );

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Inbox{messages.length > 0 ? ` (${messages.length})` : ""}</h1>
      </div>
      {deleteError && <p className={s.syncStatusError}>{deleteError}</p>}
      {messages.length === 0 ? (
        <p className={s.empty}>Nu există mesaje.</p>
      ) : (
        <div className={s.list}>
          {messages.map((msg) => {
            const isNew = !msg.read;
            const preview = msg.message ?? msg.eventType ?? "—";
            return (
              <div key={msg.id} className={s.itemWrap}>
                <Link
                  href={`/admin/inbox/${msg.id}`}
                  className={`${s.item}${isNew ? ` ${s.itemUnread}` : ""}`}
                >
                  <div className={s.itemTop}>
                    <span className={`${s.itemName}${isNew ? ` ${s.itemNameUnread}` : ""}`}>{msg.name}</span>
                    <span className={typeBadgeClass(msg.type)}>{TYPE_LABEL[msg.type]}</span>
                    <span className={isNew ? s.statusBadgeNew : s.statusBadgeRead}>{isNew ? "Nou" : "Citit"}</span>
                    <span className={s.itemDate}>{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className={s.itemEmail}>{msg.email}</div>
                  <div className={s.itemPreview}>{preview.slice(0, 120)}</div>
                </Link>
                <button
                  type="button"
                  className={s.deleteBtn}
                  onClick={(e) => void handleDelete(e, msg.id)}
                  disabled={deleting === msg.id}
                  title="Șterge mesaj"
                  aria-label="Șterge mesaj"
                >
                  {deleting === msg.id ? "..." : "Șterge"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

AdminInboxPage.getLayout = function getLayout(page: ReactElement) {
  const { unreadCount } = page.props as Props;
  return <AdminLayout unreadCount={unreadCount}>{page}</AdminLayout>;
};

export default AdminInboxPage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  try {
    const entries = await listFiles("data/messages");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );
    const all = await Promise.all(
      jsonFiles.map(async (entry) => {
        const { content } = await getFile(entry.path);
        return JSON.parse(content) as MessageJson;
      }),
    );
    const messages = all
      .filter((m) => !m.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const unreadCount = messages.filter((m) => !m.read).length;
    return { props: { messages, unreadCount } };
  } catch (err) {
    console.error("[admin/inbox] GitHub fetch error:", err);
    return { props: { messages: [], unreadCount: 0 } };
  }
};
```

---

### `pages/admin/inbox/[id].tsx`

```tsx
// pages/admin/inbox/[id].tsx
// Detaliu mesaj din data/messages/ + buton mailto: pentru răspuns.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { getFile, listFiles, updateFile } from "../../../lib/admin/github";
import { sanitizeHtml } from "../../../lib/admin/sanitize";
import * as s from "../../../styles/admin/message.css";
import type { MessageJson } from "../../api/admin/messages/index";

interface OfferExtra {
  address?: string;
  whatsapp?: boolean;
  details?: string;
  eventType?: string;
  eventDate?: string;
  guests?: number;
  lodging?: { kind?: string; rooms?: string; nights?: string; notes?: string };
  music?: { kind?: string; prefs?: string; genre?: string; interval?: string };
  photoVideo?: { kind?: string; package?: string; duration?: string; deliverables?: string };
}

type FullMessage = MessageJson & OfferExtra;
type Props = { message: FullMessage };

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function typeBadgeClass(t: MessageJson["type"]): string {
  return t === "offer" ? s.typeBadgeOffer : s.typeBadgeContact;
}

const TYPE_LABEL: Record<MessageJson["type"], string> = { contact: "Contact", offer: "Ofertă" };

function buildMailto(msg: FullMessage): string {
  const subject = msg.type === "offer"
    ? encodeURIComponent(`Re: Ofertă ${msg.eventType ?? ""} — ${msg.name}`)
    : encodeURIComponent(`Re: Mesaj contact — ${msg.name}`);
  return `mailto:${msg.email}?subject=${subject}`;
}

function AdminMessagePage({ message }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const mailtoHref = buildMailto(message);
  return (
    <>
      <Link href="/admin/inbox" className={s.backLink}>← Inbox</Link>
      <div className={s.header}>
        <h1 className={s.senderName}>{message.name}</h1>
        <div className={s.headerBadges}>
          <span className={typeBadgeClass(message.type)}>{TYPE_LABEL[message.type]}</span>
          <span className={message.read ? s.statusBadgeRead : s.statusBadgeNew}>
            {message.read ? "Citit" : "Nou"}
          </span>
          <span style={{ fontSize: "12px", color: "#aaa" }}>{fmt(message.createdAt)}</span>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.detailGrid}>
          <span className={s.detailLabel}>Email</span>
          <span className={s.detailValue}>{message.email}</span>
          {message.phone && (<><span className={s.detailLabel}>Telefon</span><span className={s.detailValue}>{message.phone}</span></>)}
          {message.type === "offer" && (
            <>
              {message.eventType && (<><span className={s.detailLabel}>Tip eveniment</span><span className={s.detailValue}>{message.eventType}</span></>)}
              {message.eventDate && (<><span className={s.detailLabel}>Dată eveniment</span><span className={s.detailValue}>{message.eventDate}</span></>)}
              {message.guests != null && (<><span className={s.detailLabel}>Participanți</span><span className={s.detailValue}>{message.guests}</span></>)}
              {message.address && (<><span className={s.detailLabel}>Adresă</span><span className={s.detailValue}>{message.address}</span></>)}
              {message.lodging?.kind && (
                <><span className={s.detailLabel}>Cazare</span>
                <span className={s.detailValue}>
                  {message.lodging.kind}
                  {message.lodging.rooms ? `, ${message.lodging.rooms} camere` : ""}
                  {message.lodging.nights ? `, ${message.lodging.nights} nopți` : ""}
                </span></>
              )}
              {message.music?.kind && (
                <><span className={s.detailLabel}>Muzică</span>
                <span className={s.detailValue}>{message.music.kind}{message.music.genre ? ` — ${message.music.genre}` : ""}</span></>
              )}
              {message.photoVideo?.kind && (<><span className={s.detailLabel}>Foto/Video</span><span className={s.detailValue}>{message.photoVideo.kind}</span></>)}
              {message.details && (
                <><span className={s.detailLabel}>Detalii</span>
                <span className={s.detailValue} dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.details) }} /></>
              )}
            </>
          )}
        </div>
        {message.message && (
          <div style={{ marginTop: "16px" }}>
            <div className={s.sectionTitle}>Mesaj</div>
            <p className={s.messageBody} dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.message) }} />
          </div>
        )}
      </div>
      <div className={s.card}>
        <div className={s.sectionTitle} style={{ marginBottom: "16px" }}>Răspunde</div>
        <a href={mailtoHref} className={s.submitBtn} style={{ display: "inline-block" }}>
          Deschide client email →
        </a>
      </div>
    </>
  );
}

AdminMessagePage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminMessagePage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, params }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  const id = typeof params?.["id"] === "string" ? params["id"] : "";
  if (!id) return { notFound: true };
  try {
    const entries = await listFiles("data/messages");
    const entry = entries.find((e) => e.name === `${id}.json`);
    if (!entry) return { notFound: true };
    const { content, sha } = await getFile(entry.path);
    const message = JSON.parse(content) as FullMessage;
    if (!message.read) {
      const updated = { ...message, read: true };
      await updateFile(entry.path, JSON.stringify(updated, null, 2), sha);
      return { props: { message: updated } };
    }
    return { props: { message } };
  } catch (err) {
    console.error("[admin/inbox/[id]] SSR error:", err);
    return { notFound: true };
  }
};
```

---

### `pages/api/admin/messages/index.ts`

```ts
// pages/api/admin/messages/index.ts
// GET — lista mesajelor din data/messages/, sortate descrescător după createdAt.

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, listFiles } from "../../../../lib/admin/github";
import { errorResponse } from "../../../../lib/admin/response";

export interface MessageJson {
  id: string;
  type: "contact" | "offer";
  name: string;
  email: string;
  phone: string | null;
  message?: string;
  eventType?: string;
  eventDate?: string;
  guests?: number;
  createdAt: string;
  read: boolean;
  deleted?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json(errorResponse("Method Not Allowed"));
  }
  try {
    const entries = await listFiles("data/messages");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );
    const messages = await Promise.all(
      jsonFiles.map(async (entry) => {
        const { content } = await getFile(entry.path);
        return JSON.parse(content) as MessageJson;
      }),
    );
    const sorted = messages
      .filter((m) => !m.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.status(200).json({ ok: true, data: sorted, total: sorted.length });
  } catch (err) {
    console.error("[admin/messages] list error:", err);
    return res.status(500).json(errorResponse("Eroare la citirea mesajelor."));
  }
}
```

---

### `pages/api/admin/messages/[id].ts`

```ts
// pages/api/admin/messages/[id].ts
// GET — detaliu mesaj; marchează read: true.
// PATCH { action: "delete" } — soft delete.

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminSession } from "../../../../lib/admin/auth";
import { getFile, listFiles, updateFile } from "../../../../lib/admin/github";
import { errorResponse } from "../../../../lib/admin/response";
import type { MessageJson } from "./index";

async function findMessageFile(id: string): Promise<{ path: string; sha: string; msg: MessageJson } | null> {
  const entries = await listFiles("data/messages");
  const entry = entries.find((e) => e.name === `${id}.json`);
  if (!entry) return null;
  const { content, sha } = await getFile(entry.path);
  const msg = JSON.parse(content) as MessageJson;
  return { path: entry.path, sha, msg };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminSession(req)) {
    return res.status(401).json(errorResponse("Neautorizat."));
  }
  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json(errorResponse("ID invalid."));
  }

  if (req.method === "GET") {
    try {
      const found = await findMessageFile(id);
      if (!found) return res.status(404).json(errorResponse("Mesaj negăsit."));
      const { path, sha, msg } = found;
      if (!msg.read) {
        const updated = { ...msg, read: true };
        await updateFile(path, JSON.stringify(updated, null, 2), sha);
        return res.status(200).json({ ok: true, data: updated });
      }
      return res.status(200).json({ ok: true, data: msg });
    } catch (err) {
      console.error("[admin/messages/[id]] GET error:", err);
      return res.status(500).json(errorResponse("Eroare la citirea mesajului."));
    }
  }

  if (req.method === "PATCH") {
    const body = req.body as { action?: unknown };
    if (body.action !== "delete") {
      return res.status(400).json(errorResponse("Acțiune invalidă."));
    }
    try {
      const found = await findMessageFile(id);
      if (!found) return res.status(404).json(errorResponse("Mesaj negăsit."));
      const { path, sha, msg } = found;
      const updated = { ...msg, deleted: true };
      await updateFile(path, JSON.stringify(updated, null, 2), sha);
      return res.status(200).json({ ok: true, data: updated });
    } catch (err) {
      console.error("[admin/messages/[id]] PATCH error:", err);
      return res.status(500).json(errorResponse("Eroare la ștergerea mesajului."));
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json(errorResponse("Method Not Allowed"));
}
```

---

### `styles/admin/inbox.css.ts`

```ts
// styles/admin/inbox.css.ts

import { style } from "@vanilla-extract/css";
import { themeClassDark, vars } from "../theme.css";

export const pageHeader = style({
  display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap",
});
export const pageTitle = style({
  margin: 0, fontSize: "22px", fontWeight: vars.typography.weight.bold,
  color: vars.color.text, letterSpacing: "-0.02em",
});
export const syncArea = style({ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" });
export const syncBtn = style({
  padding: "7px 16px", backgroundColor: vars.color.primary, color: vars.color.primaryContrast,
  border: "none", borderRadius: vars.radius.sm, fontSize: "13px",
  fontWeight: vars.typography.weight.semibold, cursor: "pointer",
  transition: `background-color ${vars.motion.normal}, opacity ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: vars.color.primaryHover },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});
export const syncBtnLoading = style({ opacity: 0.75 });
export const syncStatus = style({ fontSize: "12.5px", color: "#16a34a", fontWeight: vars.typography.weight.medium });
export const syncStatusError = style({ fontSize: "12.5px", color: "#dc2626", fontWeight: vars.typography.weight.medium });
export const empty = style({ color: vars.color.muted, fontSize: "15px", padding: "24px 0" });
export const list = style({ display: "flex", flexDirection: "column", gap: "6px" });
export const itemWrap = style({
  position: "relative", display: "flex", alignItems: "stretch",
  borderRadius: vars.radius.md, overflow: "hidden",
  border: `1.5px solid ${vars.color.border}`,
  transition: `border-color ${vars.motion.normal}, box-shadow ${vars.motion.normal}`,
  selectors: { "&:hover": { borderColor: "#b0b4f0", boxShadow: "0 2px 10px rgba(85,97,242,0.08)" } },
});
export const item = style({
  display: "block", flex: 1, minWidth: 0, padding: "14px 90px 14px 16px",
  backgroundColor: vars.color.surface, textDecoration: "none", color: "inherit",
});
export const itemUnread = style({
  borderLeft: `3px solid ${vars.color.primary}`,
  backgroundColor: "#fafafe",
  selectors: { [`.${themeClassDark} &`]: { backgroundColor: vars.color.surfaceActive } },
});
export const deleteBtn = style({
  position: "absolute", top: 14, right: 16, padding: "4px 10px",
  backgroundColor: vars.color.danger, color: vars.color.primaryContrast,
  border: "none", borderRadius: vars.radius.sm, fontSize: "12px",
  fontWeight: vars.typography.weight.semibold, cursor: "pointer",
  transition: `opacity ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { opacity: 0.88 },
    "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
  },
});
export const itemTop = style({ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" });
export const itemName = style({ fontWeight: vars.typography.weight.semibold, fontSize: vars.typography.size.sm, color: vars.color.text, marginRight: "auto" });
export const itemNameUnread = style({ fontWeight: vars.typography.weight.bold });
export const itemDate = style({ fontSize: vars.typography.size.xs, color: vars.color.muted, flexShrink: 0 });
export const itemEmail = style({ fontSize: "12.5px", color: vars.color.muted, marginBottom: "6px" });
export const itemPreview = style({ fontSize: "13px", color: vars.color.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

const badgeBase = style({
  display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: "20px",
  fontSize: "11px", fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0,
});
export const typeBadgeContact = style([badgeBase, { backgroundColor: "#e8f0fe", color: "#3b5bdb" }]);
export const typeBadgeOffer = style([badgeBase, { backgroundColor: "#fff4e0", color: "#d97706" }]);
export const typeBadgeEmail = style([badgeBase, { backgroundColor: "#f0f7ff", color: "#0369a1" }]);
export const statusBadgeNew = style([badgeBase, { backgroundColor: "#fff0f0", color: "#dc2626" }]);
export const statusBadgeRead = style([badgeBase, { backgroundColor: "#f1f3f5", color: "#64748b" }]);
export const statusBadgeReplied = style([badgeBase, { backgroundColor: "#f0fdf4", color: "#16a34a" }]);
export const statusBadgeArchived = style([badgeBase, { backgroundColor: "#f5f5f5", color: "#9ca3af" }]);

export const pagination = style({ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px", flexWrap: "wrap" });
export const paginationBtn = style({
  padding: "7px 16px", backgroundColor: "#f1f3f5", color: vars.color.text,
  border: `1.5px solid ${vars.color.border}`, borderRadius: vars.radius.sm,
  fontSize: "13px", fontWeight: vars.typography.weight.semibold, cursor: "pointer",
  textDecoration: "none", display: "inline-flex", alignItems: "center",
  transition: `background-color ${vars.motion.normal}, border-color ${vars.motion.normal}`,
  selectors: { "&:hover": { backgroundColor: "#e8e8f0", borderColor: "#b0b4f0" } },
});
export const paginationInfo = style({ fontSize: "13px", color: vars.color.muted });
```

---

### `styles/admin/message.css.ts`

```ts
// styles/admin/message.css.ts

import { style } from "@vanilla-extract/css";
import { vars } from "../theme.css";

export const backLink = style({
  display: "inline-flex", alignItems: "center", gap: "6px",
  fontSize: "13px", color: vars.color.primary, textDecoration: "none",
  marginBottom: "20px", fontWeight: vars.typography.weight.medium,
  selectors: { "&:hover": { textDecoration: "underline" } },
});
export const header = style({ marginBottom: "24px" });
export const senderName = style({
  margin: "0 0 8px", fontSize: "22px", fontWeight: vars.typography.weight.bold,
  color: vars.color.text, letterSpacing: "-0.02em",
});
export const headerBadges = style({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" });

const badgeBase = style({
  display: "inline-flex", alignItems: "center", padding: "3px 10px",
  borderRadius: "20px", fontSize: "11px", fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase", letterSpacing: "0.04em",
});
export const typeBadgeContact = style([badgeBase, { backgroundColor: "#e8f0fe", color: "#3b5bdb" }]);
export const typeBadgeOffer = style([badgeBase, { backgroundColor: "#fff4e0", color: "#d97706" }]);
export const typeBadgeEmail = style([badgeBase, { backgroundColor: "#f0f7ff", color: "#0369a1" }]);
export const statusBadgeNew = style([badgeBase, { backgroundColor: "#fff0f0", color: "#dc2626" }]);
export const statusBadgeRead = style([badgeBase, { backgroundColor: "#f1f3f5", color: "#64748b" }]);
export const statusBadgeReplied = style([badgeBase, { backgroundColor: "#f0fdf4", color: "#16a34a" }]);
export const statusBadgeArchived = style([badgeBase, { backgroundColor: "#f5f5f5", color: "#9ca3af" }]);

export const card = style({
  backgroundColor: vars.color.surface, border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md, padding: "20px", marginBottom: "16px",
});
export const detailGrid = style({
  display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px 16px", alignItems: "start",
});
export const detailLabel = style({
  fontSize: vars.typography.size.xs, fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: "2px",
});
export const detailValue = style({ fontSize: vars.typography.size.sm, color: vars.color.text, wordBreak: "break-word" });
export const messageBody = style({
  fontSize: vars.typography.size.sm, color: vars.color.text,
  lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
});
export const sectionTitle = style({
  margin: "0 0 12px", fontSize: vars.typography.size.sm, fontWeight: vars.typography.weight.bold,
  color: vars.color.muted, textTransform: "uppercase", letterSpacing: "0.07em",
});
export const replyCard = style({
  backgroundColor: "#f0f3ff", border: "1.5px solid #d4d9f7",
  borderRadius: vars.radius.sm, padding: "14px 16px", marginBottom: "10px",
});
export const replyMeta = style({ fontSize: "11.5px", color: vars.color.muted, marginBottom: "8px" });
export const replyText = style({ fontSize: vars.typography.size.sm, color: vars.color.text, lineHeight: 1.6, whiteSpace: "pre-wrap" });
export const formField = style({ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" });
export const formLabel = style({
  fontSize: vars.typography.size.xs, fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted, textTransform: "uppercase", letterSpacing: "0.06em",
});
export const formInput = style({
  padding: "9px 12px", border: "1.5px solid #d8d8e8", borderRadius: "7px",
  fontSize: vars.typography.size.sm, color: vars.color.text, backgroundColor: vars.color.surface,
  outline: "none", transition: `border-color ${vars.motion.normal}`,
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: { "&:focus": { borderColor: vars.color.primary } },
});
export const formTextarea = style({
  padding: "9px 12px", border: "1.5px solid #d8d8e8", borderRadius: "7px",
  fontSize: vars.typography.size.sm, color: vars.color.text, backgroundColor: vars.color.surface,
  outline: "none", resize: "vertical", minHeight: "120px", lineHeight: 1.55, fontFamily: "inherit",
  transition: `border-color ${vars.motion.normal}`,
  WebkitTextFillColor: vars.color.text,
  WebkitBoxShadow: `0 0 0px 1000px ${vars.color.surface} inset`,
  selectors: { "&:focus": { borderColor: vars.color.primary } },
});
export const submitBtn = style({
  padding: "10px 20px", backgroundColor: vars.color.primary, color: vars.color.primaryContrast,
  border: "none", borderRadius: "7px", fontSize: vars.typography.size.sm,
  fontWeight: vars.typography.weight.semibold, cursor: "pointer",
  transition: `background-color ${vars.motion.normal}`,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: vars.color.primaryHover },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});
export const successMsg = style({
  padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
  borderRadius: "7px", fontSize: "13.5px", color: "#15803d", marginBottom: "12px",
});
export const errorMsg = style({
  padding: "10px 14px", backgroundColor: "#fff0f0", border: "1px solid #fecaca",
  borderRadius: "7px", fontSize: "13.5px", color: "#b91c1c", marginBottom: "12px",
});
```

---

## 4. LOGIN PAGE

### `pages/admin/login.tsx`

```tsx
// pages/admin/login.tsx
// Pagina de autentificare admin — fără Layout public (Header/Footer).

import Head from "next/head";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import * as s from "../../styles/admin/login.css";

function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/admin-sw.js", { scope: "/admin/" })
        .catch(() => {/* non-fatal */});
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (res.ok) {
        await router.replace("/admin");
      } else {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? "Eroare la autentificare.");
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/admin-manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#12122a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ZE Admin" />
      </Head>
      <div className={s.wrapper}>
        <div className={s.card}>
          <h1 className={s.logo}>ZephiraEvents</h1>
          <p className={s.subtitle}>Dashboard admin</p>
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className={s.errorBox} role="alert">{error}</div>}
            <div className={s.field}>
              <label htmlFor="adm-email" className={s.label}>Email</label>
              <input id="adm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={s.input} autoComplete="username" required disabled={loading} />
            </div>
            <div className={s.field}>
              <label htmlFor="adm-password" className={s.label}>Parolă</label>
              <input id="adm-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className={s.input} autoComplete="current-password" required disabled={loading} />
            </div>
            <div className={s.rememberRow}>
              <input id="adm-remember" type="checkbox" checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)} disabled={loading} className={s.checkbox} />
              <label htmlFor="adm-remember" className={s.rememberLabel}>Ține-mă minte 30 de zile</label>
            </div>
            <button type="submit" disabled={loading} className={s.button}>
              {loading ? "Se autentifică..." : "Intră în admin"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

AdminLoginPage.getLayout = (page: ReactElement) => page;
export default AdminLoginPage;
```

---

## 5. PAYMENTS / STRIPE / KONCEPTID

### `types/konceptid.ts`

```ts
export type ContractJson = {
  clientName: string;
  plan: string;
  priceMonthly: number;
  currency: string;
  startDate: string;
  nextBillingDate: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeProductId: string;
  stripePriceId: string;
  paymentMethod: string;
  status: "active" | "cancelled" | "paused";
  billingCycle: "monthly" | "biannual" | "annual";
  paymentLinkMonthly: string;
  paymentLinkBiannual: string;
  paymentLinkAnnual: string;
};

export type InvoiceJson = {
  id: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "void";
  dueDate: string;
  paidAt: string | null;
  invoicePdfUrl: string | null;
  hostedInvoiceUrl: string | null;
  createdAt: string;
};
```

---

### `pages/api/konceptid/stripe-webhook.ts`

> **Actualizat 2026-06-13 (PR #161):** adăugat filtru `STRIPE_CUSTOMER_ID` după `constructEvent()` — previne salvarea facturilor aparținând altor clienți de pe același cont Stripe.

```ts
// pages/api/konceptid/stripe-webhook.ts
// PUBLIC — fără verifyAdminSession; securitate exclusiv prin semnătura Stripe.
// bodyParser: false — Stripe necesită raw Buffer.

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createFile } from "../../../lib/admin/github";
import type { InvoiceJson } from "../../../types/konceptid";

export const config = {
  api: { bodyParser: false },
};

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let rawBody: Buffer;
  try {
    rawBody = await getRawBody(req);
  } catch {
    return res.status(400).json({ error: "Failed to read request body" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return res.status(400).json({ error: message });
  }

  try {
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;

      // Filtru cross-client: Stripe trimite invoice.paid la TOATE endpoint-urile de pe cont.
      // Dacă sunt mai mulți clienți pe același cont Stripe (ex: FraternitaCSS + ZephiraEvents),
      // fiecare site trebuie să ignore facturile care nu îi aparțin.
      const allowedCustomerId = process.env.STRIPE_CUSTOMER_ID;
      if (allowedCustomerId && invoice.customer !== allowedCustomerId) {
        return res.status(200).json({ received: true });
      }

      const invoiceJson: InvoiceJson = {
        id: invoice.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: "paid",
        dueDate: invoice.due_date
          ? new Date(invoice.due_date * 1000).toISOString()
          : new Date().toISOString(),
        paidAt: invoice.status_transitions.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : new Date().toISOString(),
        invoicePdfUrl: invoice.invoice_pdf ?? null,
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
        createdAt: new Date().toISOString(),
      };
      await createFile(
        `data/konceptid/invoices/invoice-${Date.now()}.json`,
        JSON.stringify(invoiceJson, null, 2),
      );
    }
    return res.status(200).json({ received: true });
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
}
```

---

### `pages/admin/konceptid.tsx`

```tsx
// pages/admin/konceptid.tsx
// Dashboard KonceptID — contract activ + istoric facturi.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { ReactElement } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../lib/admin/auth";
import { getFile, listFiles } from "../../lib/admin/github";
import * as s from "../../styles/admin/konceptid.css";
import type { ContractJson, InvoiceJson } from "../../types/konceptid";

type Props = {
  contract: ContractJson | null;
  invoices: InvoiceJson[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function statusLabel(status: ContractJson["status"]): string {
  const map: Record<ContractJson["status"], string> = { active: "Activ", cancelled: "Anulat", paused: "Pausat" };
  return map[status];
}

function invoiceStatusLabel(status: InvoiceJson["status"]): string {
  const map: Record<InvoiceJson["status"], string> = { paid: "Plătit", unpaid: "Neplătit", void: "Anulat" };
  return map[status];
}

function invoiceStatusClass(status: InvoiceJson["status"]): string {
  if (status === "paid") return `${s.invoiceStatus} ${s.invoicePaid}`;
  if (status === "unpaid") return `${s.invoiceStatus} ${s.invoiceUnpaid}`;
  return s.invoiceStatus;
}

export default function AdminKonceptIDPage({
  contract,
  invoices,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <h1 className={s.pageTitle}>KonceptID</h1>

      {contract === null ? (
        <p className={s.emptyState}>Nu există un contract activ pentru acest proiect.</p>
      ) : (
        <>
          {/* Contract activ */}
          <div className={s.section}>
            <p className={s.sectionTitle}>Contract activ</p>
            <div className={s.contractCard}>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Client</span>
                <span className={s.contractValue}>{contract.clientName}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Plan</span>
                <span className={s.contractValue}>{contract.plan}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Preț lunar</span>
                <span className={s.contractValue}>{contract.priceMonthly} {contract.currency}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Dată start</span>
                <span className={s.contractValue}>{formatDate(contract.startDate)}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Metodă plată</span>
                <span className={s.contractValue}>{contract.paymentMethod}</span>
              </div>
              <div className={s.contractField}>
                <span className={s.contractLabel}>Status</span>
                <span className={`${s.statusBadge} ${contract.status === "active" ? s.statusActive : s.statusCancelled}`}>
                  {statusLabel(contract.status)}
                </span>
              </div>
              <div className={s.contractDownloadRow}>
                <a
                  href="https://raw.githubusercontent.com/BurcsaMatei/ZephiraEvents/main/data/konceptid/contract_ZE.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.downloadContractLink}
                >
                  ↓ Descarcă contract
                </a>
              </div>
            </div>
          </div>

          {/* Următoarea factură */}
          {(() => {
            const targetDate = invoices.length === 0 ? contract.startDate : contract.nextBillingDate;
            const daysLeft = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000);
            const paymentLink =
              contract.billingCycle === "annual" ? contract.paymentLinkAnnual
              : contract.billingCycle === "biannual" ? contract.paymentLinkBiannual
              : contract.paymentLinkMonthly;
            return (
              <div className={s.billingCard}>
                <div className={s.billingDays}>{daysLeft}</div>
                <div>
                  <p className={s.contractValue}>
                    {formatDate(targetDate)} — {contract.priceMonthly} {contract.currency}
                  </p>
                  <p className={s.billingLabel}>
                    {invoices.length === 0
                      ? "zile până la prima factură"
                      : `${daysLeft === 1 ? "zi rămasă" : "zile rămase"} până la următoarea factură`}
                  </p>
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer" className={s.payNowBtn}>
                    Plătește acum
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Planuri disponibile */}
          <div className={s.section}>
            <p className={s.sectionTitle}>Planuri disponibile</p>
            <div className={s.plansGrid}>
              {/* Lunar */}
              <div className={`${s.planCard}${contract.billingCycle === "monthly" ? ` ${s.planCardActive}` : ""}`}>
                {contract.billingCycle === "monthly" && <span className={s.planCurrentBadge}>Plan curent</span>}
                <p className={s.planName}>Lunar</p>
                <p className={s.planPrice}>200 RON<span className={s.planPer}>/lună</span></p>
                <p className={s.planDiscount}>&nbsp;</p>
                <a href={contract.paymentLinkMonthly} target="_blank" rel="noopener noreferrer"
                  className={`${s.planBtn}${contract.billingCycle === "monthly" ? ` ${s.planBtnActive}` : ""}`}>
                  {contract.billingCycle === "monthly" ? "Plan curent" : "Alege"}
                </a>
              </div>
              {/* Bianual */}
              <div className={`${s.planCard}${contract.billingCycle === "biannual" ? ` ${s.planCardActive}` : ""}`}>
                {contract.billingCycle === "biannual" && <span className={s.planCurrentBadge}>Plan curent</span>}
                <p className={s.planName}>Bianual</p>
                <p className={s.planPrice}>183 RON<span className={s.planPer}>/lună</span></p>
                <p className={s.planDiscount}>Economisești 8%</p>
                <a href={contract.paymentLinkBiannual} target="_blank" rel="noopener noreferrer"
                  className={`${s.planBtn}${contract.billingCycle === "biannual" ? ` ${s.planBtnActive}` : ""}`}>
                  {contract.billingCycle === "biannual" ? "Plan curent" : "Alege"}
                </a>
              </div>
              {/* Anual */}
              <div className={`${s.planCard}${contract.billingCycle === "annual" ? ` ${s.planCardActive}` : ""}`}>
                {contract.billingCycle === "annual" && <span className={s.planCurrentBadge}>Plan curent</span>}
                <p className={s.planName}>Anual</p>
                <p className={s.planPrice}>166 RON<span className={s.planPer}>/lună</span></p>
                <p className={s.planDiscount}>Economisești 17%</p>
                <a href={contract.paymentLinkAnnual} target="_blank" rel="noopener noreferrer"
                  className={`${s.planBtn}${contract.billingCycle === "annual" ? ` ${s.planBtnActive}` : ""}`}>
                  {contract.billingCycle === "annual" ? "Plan curent" : "Alege"}
                </a>
              </div>
            </div>
          </div>

          {/* Istoric facturi */}
          <div className={s.section}>
            <p className={s.sectionTitle}>Istoric facturi</p>
            {invoices.length === 0 ? (
              <p className={s.emptyState}>Nu există facturi înregistrate.</p>
            ) : (
              <div className={s.invoiceList}>
                {invoices.map((inv) => (
                  <div key={inv.id} className={s.invoiceRow}>
                    <span className={s.invoiceDate}>{formatDate(inv.createdAt)}</span>
                    <span className={s.invoiceAmount}>{inv.amount} {inv.currency}</span>
                    <span className={invoiceStatusClass(inv.status)}>{invoiceStatusLabel(inv.status)}</span>
                    {inv.invoicePdfUrl ? (
                      <a href={inv.invoicePdfUrl} target="_blank" rel="noopener noreferrer" className={s.downloadLink}>
                        Descarcă PDF
                      </a>
                    ) : <span />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

AdminKonceptIDPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  try {
    const { content } = await getFile("data/konceptid/contract.json");
    const contract = JSON.parse(content) as ContractJson;
    const entries = await listFiles("data/konceptid/invoices");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );
    const invoices = await Promise.all(
      jsonFiles.map(async (e) => {
        const { content: raw } = await getFile(e.path);
        return JSON.parse(raw) as InvoiceJson;
      }),
    );
    const sorted = invoices.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return { props: { contract, invoices: sorted } };
  } catch {
    return { props: { contract: null, invoices: [] } };
  }
};
```

---

### `styles/admin/konceptid.css.ts`

```ts
// styles/admin/konceptid.css.ts

import { style } from "@vanilla-extract/css";
import { vars } from "../theme.css";

export const pageTitle = style({
  margin: "0 0 24px", fontSize: "22px", fontWeight: vars.typography.weight.bold,
  color: vars.color.text, letterSpacing: "-0.02em",
});
export const section = style({ marginBottom: "32px" });
export const sectionTitle = style({
  fontSize: "13px", fontWeight: vars.typography.weight.bold, color: vars.color.muted,
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px",
});
export const contractCard = style({
  backgroundColor: vars.color.surface, border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md, padding: "24px",
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
  "@media": { "(max-width: 540px)": { gridTemplateColumns: "1fr" } },
});
export const contractField = style({ display: "flex", flexDirection: "column", gap: "4px" });
export const contractLabel = style({
  fontSize: vars.typography.size.xs, fontWeight: vars.typography.weight.semibold,
  color: vars.color.muted, textTransform: "uppercase", letterSpacing: "0.06em",
});
export const contractValue = style({
  fontSize: vars.typography.size.sm, color: vars.color.text, fontWeight: vars.typography.weight.semibold,
});
export const statusBadge = style({
  display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: "20px",
  fontSize: "11px", fontWeight: vars.typography.weight.semibold,
  textTransform: "uppercase", letterSpacing: "0.04em",
});
export const statusActive = style({ backgroundColor: "#f0fdf4", color: "#16a34a" });
export const statusCancelled = style({ backgroundColor: "#fff0f0", color: vars.color.danger });
export const billingCard = style({
  backgroundColor: vars.color.surface, border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md, padding: "20px", marginBottom: "32px",
  display: "flex", alignItems: "center", gap: "16px",
});
export const billingDays = style({
  fontSize: "36px", fontWeight: vars.typography.weight.bold, color: vars.color.primary, lineHeight: "1",
});
export const billingLabel = style({ fontSize: vars.typography.size.xs, color: vars.color.muted });
export const invoiceList = style({ display: "flex", flexDirection: "column", gap: "10px" });
export const invoiceRow = style({
  backgroundColor: vars.color.surface, border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm, padding: "12px 16px",
  display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", gap: "16px",
  "@media": { "(max-width: 540px)": { gridTemplateColumns: "1fr 1fr", gap: "8px" } },
});
export const invoiceDate = style({ fontSize: vars.typography.size.sm, color: vars.color.text });
export const invoiceAmount = style({ fontSize: vars.typography.size.sm, fontWeight: vars.typography.weight.semibold, color: vars.color.text });
export const invoiceStatus = style([statusBadge]);
export const invoicePaid = style({ backgroundColor: "#f0fdf4", color: "#16a34a" });
export const invoiceUnpaid = style({ backgroundColor: "#fffbeb", color: "#d97706" });
export const downloadLink = style({
  fontSize: vars.typography.size.xs, color: vars.color.primary, textDecoration: "none",
  selectors: { "&:hover": { textDecoration: "underline" } },
});
export const emptyState = style({ color: vars.color.muted, fontSize: vars.typography.size.sm, padding: "32px 0" });
export const payNowBtn = style({
  display: "inline-flex", alignItems: "center", padding: "10px 20px",
  backgroundColor: vars.color.primary, color: vars.color.primaryContrast,
  borderRadius: vars.radius.sm, fontSize: vars.typography.size.sm,
  fontWeight: vars.typography.weight.semibold, textDecoration: "none", marginTop: "12px",
  transition: `background-color ${vars.motion.normal}`,
  selectors: { "&:hover": { backgroundColor: vars.color.primaryHover } },
});
export const plansGrid = style({
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px",
  "@media": { "(max-width: 640px)": { gridTemplateColumns: "1fr" } },
});
export const planCard = style({
  backgroundColor: vars.color.surface, border: `1.5px solid ${vars.color.border}`,
  borderRadius: vars.radius.md, padding: "20px",
  display: "flex", flexDirection: "column", gap: "8px", position: "relative",
  transition: `border-color ${vars.motion.normal}`,
});
export const planCardActive = style({ borderColor: vars.color.primary, boxShadow: "0 0 0 1px rgba(85,97,242,0.3)" });
export const planCurrentBadge = style({
  position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
  backgroundColor: vars.color.primary, color: vars.color.primaryContrast,
  fontSize: "10px", fontWeight: vars.typography.weight.bold,
  textTransform: "uppercase", letterSpacing: "0.06em",
  padding: "2px 10px", borderRadius: "20px", whiteSpace: "nowrap",
});
export const planName = style({
  fontSize: vars.typography.size.sm, fontWeight: vars.typography.weight.bold,
  color: vars.color.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em",
});
export const planPrice = style({ fontSize: "28px", fontWeight: "800", color: vars.color.text, margin: 0, lineHeight: "1" });
export const planPer = style({ fontSize: vars.typography.size.xs, fontWeight: vars.typography.weight.regular, color: vars.color.muted });
export const planDiscount = style({ fontSize: vars.typography.size.xs, color: "#16a34a", fontWeight: vars.typography.weight.semibold, margin: 0, minHeight: "16px" });
export const planBtn = style({
  display: "block", textAlign: "center", padding: "9px 16px",
  backgroundColor: vars.color.surface, color: vars.color.primary,
  border: `1.5px solid ${vars.color.primary}`, borderRadius: vars.radius.sm,
  fontSize: vars.typography.size.sm, fontWeight: vars.typography.weight.semibold,
  textDecoration: "none", marginTop: "auto",
  transition: `background-color ${vars.motion.normal}`,
  selectors: { "&:hover": { backgroundColor: "rgba(85,97,242,0.08)" } },
});
export const contractDownloadRow = style({
  gridColumn: "1 / -1", paddingTop: "8px", borderTop: `1px solid ${vars.color.border}`, marginTop: "4px",
});
export const downloadContractLink = style({
  display: "inline-flex", alignItems: "center", gap: "6px",
  fontSize: vars.typography.size.xs, color: vars.color.primary,
  textDecoration: "none", fontWeight: vars.typography.weight.semibold, marginTop: "16px",
  selectors: { "&:hover": { textDecoration: "underline" } },
});
export const planBtnActive = style({
  backgroundColor: vars.color.primary, color: vars.color.primaryContrast,
  selectors: { "&:hover": { backgroundColor: vars.color.primaryHover } },
});
```

---

## 6. THEME TOKENS

### `styles/theme.css.ts` — secțiunile relevante pentru admin

```ts
// Token contract (extras relevant):
export const vars = createThemeContract({
  color: {
    bg: null,
    text: null,
    muted: null,
    border: null,
    primary: null,
    primaryHover: null,
    primaryContrast: null,
    overlay: null,
    surface: null,
    surfaceHover: null,
    surfaceActive: null,
    link: null,
    linkHover: null,
    focus: null,
    secondary: null,
    cardBg: null,
    cardText: null,
    shadow: null,
    danger: null,   // ← token centralizat pentru butoane Șterge
  },
  // ... typography, radius, shadow, z, space, motion, layout
});

// LIGHT THEME
// vars.color.danger = "#dc2626"

// DARK THEME
// vars.color.danger = "#f87171"

// Breakpoints
export const mq = {
  md: "screen and (min-width: 768px)",
  lg: "screen and (min-width: 900px)",
  xl: "screen and (min-width: 1200px)",
} as const;
```

**Token `vars.color.danger`:**
- Light: `#dc2626`
- Dark: `#f87171`
- Folosit în: `layout.css.ts → deleteBtn`, `konceptid.css.ts → statusCancelled`, `inbox.css.ts → deleteBtn`

---

## 7. ENV EXAMPLE

### `.env.example`

```env
# ==============================
# Site (public) — EXEMPLU. Înlocuiește cu datele CLIENTULUI în producție.
# ==============================
NEXT_PUBLIC_SITE_URL=https://exemplu.ro                 # ← REPLACE (prod URL, fără trailing slash)
NEXT_PUBLIC_SITE_NAME=Exemplu                           # ← REPLACE (client)
# Trebuie să conțină %s; ex: "%s — Exemplu"
NEXT_PUBLIC_SITE_TITLE_TEMPLATE=%s — Exemplu            # ← REPLACE (client)
NEXT_PUBLIC_DEFAULT_TITLE=Exemplu                       # ← REPLACE (client)
NEXT_PUBLIC_SITE_DESC=Servicii X pentru Y.              # ← REPLACE (client)
# Cale relativă în /public sau URL absolut (poți folosi CDN)
NEXT_PUBLIC_OG_IMAGE=/images/og-image.jpg
# Lasă gol dacă nu folosești Twitter (ex: @exemplu)
NEXT_PUBLIC_TWITTER_HANDLE=
# ex: ro_RO, en_US
NEXT_PUBLIC_LOCALE=ro_RO

# ==============================
# Contact (public; doar afișare)
# ==============================
NEXT_PUBLIC_CONTACT_ENABLED=false
NEXT_PUBLIC_CONTACT_EMAIL=contact@exemplu.ro            # ← REPLACE
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_CONTACT_STREET=Strada Exemplu 1             # ← REPLACE
NEXT_PUBLIC_CONTACT_CITY=Oraș                           # ← REPLACE
NEXT_PUBLIC_CONTACT_REGION=Județ                        # ← REPLACE
NEXT_PUBLIC_CONTACT_POSTAL=000000                       # ← REPLACE
NEXT_PUBLIC_CONTACT_COUNTRY=RO                          # ← REPLACE
NEXT_PUBLIC_CONTACT_MAP_EMBED=

# ==============================
# Social (public)
# ==============================
NEXT_PUBLIC_FB_URL=
NEXT_PUBLIC_IG_URL=
NEXT_PUBLIC_TT_URL=

# ==============================
# Paths & Assets (public)
# ==============================
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_ASSET_BASE=

# ==============================
# PWA / Thema UI
# ==============================
NEXT_PUBLIC_PWA_THEME_COLOR=#5561F2
NEXT_PUBLIC_PWA_THEME_COLOR_DARK=#7b84ff
NEXT_PUBLIC_UI_THEME_COLOR_LIGHT=#ffffff
NEXT_PUBLIC_UI_THEME_COLOR_DARK=#0b0b0d
NEXT_PUBLIC_SHARE_TARGET_ENABLED=false

# ==============================
# PWA flags
# ==============================
NEXT_ENABLE_PWA=0              # ← în producție: 1
NEXT_PUBLIC_ENABLE_PWA=0       # ← în producție: 1

# ==============================
# Contact form (server-side)
# ==============================
CONTACT_RATE_LIMIT=5:600
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
OFFER_RATE_LIMIT=3:3600

# ==============================
# Admin dashboard (/admin)
# ==============================
ADMIN_EMAIL=admin@exemplu.ro                  # ← REPLACE
ADMIN_PASSWORD=                               # ← REPLACE (parolă puternică, minim 16 caractere)
# Secret HMAC pentru cookie de sesiune — generează cu:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_SESSION_SECRET=                         # ← REPLACE (32 bytes hex)

# ==============================
# GitHub API — persistență mesaje + recenzii
# ==============================
GITHUB_PAT=                                   # ← REPLACE
GITHUB_OWNER=                                 # ← REPLACE (ex: BurcsaMatei)
GITHUB_REPO=                                  # ← REPLACE (ex: ZephiraEvents)
GITHUB_BRANCH=main
```

> **NOTE:** `.env.example` nu conține chei Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`). Acestea sunt prezente doar în `.env.local` și în Vercel env vars.

---

## OBSERVAȚII STRUCTURALE

### Fișiere inexistente (referite în CLAUDE.md dar absente pe disc)
- `lib/admin/login.ts` — nu există; logica e direct în `pages/api/admin/login.ts`
- `lib/admin/logout.ts` — nu există; logica e direct în `pages/api/admin/logout.ts`

### Chei Stripe necesare (din CLAUDE.md, absente din .env.example)
```
STRIPE_SECRET_KEY=...              # sk_live_*
STRIPE_WEBHOOK_SECRET=...          # whsec_*
STRIPE_PRICE_ID=...                # Price ID subscripție KonceptID
STRIPE_CUSTOMER_ID=...             # cus_* — ID customer Stripe al acestui client (filtru webhook cross-client)
```

> **`STRIPE_CUSTOMER_ID` — de ce există și cum se setează (PR #161, 2026-06-13):**
>
> Stripe trimite `invoice.paid` la **toate** endpoint-urile înregistrate pe un cont, indiferent de care client a plătit. Dacă mai mulți clienți (ex: ZephiraEvents + FraternitaCSS) folosesc același cont Stripe al KonceptID, fiecare site-uri ar salva facturile celorlalți.
>
> Soluție: fiecare site are `STRIPE_CUSTOMER_ID` = ID-ul **propriului** customer Stripe. Webhook-ul verifică `invoice.customer !== STRIPE_CUSTOMER_ID` și ignoră silențios facturile altor clienți (returnează `200 { received: true }` fără a salva).
>
> **Cum găsești `cus_*` pentru un client nou:**
> ```bash
> # Stripe CLI sau API
> stripe customers list --email "client@exemplu.ro"
> # sau
> curl "https://api.stripe.com/v1/customers?email=client%40exemplu.ro" -u sk_live_...:
> ```
>
> Dacă nu setezi `STRIPE_CUSTOMER_ID` (variabila lipsă sau goală), filtrul e dezactivat și webhook-ul salvează orice `invoice.paid` — comportament backward-compatible.

### Arhitectura de persistență (rezumat tehnic)
- **Mesaje:** `data/messages/{type}-{ts}-{id}.json` — create la submit formular; citite via GitHub API
- **Facturi:** `data/konceptid/invoices/invoice-{ts}.json` — create automat la `invoice.paid` Stripe webhook; filtrate prin `STRIPE_CUSTOMER_ID` (PR #161)
- **Contract:** `data/konceptid/contract.json` — gestionat manual; citit via GitHub API în SSR
- **Soft delete:** câmp `deleted: true` în JSON; nu se șterge fizic fișierul din Git
- **Autentificare:** HMAC-SHA256 cookie httpOnly; token stabil derivat din `ADMIN_EMAIL:ADMIN_PASSWORD` semnat cu `ADMIN_SESSION_SECRET`
- **Rate limiting login:** in-memory Map per IP, 5 fail / 15 min → 429

### Incident billing 2026-06-13 (PR #161) — lecție arhitecturală

**Simptom:** `/admin/konceptid` afișa o factură de 150 RON aparținând FraternitaCSS (alt client KonceptID), deși contractul ZephiraEvents era de 200 RON.

**Cauza root:** Ambele site-uri (ZephiraEvents + FraternitaCSS) aveau webhook-uri înregistrate pe **același cont Stripe**. La fiecare `invoice.paid`, Stripe a livrat evenimentul la ambele endpoint-uri — indiferent cărui client îi aparținea factura. Webhook-ul ZephiraEvents n-a filtrat și a salvat și factura CSS.

**Rezolvare:**
1. Factură CSS ștearsă din `data/konceptid/invoices/` via GitHub API
2. `contract.json` actualizat cu IDs Stripe reale (`cus_*`, `sub_*`, `prod_*`, `price_*`) în loc de placeholder-urile `*_test`
3. Filtru adăugat în webhook: `if (invoice.customer !== STRIPE_CUSTOMER_ID) return 200`
4. `STRIPE_CUSTOMER_ID=cus_UbdBbGgJOEBBIW` adăugat în `.env.local` și în Vercel env vars

**Pattern aplicabil la clienți noi:** pentru fiecare site nou pe același cont Stripe, setezi `STRIPE_CUSTOMER_ID` cu ID-ul `cus_*` al acelui client. Dacă variabila lipsește, filtrul e dezactivat (backward-compatible).
