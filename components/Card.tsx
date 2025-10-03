// components/Card.tsx

// Imports
import type { ReactNode } from "react";

import {
  actionsRow,
  buttonReset,
  cardRoot,
  contentWrap,
  excerptClass,
  imageWrap,
  linkReset,
  metaRow,
  titleClass,
} from "../styles/card.css";
import SmartLink from "./SmartLink";
import Img from "./ui/Img";

// Types
type ImageProps = { src: string; alt: string; priority?: boolean };

type Props = {
  title: string;
  image?: ImageProps;
  /** Raportul zonei media (wrapper). Ex: "4/3" | "3/2" | "1/1" | "16/9". */
  mediaRatio?: `${number}/${number}`;
  excerpt?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
};

// Component
export default function Card({
  title,
  image,
  mediaRatio = "4/3",
  excerpt,
  meta,
  actions,
  href,
  onClick,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const media = image ? (
    <div className={imageWrap} style={{ aspectRatio: mediaRatio }}>
      <Img
        src={image.src}
        alt={image.alt}
        variant="card"
        fit="cover" // ✅ fix tipuri: cover → fit="cover"
        {...(image.priority ? ({ priority: true } as const) : {})}
      />
    </div>
  ) : null;

  const content = (
    <div className={contentWrap}>
      <div className={titleClass}>{title}</div>
      {excerpt ? <div className={excerptClass}>{excerpt}</div> : null}
      {meta ? <div className={metaRow}>{meta}</div> : null}
      {actions ? <div className={actionsRow}>{actions}</div> : null}
    </div>
  );

  const body = (
    <article className={`${cardRoot} ${className ?? ""}`}>
      {media}
      {content}
    </article>
  );

  if (href) {
    // ✅ Folosim SmartLink pentru consistență (detecție intern/extern, newTab, rel, prefetch)
    return (
      <SmartLink href={href} className={linkReset} aria-label={ariaLabel}>
        {body}
      </SmartLink>
    );
  }

  if (onClick) {
    return (
      <button type="button" className={buttonReset} onClick={onClick} aria-label={ariaLabel}>
        {body}
      </button>
    );
  }

  return body;
}
