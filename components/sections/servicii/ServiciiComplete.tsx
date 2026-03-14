// components/sections/servicii/ServiciiComplete.tsx

// ==============================
// Imports
// ==============================
import Link from "next/link";
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
    title: "Organizare Nuntă",
    description: "Planificare completă, decor, muzică, coordonare.",
    href: "#meniuri-nunta",
    iconSrc: "/icons/servicii/service1.svg",
  },
  {
    id: "svc-2",
    title: "Botez & Cununie",
    description: "Pachet complet, candy bar, photo corner.",
    href: "#meniuri-botez-cununie",
    iconSrc: "/icons/servicii/service2.svg",
  },
  {
    id: "svc-3",
    title: "Corporate & Team Building",
    description: "Logistică, scenă, sonorizare, agendă clară.",
    href: "#meniuri-corporate-team-building",
    iconSrc: "/icons/servicii/service3.svg",
  },
  {
    id: "svc-4",
    title: "Petreceri Private & Majorate",
    description: "DJ, lumini, bar, momente speciale.",
    href: "#meniuri-petreceri-private-majorate",
    iconSrc: "/icons/servicii/service4.svg",
  },
  {
    id: "svc-5",
    title: "Evenimente în Aer Liber",
    description: "Terasă/foișor, ceremonii și cocktail afară.",
    href: "/cort-evenimente-la-locatia-ta",
    iconSrc: "/icons/servicii/service5.svg",
  },
  {
    id: "svc-6",
    title: "Bucătărie Proprie & Catering",
    description: "Meniu personalizat, degustare, opțiuni dietetice.",
    href: "#meniuri-nunta",
    iconSrc: "/icons/servicii/service6.svg",
  },
  {
    id: "svc-7",
    title: "Servicii Ospătari & Bar",
    description: "Echipă dedicată, raport optim invitați.",
    href: "#meniuri-nunta",
    iconSrc: "/icons/servicii/service7.svg",
  },
  {
    id: "svc-8",
    title: "Cazare & Logistică Invitați",
    description: "Parteneri hotel, transfer, late check-out.",
    href: "#meniuri-nunta",
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
            <Link href={it.href ?? "#"} className={s.cardSmallLink} aria-label={it.title}>
              <div className={s.cardIconWrapSmall}>
                <AnimatedIcon
                  src={withBase(it.iconSrc)}
                  size={36}
                  hoverTilt={false}
                  className={s.cardIconTint}
                  ariaLabel={it.title}
                />
              </div>

              <h3 className={s.cardTitleSmall}>{it.title}</h3>
              <p className={s.cardDescSmall}>{it.description}</p>
            </Link>
          </Appear>
        ))}
      </ul>
    </>
  );
}
