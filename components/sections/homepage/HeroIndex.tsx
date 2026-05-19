// components/sections/homepage/HeroIndex.tsx

// ==============================
// Imports
// ==============================
import * as React from "react";

import * as h from "../../../styles/sections/homepage/heroIndex.css";
import Appear from "../../animations/Appear";
import HeroLCPImage from "../../HeroLCPImage";

// ==============================
// Types
// ==============================
type ImgLike = {
  src: string;
  alt: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export type HeroIndexProps = {
  image?: ImgLike;
  withDecor?: boolean; // doar pentru efecte (gradient + dots)
  heading?: string; // H1
  subheading?: string; // subtitlu
};

// ==============================
// Constante
// ==============================
const FALLBACK_IMG: ImgLike = {
  src: "/images/current/hero.webp",
  alt: "",
  priority: true,
};

// ==============================
// Component
// ==============================
export default function HeroIndex({
  image,
  withDecor = true,
  heading,
  subheading,
}: HeroIndexProps): JSX.Element {
  const src = image?.src ?? FALLBACK_IMG.src;
  const alt = image?.alt ?? FALLBACK_IMG.alt;

  const priorityFlag: boolean = (image?.priority ?? FALLBACK_IMG.priority) === true;

  // Anti-CLS & full-bleed — rămân inline
  const fullBleedStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    width: "100vw",
    maxWidth: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    isolation: "isolate",
  };

  const stageStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    width: "100%",
    margin: 0,
    overflow: "hidden",
    minHeight: "76vh",
    maxHeight: "92vh",
    backgroundColor: "transparent",
  };

  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  };

  const [isVideoReady, setIsVideoReady] = React.useState(false);

  return (
    <div style={fullBleedStyle}>
      <figure className={h.maskStage} style={stageStyle} aria-hidden>
        <div style={mediaStyle}>
          <HeroLCPImage
            src={src}
            alt={alt}
            priority={priorityFlag}
            sizes="100vw"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <video
            className={`${h.mediaVideo} ${isVideoReady ? h.mediaVideoReady : ""}`}
            muted
            autoPlay
            loop
            playsInline
            preload="none"
            onCanPlay={() => setIsVideoReady(true)}
            aria-hidden
          >
            <source
              src="/videos/current/hero-index-mobile.mp4"
              media="(max-width: 768px)"
              type="video/mp4"
            />
            <source src="/videos/current/hero-index.mp4" type="video/mp4" />
          </video>
        </div>

        {withDecor ? (
          <>
            <div className={h.gradient} />
            <div className={h.dots} />
          </>
        ) : null}

        <div className={h.arcGradient} aria-hidden="true" />
      </figure>

      {heading || subheading ? (
        <div className={h.contentLayer} style={mediaStyle} aria-live="polite">
          <div className={h.contentWrap}>
            <Appear>
              <>
                {heading ? <h1 className={h.heroTitle}>{heading}</h1> : null}
                {subheading ? <p className={h.heroSubtitle}>{subheading}</p> : null}
              </>
            </Appear>
          </div>
        </div>
      ) : null}
    </div>
  );
}
