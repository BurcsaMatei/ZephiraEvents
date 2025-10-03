// components/Breadcrumbs.tsx

// Imports
import Link from "next/link";

import {
  breadcrumbCurrentClass,
  breadcrumbItemClass,
  breadcrumbLinkClass,
  breadcrumbSeparatorClass,
  breadcrumbsListClass,
  breadcrumbsWrapperClass,
} from "../styles/breadcrumbs.css";

// Types
export type Crumb = { name: string; href?: string; current?: boolean };

type Props = {
  /** Pâinea de traseu (readonly pentru a evita conflicte de tip „mutable vs readonly”) */
  items: ReadonlyArray<Crumb>;
  /** Clasă externă suplimentară pentru wrapper */
  className?: string;
  /** Separator vizual între elemente (ex: "/", ">", "•") */
  separator?: string;
};

// Component
export default function Breadcrumbs({ items, className, separator = "/" }: Props) {
  if (!items?.length) return null;

  return (
    <nav aria-label="breadcrumb" className={`${breadcrumbsWrapperClass} ${className ?? ""}`}>
      <ol className={breadcrumbsListClass}>
        {items.map((c, i) => {
          const isCurrent = !!c.current || i === items.length - 1;

          return (
            <li
              key={`${c.href ?? c.name}-${i}`}
              className={breadcrumbItemClass}
              aria-current={isCurrent ? "page" : undefined}
            >
              {/* Separator accesibil (ascuns semantic), randat ca nod separat */}
              {i > 0 ? (
                <span className={breadcrumbSeparatorClass} aria-hidden="true">
                  {separator}
                </span>
              ) : null}

              {c.href && !isCurrent ? (
                <Link href={c.href} className={breadcrumbLinkClass}>
                  {c.name}
                </Link>
              ) : (
                <span className={breadcrumbCurrentClass}>{c.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
