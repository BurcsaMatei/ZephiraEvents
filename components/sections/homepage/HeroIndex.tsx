// components/sections/homepage/HeroIndex.tsx

// ==============================
// Imports
// ==============================
import * as React from "react";

import * as h from "../../../styles/heroIndex.css";
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
};

// ==============================
// Constante
// ==============================
const FALLBACK_IMG: ImgLike = {
  src: "/images/current/hero.jpg",
  alt: "",
  priority: true,
};

// ==============================
// Component
// ==============================
export default function HeroIndex({ image, withDecor = true }: HeroIndexProps): JSX.Element {
  const src = image?.src ?? FALLBACK_IMG.src;
  const alt = image?.alt ?? FALLBACK_IMG.alt;

  // FIX: boolean strict (fără undefined)
  const priorityFlag: boolean = (image?.priority ?? FALLBACK_IMG.priority) === true;

  // Anti-CLS & full-bleed rămân inline (exact cum ți-au funcționat)
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

  return (
    <div style={fullBleedStyle}>
      {/* Masca + efectele sunt în CSS; logica de spațiu rămâne inline */}
      <figure className={h.maskStage} style={stageStyle} aria-hidden>
        <div style={mediaStyle}>
          <HeroLCPImage
            src={src}
            alt={alt}
            priority={priorityFlag}
            sizes="100vw"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {withDecor ? (
          <>
            <div className={h.gradient} />
            <div className={h.dots} />
          </>
        ) : null}
      </figure>
    </div>
  );
}
