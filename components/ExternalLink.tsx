// components/ExternalLink.tsx

// ==============================
// Imports
// ==============================
import type { AnchorHTMLAttributes } from "react";

// ==============================
// Types
// ==============================
type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target" | "rel" | "referrerPolicy"
> & {
  href: string;
  /** Deschide în filă nouă (default: true) */
  newTab?: boolean;
  /** Adaugă rel="nofollow" */
  nofollow?: boolean;
  /** Adaugă rel="ugc" */
  ugc?: boolean;
  /** Politica de referer (default: "no-referrer") */
  referrerPolicy?: AnchorHTMLAttributes<HTMLAnchorElement>["referrerPolicy"];
};

// ==============================
// Utils
// ==============================
const isUnsafeHref = (value: string): boolean => /^javascript:/i.test(value.trim());
const isHttp = (value: string): boolean => /^https?:\/\//i.test(value.trim());
const isSpecial = (value: string): boolean =>
  /^(mailto:|tel:|sms:|ftp:|ws:|wss:)/i.test(value.trim());

const buildRel = (opts: {
  newTab?: boolean;
  nofollow?: boolean;
  ugc?: boolean;
}): string | undefined => {
  const set = new Set<string>();
  if (opts.newTab) {
    set.add("noopener");
    set.add("noreferrer");
  }
  if (opts.nofollow) set.add("nofollow");
  if (opts.ugc) set.add("ugc");
  set.add("external");
  return set.size ? Array.from(set).join(" ") : undefined;
};

// ==============================
// Component
// ==============================
export default function ExternalLink({
  href,
  children,
  className,
  newTab = true,
  nofollow,
  ugc,
  referrerPolicy,
  ["aria-label"]: ariaLabel,
  ...rest
}: ExternalLinkProps) {
  const safeHref = (href || "").trim();

  // Blochează scheme periculoase și href gol
  if (!safeHref || isUnsafeHref(safeHref)) {
    return (
      <span
        className={className}
        role="link"
        aria-disabled="true"
        aria-label={ariaLabel}
        title={!safeHref ? "Link indisponibil" : "Link dezactivat: schemă nesigură"}
        tabIndex={-1}
      >
        {children}
      </span>
    );
  }

  // Acceptăm DOAR http(s):// sau protocoale speciale explicite (mailto/tel/…)
  if (!(isHttp(safeHref) || isSpecial(safeHref))) {
    // dacă e relativ/altceva, nu tratăm ca link extern
    return (
      <span
        className={className}
        role="link"
        aria-disabled="true"
        aria-label={ariaLabel}
        title="Link extern invalid (așteptam http(s):// sau un protocol suportat)"
        tabIndex={-1}
      >
        {children}
      </span>
    );
  }

  const rel = buildRel({
    ...(newTab ? { newTab: true } : {}),
    ...(nofollow ? { nofollow: true } : {}),
    ...(ugc ? { ugc: true } : {}),
  });
  const target = newTab ? "_blank" : undefined;
  const refPol = referrerPolicy ?? "no-referrer";

  // Notă: punem `...rest` înainte, apoi props finale – nu pot fi suprascrise accidental.
  return (
    <a
      href={safeHref}
      className={className}
      aria-label={ariaLabel}
      {...rest}
      {...(target ? { target } : {})}
      {...(rel ? { rel } : {})}
      referrerPolicy={refPol}
    >
      {children}
    </a>
  );
}
