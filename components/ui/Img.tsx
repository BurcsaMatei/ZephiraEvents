// components/ui/Img.tsx

// ==============================
// Imports
// ==============================
import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

import { assetUrl } from "../../lib/config";

// ==============================
// Types
// ==============================
type Variant = "hero" | "card" | "thumb" | "icon";
type Fit = "cover" | "contain" | "none";

export type ImgProps = Omit<ImageProps, "loading"> & {
  /** Preset de mărimi + comportament */
  variant?: Variant;
  /** Marchează imaginea ca LCP (setează priority + loading eager) */
  lcp?: boolean;
  /** Echivalent pentru CSS `object-fit` */
  fit?: Fit;
  /** Back-compat: folosește `fit="cover"` în locul acestui prop */
  cover?: boolean;
  /** Echivalent pentru CSS `object-position` (ex: "center", "50% 50%", "top") */
  position?: CSSProperties["objectPosition"];
};

// ==============================
// Constante
// ==============================
const PRESETS: Record<Variant, { sizes: string; fill?: boolean }> = {
  hero: { sizes: "100vw", fill: true },
  // card și thumb folosesc fill deoarece sunt în wrapper cu aspect-ratio
  card: {
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    fill: true,
  },
  thumb: {
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px",
    fill: true,
  },
  icon: { sizes: "48px" }, // de regulă dai width/height direct
};

// ==============================
// Utils
// ==============================
let warnedCover = false;
function warnCoverProp(): void {
  if (warnedCover) return;
  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEBUG === "1") {
    // eslint-disable-next-line no-console
    console.warn('[Img] Prop-ul "cover" este deprecated. Folosește `fit="cover"` în schimb.');
  }
  warnedCover = true;
}

// ==============================
// Component
// ==============================
export default function Img({
  variant = "card",
  lcp = false,
  fit,
  cover, // consumăm cover (nu se propagă)
  position,
  sizes,
  fill,
  priority,
  quality,
  style,
  alt, // explicit ca să-l trimitem după {...rest}
  ...rest
}: ImgProps): JSX.Element {
  const preset = PRESETS[variant];

  const computedSizes = sizes ?? preset.sizes;

  // Protecție pentru `icon`: dacă nu e setat explicit `fill`, forțăm false
  const computedFill = fill ?? (variant === "icon" ? false : !!preset.fill);

  const isLcp = lcp || priority === true;

  // Extragem width/height/src din rest pentru a evita warning-uri când e fill și pentru a aplica URL-ul
  const { width, height, src, ...restNoWHSrc } = rest as {
    src: ImageProps["src"];
    width?: ImageProps["width"];
    height?: ImageProps["height"];
  };

  // Construim props pentru dimensiuni doar dacă NU e fill și valorile există
  const dimensionProps: Partial<Pick<ImageProps, "width" | "height">> = computedFill
    ? {}
    : {
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
      };

  // Back-compat: dacă s-a trimis `cover`, mapăm pe object-fit
  const effectiveFit: CSSProperties["objectFit"] = fit ?? (cover ? "cover" : undefined);

  if (cover) warnCoverProp();

  // Aplica CDN/BASE_PATH doar pentru src string (nu atinge StaticImport)
  const computedSrc: ImageProps["src"] = typeof src === "string" ? assetUrl(src) : src;

  return (
    <Image
      {...restNoWHSrc} // include restul de props, fără width/height/src/cover
      {...dimensionProps}
      src={computedSrc}
      sizes={computedSizes}
      fill={computedFill}
      priority={isLcp}
      loading={isLcp ? "eager" : "lazy"}
      // Transmitem quality doar dacă e definit (exactOptionalPropertyTypes)
      {...(quality !== undefined ? { quality } : {})}
      style={{
        objectFit: effectiveFit,
        objectPosition: position,
        ...style,
      }}
      data-variant={variant}
      alt={alt} // explicit, după spread → satisface eslint a11y
    />
  );
}
