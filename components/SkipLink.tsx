// components/SkipLink.tsx

// ==============================
// Imports
// ==============================
import type { ComponentPropsWithoutRef } from "react";
import * as React from "react";

import { skipLink } from "../styles/skipLink.css";

// ==============================
// Types
// ==============================
type SkipLinkProps = {
  /** Ținta pentru „sari la conținut” (implicit: #main) */
  to?: string;
  /** Textul linkului (implicit: „Sari la conținut principal”) */
  label?: string;
  /** Extensibilitate: clase suplimentare */
  className?: string;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "className">;

// ==============================
// Utils
// ==============================
function cx(...v: Array<string | undefined>) {
  return v.filter(Boolean).join(" ");
}

// ==============================
// Component
// ==============================
function SkipLink({
  to = "#main",
  label = "Sari la conținut principal",
  className,
  ...rest
}: SkipLinkProps) {
  return (
    <a
      href={to}
      className={cx(skipLink, className)}
      // opțional: data-testid/aria-atribute prin ...rest
      {...rest}
    >
      {label}
    </a>
  );
}

// ==============================
// Exporturi
// ==============================
export default SkipLink;
