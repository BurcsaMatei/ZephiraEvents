// components/sections/Hero.tsx

// ==============================
// Imports
// ==============================
import React, { type ReactNode, useId } from "react";

import * as h from "../../styles/hero.css";
import HeroLCPImage from "../HeroLCPImage";

// ==============================
// Types
// ==============================
type ImgLike = { src: string; alt: string; priority?: boolean };

type Props = {
  title: string;
  subtitle?: string;
  image: ImgLike;
  cta?: ReactNode;
  align?: "start" | "center";
  height?: "sm" | "md" | "lg";
  withOverlay?: boolean;
};

// ==============================
// Component
// ==============================
export default function Hero({
  title,
  subtitle,
  image,
  cta,
  align = "center",
  height = "md",
  withOverlay = true,
}: Props): JSX.Element {
  const subtitleId = useId();

  const hCls = height === "lg" ? h.hLg : height === "sm" ? h.hSm : h.hMd;
  const alignClass = align === "start" ? h.heroAlignStart : h.heroAlignCenter;

  const isPriority = Boolean(image.priority);

  return (
    <section
      className={h.hero}
      aria-labelledby="hero-heading"
      aria-describedby={subtitle ? subtitleId : undefined}
    >
      <div className={`${h.heroWrap} ${hCls}`}>
        {/* Media layer */}
        <div className={h.heroMedia}>
          <div className={h.heroImg}>
            <HeroLCPImage src={image.src} alt={image.alt} priority={isPriority} sizes="100vw" />
          </div>

          {withOverlay && (
            <>
              <div className={h.heroOverlay} />
              <div className={h.aurora} />
              <span className={h.glowBand} aria-hidden />
              <span className={h.orbA} aria-hidden />
              <span className={h.orbB} aria-hidden />
            </>
          )}
        </div>

        {/* Content */}
        <div className={`${h.heroInner} ${alignClass}`}>
          <div className={h.innerContent}>
            <h1 id="hero-heading" className={h.heroTitle}>
              {title}
            </h1>

            {subtitle ? (
              <p id={subtitleId} className={h.heroSub}>
                {subtitle}
              </p>
            ) : null}

            {cta ? <div className={h.ctaDock}>{cta}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
