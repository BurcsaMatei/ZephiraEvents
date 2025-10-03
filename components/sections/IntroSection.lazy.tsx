// components/sections/IntroSection.lazy.tsx
"use client";

// ==============================
// Imports
// ==============================
import React, { type ReactNode, useId } from "react";

import * as s from "../../styles/introSection.css";
import Appear from "../animations/Appear";

// ==============================
// Types
// ==============================
export type IntroSectionProps = {
  eyebrow?: ReactNode;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  align?: "start" | "center";
  maxWidth?: "normal" | "narrow";
  className?: string;
  enterDelay?: number;
  headingLevel?: 1 | 2 | 3;
  id?: string;
};

// ==============================
// Component
// ==============================
export default function IntroSection({
  eyebrow,
  title,
  lede,
  children,
  align = "center",
  maxWidth: _maxWidth = "narrow",
  className,
  enterDelay: _enterDelay = 0.9,
  headingLevel = 2,
  id,
}: IntroSectionProps): JSX.Element {
  const ledeId = useId();
  const alignClass = align === "center" ? s.center : s.start;
  const HeadingTag = headingLevel === 1 ? "h1" : headingLevel === 3 ? "h3" : "h2";

  return (
    <div id={id} data-section="intro" className={`${s.panel} ${s.onDark} ${className ?? ""}`}>
      <Appear as="div" className={alignClass}>
        {eyebrow && <div className={s.eyebrow}>{eyebrow}</div>}

        <HeadingTag className={s.heading} aria-describedby={lede ? ledeId : undefined}>
          {title}
        </HeadingTag>

        {lede ? (
          <p id={ledeId} className={s.lede}>
            {lede}
          </p>
        ) : null}

        {children ? <div className={s.content}>{children}</div> : null}
      </Appear>
    </div>
  );
}
