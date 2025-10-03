// components/animations/Appear.tsx
"use client";

// ==============================
// Imports
// ==============================
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import * as React from "react";

// ==============================
// Types
// ==============================
// /* Tipuri */
type AppearKind = "fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right";
type ViewportAmount = number | "some" | "all";

// ==============================
// Utils
// ==============================
// /* Utils */
function makeVariants(kind: AppearKind, distance: number) {
  switch (kind) {
    case "fade-up":
      return { hidden: { opacity: 0, y: distance }, show: { opacity: 1, y: 0 } };
    case "fade-down":
      return { hidden: { opacity: 0, y: -distance }, show: { opacity: 1, y: 0 } };
    case "fade-left":
      return { hidden: { opacity: 0, x: -distance }, show: { opacity: 1, x: 0 } };
    case "fade-right":
      return { hidden: { opacity: 0, x: distance }, show: { opacity: 1, x: 0 } };
    default:
      return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
}

const EASE = [0.2, 0, 0.2, 1] as const;

// ==============================
// Component
// ==============================
// /* Single */
type BaseProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  kind?: AppearKind;
  distance?: number;
  delay?: number;
  duration?: number; // 0.48 elegant
  once?: boolean; // true
  amount?: ViewportAmount; // 0.2
};
export type AppearProps<T extends ElementType> = BaseProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof BaseProps<T>>;

export default function Appear<T extends ElementType = "div">({
  as,
  children,
  kind = "fade-up",
  distance = 12,
  delay = 0,
  duration = 0.48,
  once = true,
  amount = 0.2,
  ...rest
}: AppearProps<T>) {
  const reduce = useReducedMotion();
  const Tag = (as ?? "div") as ElementType;
  const MotionTag = motion(Tag);
  const variants = makeVariants(kind, distance);

  return (
    <MotionTag
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants}
      transition={reduce ? { duration: 0 } : { duration, delay, ease: EASE }}
      {...(rest as object)}
    >
      {children}
    </MotionTag>
  );
}

// ==============================
// Group (stagger)
// ==============================
// /* Group (stagger) – cu suport `as` pentru semantică (ex. ul/div) */
type GroupBaseProps<T extends ElementType> = {
  as?: T; // ex. "ul" pentru liste semantice
  children?: ReactNode;
  delay?: number; // 0
  stagger?: number; // 0.06
  once?: boolean; // true
  amount?: ViewportAmount; // 0.2
  className?: string;
  wrapChildren?: boolean; // default false – păstrăm structura/semantica
  kind?: AppearKind; // pt. wrapChildren=true
  distance?: number; // 12
  duration?: number; // 0.48
};
export type AppearGroupProps<T extends ElementType> = GroupBaseProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof GroupBaseProps<T>>;

export function AppearGroup<T extends ElementType = "div">({
  as,
  children,
  delay = 0,
  stagger = 0.06,
  once = true,
  amount = 0.2,
  className,
  wrapChildren = false,
  kind = "fade-up",
  distance = 12,
  duration = 0.48,
  ...rest
}: AppearGroupProps<T>) {
  const reduce = useReducedMotion();
  const Tag = (as ?? "div") as ElementType;
  const MotionTag = motion(Tag);

  const mapped = React.useMemo(() => {
    if (!wrapChildren) return children;
    const kids = React.Children.toArray(children);
    const itemVariants = makeVariants(kind, distance);
    const itemTransition = reduce ? { duration: 0 } : { duration, ease: EASE };

    return kids.map((child, i) => (
      <motion.div
        key={(child as { key?: React.Key })?.key ?? i}
        variants={itemVariants}
        transition={itemTransition}
      >
        {child}
      </motion.div>
    ));
  }, [children, wrapChildren, kind, distance, duration, reduce]);

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: {
          transition: reduce
            ? { duration: 0 }
            : { delayChildren: delay, staggerChildren: stagger, ease: EASE },
        },
      }}
      {...(rest as object)}
    >
      {mapped}
    </MotionTag>
  );
}
