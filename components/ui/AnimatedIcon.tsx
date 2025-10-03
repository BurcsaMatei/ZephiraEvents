// components/ui/AnimatedIcon.tsx
"use client";

// ==============================
// Imports
// ==============================
import {
  motion,
  type MotionStyle,
  type TargetAndTransition,
  type Transition,
  useReducedMotion,
} from "framer-motion";
import type { CSSProperties, FC } from "react";

// ==============================
// Types
// ==============================
type ElementTag = "span" | "div" | "i";

type AnimatedIconProps = {
  /** Calea către SVG-ul folosit ca mască (ex: "/icons/servicii/service1.svg") */
  src: string;
  /** Dimensiunea iconului: px (număr) sau unități CSS (ex: "1.25rem", "100%") */
  size?: number | string;
  /** Efect de tilt ușor la hover (fără animație continuă) */
  hoverTilt?: boolean;
  /** Clasă externă pentru culoare/poziționare (moștenește currentColor) */
  className?: string;
  /** Dacă vrei accesibilitate; dacă lipsește, icon-ul e decorativ */
  ariaLabel?: string;
  /** Stil suplimentar (extinde/override peste stilul de bază) */
  style?: CSSProperties;
  /** Tipul de element HTML folosit pentru wrapper */
  as?: ElementTag;
  /** Tranziție custom pentru hover (dacă nu e setat, se folosește una implicită) */
  transition?: Transition;
};

// ==============================
// Component
// ==============================
const AnimatedIcon: FC<AnimatedIconProps> = ({
  src,
  size = 32,
  hoverTilt = true,
  className,
  ariaLabel,
  style,
  as = "span",
  transition,
}) => {
  const reduce = useReducedMotion();

  // Stil de bază prietenos cu DOM (merge și pe motion.*)
  const baseStyle: CSSProperties = {
    display: "inline-block",
    width: size,
    height: size,
    backgroundColor: "currentColor",
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };

  const mergedStyle: CSSProperties = { ...baseStyle, ...(style ?? {}) };

  const defaultTransition: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 18,
  };

  const shouldAnimate = hoverTilt && !reduce;

  const motionMap = {
    span: motion.span,
    div: motion.div,
    i: motion.i,
  } as const;

  const ariaHidden = ariaLabel ? undefined : true;
  const role = ariaLabel ? "img" : undefined;

  // Render — Animated
  if (shouldAnimate) {
    const whileHover: TargetAndTransition = {
      rotate: 3,
      y: -2,
      transition: transition ?? defaultTransition,
    };

    const MotionTag = motionMap[as];

    // Cast local necesar când exactOptionalPropertyTypes=true
    const motionStyle = mergedStyle as unknown as MotionStyle;

    return (
      <MotionTag
        className={className}
        style={motionStyle}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        role={role}
        whileHover={whileHover}
      />
    );
  }

  // Render — Static (fără framer-motion)
  const Tag = as;

  return (
    <Tag
      className={className}
      style={mergedStyle}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      role={role}
    />
  );
};

export default AnimatedIcon;
