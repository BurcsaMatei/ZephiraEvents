// components/sections/servicii/ServiciiComplete.tsx

// ==============================
// Imports
// ==============================
import React from "react";

import { withBase } from "../../../lib/config";
import * as s from "../../../styles/services.css";
import Appear from "../../animations/Appear";
import AnimatedIcon from "../../ui/AnimatedIcon";

// ==============================
// Types
// ==============================
type Item = {
  id: string;
  title: string;
  description: string;
  href?: string;
  iconSrc: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  items?: Item[];
};

// ==============================
// Data
// ==============================
const ALL_SERVICES: Item[] = [
  {
    id: "svc-1",
    title: "Web Design",
    description: "Design modern, responsive.",
    iconSrc: "/icons/servicii/service1.svg",
  },
  {
    id: "svc-2",
    title: "Dezvoltare Next.js",
    description: "Rapid, accesibil, scalabil.",
    iconSrc: "/icons/servicii/service2.svg",
  },
  {
    id: "svc-3",
    title: "Optimizare & SEO",
    description: "CWV, OG, schema, sitemap.",
    iconSrc: "/icons/servicii/service3.svg",
  },
  {
    id: "svc-4",
    title: "Conținut & Blog",
    description: "Arhitectură & articole.",
    iconSrc: "/icons/servicii/service4.svg",
  },
  {
    id: "svc-5",
    title: "E-commerce",
    description: "Shop performant, UX clar.",
    iconSrc: "/icons/servicii/service5.svg",
  },
  {
    id: "svc-6",
    title: "Integrare & API",
    description: "Servicii, webhook-uri, automations.",
    iconSrc: "/icons/servicii/service6.svg",
  },
  {
    id: "svc-7",
    title: "Mentenanță",
    description: "Update-uri, monitorizare, backup.",
    iconSrc: "/icons/servicii/service7.svg",
  },
  {
    id: "svc-8",
    title: "Audit & Consultanță",
    description: "A11y, performanță, SEO tehnic.",
    iconSrc: "/icons/servicii/service8.svg",
  },
];

// ==============================
// Component
// ==============================
export default function ServiciiComplete({
  title = "",
  subtitle = "",
  items = ALL_SERVICES,
}: Props): JSX.Element {
  return (
    <>
      {/* Header */}
      <div className={s.previewHeader}>
        <h2 id="services-complete-title" className={s.h2}>
          {title}
        </h2>
        <p className={s.previewSubtitle}>{subtitle}</p>
      </div>

      {/* Grid servicii — intrare pe rând, fără wrapper suplimentar */}
      <ul className={s.grid} aria-labelledby="services-complete-title">
        {items.map((it, i) => (
          <Appear as="li" key={it.id} className={s.cardSmall} delay={0.1 * i}>
            <div className={s.cardIconWrapSmall}>
              <AnimatedIcon
                src={withBase(it.iconSrc)}
                size={36}
                hoverTilt
                className={s.cardIconTint}
                ariaLabel={it.title}
              />
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
    </>
  );
}
