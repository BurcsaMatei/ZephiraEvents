// components/HeroLCPImage.tsx

// ==============================
// Imports
// ==============================
import Image from "next/image";
import * as React from "react";

// ==============================
// Types
// ==============================
type Props = {
  src: string;
  alt: string;
  /** Marchează imaginea ca LCP (Home etc.) */
  priority?: boolean;
  /** Clasă pentru <img>/wrapper dacă e nevoie */
  className?: string;
  /** sizes pentru responsive; default: 100vw */
  sizes?: string;
  /** quality pentru Next Image; default: 70 */
  quality?: number;
  /** Stil inline pentru <img> (ex. objectFit) */
  style?: React.CSSProperties;
};

// ==============================
// Component
// ==============================
export default function HeroLCPImage({
  src,
  alt,
  priority,
  className,
  sizes = "100vw",
  quality = 70,
  style,
}: Props): JSX.Element {
  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={!!priority}
      fetchPriority={priority ? "high" : "auto"}
      quality={quality}
      style={style}
    />
  );
}
