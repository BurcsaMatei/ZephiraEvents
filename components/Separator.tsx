// components/Separator.tsx

// ==============================
// Imports
// ==============================
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import * as React from "react";

import * as s from "../styles/separator.css";

// ==============================
// Types
// ==============================
type SeparatorProps = {
  /** Culoarea/tonul separatorului */
  variant?: "primary" | "muted" | "subtle";
  /** Grosime + spațiere pe verticală */
  size?: "sm" | "md" | "lg";
  /** Aliniere pe orizontală (pentru orientarea orizontală) sau în container (pentru verticală) */
  align?: "start" | "center" | "end";
  /** Direcția separatorului */
  orientation?: "horizontal" | "vertical";
  /** Lungimea liniei (ex: "110px", "60%", "12rem"). Implicit: 110px */
  length?: string;
  /** Grosimea explicită (ex: "2px"). Dacă este setată, are prioritate peste `size`. */
  thickness?: string;
  /** maxWidth aplicat DOAR pentru orientarea orizontală (ex: "40vw"). Implicit: 40vw */
  maxWidth?: string;
  /** Adaugă o umbră discretă */
  elevated?: boolean;
  /** Dacă e strict decorativ, ascunde-l din accesibilitate */
  decorative?: boolean;
  /** Extensibilitate compozițională */
  className?: string;
} & Omit<ComponentPropsWithoutRef<"hr">, "color">;

// ==============================
// Constante
// ==============================
const DEFAULTS = {
  variant: "primary" as const,
  size: "md" as const,
  align: "center" as const,
  orientation: "horizontal" as const,
  length: "110px",
  maxWidth: "40vw",
};

// ==============================
// Utils
// ==============================
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ==============================
// Component
// ==============================
function Separator({
  variant = DEFAULTS.variant,
  size = DEFAULTS.size,
  align = DEFAULTS.align,
  orientation = DEFAULTS.orientation,
  length,
  thickness,
  maxWidth,
  elevated,
  decorative,
  className,
  style,
  ...rest
}: SeparatorProps) {
  // Stiluri runtime: suprascriem variabilele CSS pentru lungime + grosime
  const dynStyle: CSSProperties = {
    ...(length ? { [s.sepLengthVar]: length } : null),
    ...(thickness ? { [s.sepThicknessVar]: thickness } : null),
    ...(orientation === "horizontal" && maxWidth ? { maxWidth } : null),
    ...style,
  };

  const classes = cx(
    s.root,
    orientation === "vertical" ? s.vertical : s.horizontal,
    s.tone[variant],
    s.size[size],
    s.align[align],
    elevated && s.elevated,
    className,
  );

  return (
    <hr
      className={classes}
      style={dynStyle}
      // A11y: ascunde din accesibilitate dacă e pur decorativ
      aria-hidden={decorative ? true : undefined}
      role={decorative ? "presentation" : undefined}
      {...rest}
    />
  );
}

// ==============================
// Exporturi
// ==============================
export default Separator;
