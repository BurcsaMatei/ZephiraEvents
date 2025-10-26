// components/sections/Serviciipreview.lazy.tsx

"use client";

// ==============================
// Imports
// ==============================
import React from "react";

import { withBase } from "../../lib/config";
import { btn, primary as btnPrimary } from "../../styles/button.css";
import * as s from "../../styles/services.css";
import Appear from "../animations/Appear";
import Button from "../Button";
import AnimatedIcon from "../ui/AnimatedIcon";

// ==============================
// Types
// ==============================
type PreviewItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  iconSrc?: string;
};

export type ServiciipreviewProps = {
  items?: PreviewItem[];
  title?: string;
  subtitle?: string;
};

// ==============================
// Data
// ==============================
const DEFAULT_PREVIEW: PreviewItem[] = [
  {
    id: "organizare-nunta",
    title: "Organizare Nuntă",
    description: "Planificare completă, decor, muzică, coordonare.",
    iconSrc: "/icons/servicii/service1.svg",
  },
  {
    id: "botez-cununie",
    title: "Botez & Cununie",
    description: "Pachet complet, candy bar, photo corner.",
    iconSrc: "/icons/servicii/service2.svg",
  },
  {
    id: "corporate-team-building",
    title: "Corporate & Team Building",
    description: "Logistică, scenă, sonorizare, agendă clară.",
    iconSrc: "/icons/servicii/service3.svg",
  },
  {
    id: "petreceri-private-majorate",
    title: "Petreceri Private & Majorate",
    description: "DJ, lumini, bar, momente speciale.",
    iconSrc: "/icons/servicii/service4.svg",
  },
];

// ==============================
// Component
// ==============================
export default function Serviciipreview({
  items = DEFAULT_PREVIEW,
  title = "Servicii — pe scurt",
  subtitle = "O privire rapidă asupra a ceea ce livrăm constant.",
}: ServiciipreviewProps): JSX.Element {
  return (
    <>
      {/* Header */}
      <div className={s.previewHeader}>
        <h2 id="services-preview-title" className={s.h2}>
          {title}
        </h2>
        <p className={s.previewSubtitle}>{subtitle}</p>
      </div>

      {/* Grid servicii — intrare pe rând fără wrapper intermediar */}
      <ul className={s.grid} aria-labelledby="services-preview-title">
        {items.map((it, i) => (
          <Appear as="li" key={it.id} className={s.cardSmall} delay={0.1 * i}>
            <div className={s.cardIconWrapSmall}>
              {it.iconSrc ? (
                <AnimatedIcon
                  src={withBase(it.iconSrc)}
                  size={32}
                  hoverTilt
                  className={s.cardIconTint}
                  ariaLabel={it.title}
                />
              ) : null}
            </div>

            <h3 className={s.cardTitleSmall}>{it.title}</h3>
            <p className={s.cardDescSmall}>{it.description}</p>

            {it.href ? (
              <a
                className={s.cardLink}
                href={withBase(it.href)}
                aria-label={`Detalii despre ${it.title}`}
              >
                Detalii
              </a>
            ) : null}
          </Appear>
        ))}
      </ul>

      {/* CTA centrat */}
      <div className={s.ctaCenter}>
        <Button
          href={withBase("/services")}
          className={`${btn} ${btnPrimary}`}
          aria-label="Vezi toate serviciile"
        >
          Vezi toate serviciile →
        </Button>
      </div>
    </>
  );
}
