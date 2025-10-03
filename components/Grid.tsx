// components/Grid.tsx

// ==============================
// Imports
// ==============================
import type { CSSProperties, ReactNode } from "react";

import { gridBase, gridFixed, gridFluid } from "../styles/grid.css";

// ==============================
// Types
// ==============================
// Breakpoint columns: folosim DOAR md/lg/xl (nu există sm în mq)
type Cols = {
  base?: number; // mobile / default
  md?: number;
  lg?: number;
  xl?: number;
};

type Mode = "fixed" | "fluid";
type AlignJustify = "stretch" | "start" | "center" | "end";

/** Variabile CSS permise pe containerul Grid (pentru VE types) */
type GridCSSVars = CSSProperties & {
  ["--gap"]?: string;
  ["--align"]?: AlignJustify;
  ["--justify"]?: AlignJustify;

  // FIXED
  ["--cols-base"]?: string;
  ["--cols-md"]?: string;
  ["--cols-lg"]?: string;
  ["--cols-xl"]?: string;
  /** back-compat */
  ["--mobileCols"]?: string;
  ["--desktopCols"]?: string;

  // FLUID
  ["--minCol"]?: string;
  ["--minCol-base"]?: string;
  ["--minCol-md"]?: string;
  ["--minCol-lg"]?: string;
  ["--minCol-xl"]?: string;
};

type Props = {
  children: ReactNode;
  gap?: string;
  align?: AlignJustify;
  justify?: AlignJustify;

  /** API vechi (compat): fixează coloane mobile/desktop */
  mobileCols?: number;
  desktopCols?: number;

  /** API nou: coloane pe breakpoints (md/lg/xl) */
  cols?: Cols;

  /** Modul explicit; dacă lipsesc coloanele fixe => „fluid” */
  mode?: Mode;

  /** Lățimea minimă pe coloană în modul „fluid” (ex: 240, "22rem") */
  minCol?: number | string;

  className?: string;
};

// ==============================
// Utils
// ==============================
const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(" ");

// ==============================
// Component
// ==============================
export default function Grid({
  children,
  gap = "24px",
  align = "stretch",
  justify = "stretch",
  mobileCols,
  desktopCols,
  cols,
  mode,
  minCol,
  className,
}: Props) {
  const hasFixedCols = Boolean(cols || mobileCols || desktopCols);
  const resolvedMode: Mode = hasFixedCols ? "fixed" : (mode ?? "fluid");

  const vars: GridCSSVars = {
    "--gap": gap,
    "--align": align,
    "--justify": justify,
  };

  if (resolvedMode === "fixed") {
    // Valorile pot veni din API nou sau din cel vechi (compat)
    const base = cols?.base ?? mobileCols;
    const md = cols?.md;
    const lg = cols?.lg ?? desktopCols;
    const xl = cols?.xl;

    if (base !== undefined) vars["--cols-base"] = String(base);
    if (md !== undefined) vars["--cols-md"] = String(md);
    if (lg !== undefined) vars["--cols-lg"] = String(lg);
    if (xl !== undefined) vars["--cols-xl"] = String(xl);

    // păstrăm și vechile variabile pentru fallback în CSS
    if (mobileCols !== undefined) vars["--mobileCols"] = String(mobileCols);
    if (desktopCols !== undefined) vars["--desktopCols"] = String(desktopCols);
  } else {
    // FLUID
    const asStr = typeof minCol === "number" ? `${minCol}px` : minCol;
    if (asStr) {
      // setăm atât --minCol (compat) cât și --minCol-base
      vars["--minCol"] = asStr;
      vars["--minCol-base"] = asStr;
    }
  }

  const cls = cx(gridBase, resolvedMode === "fixed" ? gridFixed : gridFluid, className);

  return (
    <div className={cls} style={vars}>
      {children}
    </div>
  );
}
