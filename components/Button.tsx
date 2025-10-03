// components/Button.tsx

// Imports
import type {
  AnchorHTMLAttributes,
  AriaAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

import {
  btn,
  disabled as btnDisabled,
  fullWidth as btnFullWidth,
  ghost as btnGhost,
  iconOnly as btnIconOnly,
  lg as btnLg,
  link as btnLink,
  primary as btnPrimary,
  secondary as btnSecondary,
  sm as btnSm,
} from "../styles/button.css";
import SmartLink, { type SmartLinkProps } from "./SmartLink";

// Types
type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "sm" | "lg";

type CommonBase = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconOnly?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
};

/** Varianta LINK (SmartLink) — discriminăm interzicând `type` */
type ButtonAsLink = CommonBase & {
  href: string;
  newTab?: boolean;
  rel?: string;
  /** Next >=13.5/15: boolean | "auto"; acceptăm și null -> omitem prop-ul */
  prefetch?: boolean | "auto" | null;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Discriminant negativ: pe <a> nu acceptăm `type` */
  type?: never;
} & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "className" | "target" | "rel" | "onClick"
  >;

/** Varianta BUTTON nativ — discriminăm interzicând props de link */
type ButtonAsButton = CommonBase &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: never;
    newTab?: never;
    rel?: never;
    prefetch?: never;
  };

export type ButtonProps = ButtonAsLink | ButtonAsButton;

// Constante
const variantClass: Record<Variant, string> = {
  primary: btnPrimary,
  secondary: btnSecondary,
  ghost: btnGhost,
  link: btnLink,
};

const sizeClass: Partial<Record<Size, string>> = {
  sm: btnSm,
  lg: btnLg,
};

// Utils
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

const buildRel = (rel: string | undefined, newTab?: boolean): string | undefined => {
  if (!newTab) return rel;
  const tokens = new Set<string>(
    (rel ?? "")
      .split(" ")
      .map((t) => t.trim())
      .filter(Boolean),
  );
  tokens.add("noopener");
  tokens.add("noreferrer");
  const result = Array.from(tokens).join(" ");
  return result || undefined;
};

// Component
export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size,
    fullWidth,
    iconOnly,
    isLoading,
    disabled,
    className,
    children,
  } = props as CommonBase;

  const composedClassName = cx(
    btn,
    variantClass[variant],
    size ? sizeClass[size] : null,
    fullWidth && btnFullWidth,
    iconOnly && btnIconOnly,
    (disabled || isLoading) && btnDisabled,
    className,
  );

  // ——— LINK ———
  if ("href" in props && props.href) {
    const {
      href,
      newTab,
      rel,
      prefetch,
      onClick,
      ["aria-label"]: ariaLabel,
      tabIndex,
      ..._rest
    } = props as ButtonAsLink;

    const isDisabled = !!disabled || !!isLoading;

    // Props minime obligatorii
    const linkProps: SmartLinkProps & Partial<AriaAttributes> & { tabIndex?: number } = {
      href,
      className: composedClassName,
    };

    // rel (doar dacă e definit după build)
    const computedRel = buildRel(rel, newTab);
    if (computedRel) linkProps.rel = computedRel;

    // newTab (doar dacă e boolean)
    if (typeof newTab === "boolean") linkProps.newTab = newTab;

    // prefetch: Next așteaptă boolean | "auto" — nu trimitem null/undefined
    if (typeof prefetch === "boolean" || prefetch === "auto") {
      linkProps.prefetch = prefetch;
    }

    if (ariaLabel) linkProps["aria-label"] = ariaLabel;
    if (isLoading) linkProps["aria-busy"] = true;

    if (isDisabled) {
      linkProps["aria-disabled"] = true;
      linkProps.tabIndex = -1;
      linkProps.onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
    } else if (onClick) {
      linkProps.onClick = onClick;
    }

    return <SmartLink {...linkProps}>{children}</SmartLink>;
  }

  // ——— BUTTON ———
  const { type = "button", ["aria-label"]: ariaLabel, ...rest } = props as ButtonAsButton;

  const isDisabled = !!disabled || !!isLoading;

  return (
    <button
      type={type}
      className={composedClassName}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
}
