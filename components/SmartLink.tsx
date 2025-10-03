// components/SmartLink.tsx

// ==============================
// Imports
// ==============================
import Link from "next/link";
import type { ComponentPropsWithoutRef, HTMLAttributeAnchorTarget, MouseEventHandler } from "react";
import * as React from "react";

import { SITE, withBase } from "../lib/config";

// ==============================
// Types
// ==============================
type NextLinkProps = ComponentPropsWithoutRef<typeof Link>;

export type SmartLinkProps = Omit<
  NextLinkProps,
  "href" | "onClick" | "prefetch" | "target" | "rel"
> & {
  href: string;
  /** Forțează deschiderea într-un tab nou */
  newTab?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Next 13/14: boolean | "auto" (pasăm doar pentru linkuri interne) */
  prefetch?: boolean | "auto";
  /** Override manual: tratează linkul ca extern */
  external?: boolean;
  /** Marcare nofollow (util pentru linkuri externe sponsorizate etc.) */
  nofollow?: boolean;
  /** Lăsăm target/rel disponibile – le normalizăm intern */
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

// ==============================
// Constante
// ==============================
const SPECIAL_SCHEMES = new Set(["mailto:", "tel:", "sms:", "fax:", "geo:", "ws:", "wss:", "ftp:"]);
const FORBIDDEN_SCHEME = "javascript:" as const;

// ==============================
// Utils
// ==============================
function getSiteOrigin(): string {
  const fromEnv = SITE.url?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* ignore invalid env */
    }
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost";
}

function isHashLink(href: string) {
  return href.startsWith("#");
}

function isQueryOnly(href: string) {
  return href.startsWith("?");
}

function getScheme(href: string): string | null {
  const i = href.indexOf(":");
  if (i > 0) return href.slice(0, i + 1).toLowerCase();
  if (href.startsWith("//")) return "protocol-relative:";
  return null;
}

function toAbsoluteURL(href: string): URL {
  const base = getSiteOrigin();
  return new URL(href, base.endsWith("/") ? base : base + "/");
}

function computeIsExternal(href: string): boolean {
  const scheme = getScheme(href);
  if (scheme === FORBIDDEN_SCHEME) return true;
  if (scheme && SPECIAL_SCHEMES.has(scheme)) return true;
  if (isHashLink(href)) return false;
  const u = toAbsoluteURL(href);
  return u.origin !== getSiteOrigin();
}

function dedupeRel(...tokens: Array<string | undefined | null | false>): string | undefined {
  const set = new Set<string>();
  for (const t of tokens) {
    if (!t) continue;
    for (const part of t.split(/\s+/)) {
      const v = part.trim();
      if (v) set.add(v);
    }
  }
  return set.size ? Array.from(set).join(" ") : undefined;
}

function shouldApplyBase(href: string): boolean {
  if (!href) return false;
  if (isHashLink(href) || isQueryOnly(href)) return false;

  const scheme = getScheme(href);
  if (scheme === FORBIDDEN_SCHEME) return false;
  if (scheme && SPECIAL_SCHEMES.has(scheme)) return false;
  if (scheme === "protocol-relative:") return false;

  // absolut cu alt origin → extern
  const abs = toAbsoluteURL(href);
  if (abs.origin !== getSiteOrigin()) return false;

  return true; // intern (relativ sau același origin)
}

// ==============================
// Component
// ==============================
const SmartLink = React.forwardRef<HTMLAnchorElement, SmartLinkProps>(function SmartLink(
  { href, newTab, prefetch, external: externalOverride, nofollow, rel, target, children, ...rest },
  ref,
) {
  const safeHref = (href || "").trim();

  // normalizează href pentru interne (aplică BASE_PATH)
  const normalizedHref = shouldApplyBase(safeHref) ? withBase(safeHref) : safeHref;

  const externalDetected = computeIsExternal(normalizedHref);
  const external = Boolean(externalOverride ?? externalDetected);

  // target & rel finale (open in new tab doar pentru externe, dacă se cere)
  const explicitBlank = target === "_blank";
  const finalTarget: HTMLAttributeAnchorTarget | undefined =
    external && (newTab || explicitBlank) ? "_blank" : target;

  const finalRel = dedupeRel(
    rel,
    finalTarget === "_blank" ? "noopener noreferrer" : undefined,
    external ? "external" : undefined,
    nofollow ? "nofollow" : undefined,
  );

  // prefetch doar pentru linkuri interne
  const prefetchProp = external
    ? ({} as const)
    : prefetch !== undefined
      ? ({ prefetch } as const)
      : ({} as const);

  // Când NU folosim <Link>
  const scheme = getScheme(normalizedHref);
  const usePlainAnchor =
    external ||
    scheme === FORBIDDEN_SCHEME ||
    (scheme && SPECIAL_SCHEMES.has(scheme)) ||
    isHashLink(normalizedHref) ||
    isQueryOnly(normalizedHref);

  // fallback accesibil (pentru a11y/lint): preferă children → aria-label → href
  const ariaLabel = (rest as { ["aria-label"]?: string })["aria-label"];
  const accessibleContent = children ?? ariaLabel ?? normalizedHref;

  if (!safeHref || scheme === FORBIDDEN_SCHEME) {
    // disable în mod explicit
    return (
      <span role="link" aria-disabled="true" {...rest} ref={ref}>
        {children ?? "link"}
      </span>
    );
  }

  if (usePlainAnchor) {
    return (
      <a href={normalizedHref} ref={ref} target={finalTarget} rel={finalRel} {...rest}>
        {accessibleContent}
      </a>
    );
  }

  // Link intern Next.js
  return (
    <Link
      href={normalizedHref}
      ref={ref}
      {...prefetchProp}
      target={finalTarget}
      rel={finalRel}
      {...rest}
    >
      {accessibleContent}
    </Link>
  );
});

export default SmartLink;
