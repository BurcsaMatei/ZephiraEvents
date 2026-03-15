// components/sections/servicii/CateringSection.tsx

// ==============================
// Imports
// ==============================
import Image from "next/image";
import Link from "next/link";
import React from "react";

import * as ti from "../../../styles/sections/tentIntro.css";
import * as w from "../../../styles/sections/waiterBarSection.css";
import * as s from "../../../styles/services.css";
import Appear from "../../animations/Appear";

// ==============================
// Data
// ==============================
const CARDS = [
  {
    id: "cat-1",
    title: "Nuntă în aer liber",
    description: "Organizăm evenimente și la locația ta.",
    href: "/cort-evenimente-la-locatia-ta",
  },
  {
    id: "cat-2",
    title: "Vezi meniurile",
    description: "Pachete complete pentru orice eveniment.",
    href: "/servicii#meniuri-nunta",
  },
  {
    id: "cat-3",
    title: "Vezi galeria",
    description: "Imagini reale din evenimentele noastre.",
    href: "/galerie",
  },
  {
    id: "cat-4",
    title: "Solicită ofertă",
    description: "Te contactăm în cel mai scurt timp.",
    href: "/contact",
  },
] as const;

// ==============================
// Component
// ==============================
export default function CateringSection(): JSX.Element {
  return (
    <>
      {/* Bloc text deasupra imaginilor — vizibil doar pe mobile */}
      <div className={w.textTop}>
        <span className={ti.eyebrow}>Bucătărie Proprie &amp; Catering</span>
        <h2 className={ti.heading}>Gust autentic, prezentare impecabilă</h2>
        <p className={ti.lede}>
          Preparăm totul în bucătăria noastră proprie — de la aperitive rafinate la deserturi
          artizanale. Fiecare meniu este gândit cu atenție pentru a completa perfect atmosfera
          evenimentului tău.
        </p>
      </div>

      {/* Rând imagini: 3 coloane — imagine | CTA mobile / text desktop | imagine */}
      <div className={w.imageRow}>
        {/* Coloana stânga */}
        <div className={w.imageCol}>
          <Image
            src="/images/servicii/servicii/waiter-cat-2.png"
            alt="Catering ZephiraEvents"
            fill
            style={{ objectFit: "contain", objectPosition: "bottom" }}
          />
        </div>

        {/* Coloana centru — CTA pe mobile, text complet pe desktop */}
        <div className={w.textBottom}>
          <p className={w.preCtaText}>Discută meniul cu echipa noastră</p>
          <Link href="/contact" className={w.ctaButton}>
            Solicită ofertă
          </Link>
        </div>
        <div className={w.textCol}>
          <span className={ti.eyebrow}>Bucătărie Proprie &amp; Catering</span>
          <h2 className={ti.heading}>Gust autentic, prezentare impecabilă</h2>
          <p className={ti.lede}>
            Preparăm totul în bucătăria noastră proprie — de la aperitive rafinate la deserturi
            artizanale. Fiecare meniu este gândit cu atenție pentru a completa perfect atmosfera
            evenimentului tău.
          </p>
          <p className={w.preCtaText}>Discută meniul cu echipa noastră</p>
          <Link href="/contact" className={w.ctaButton}>
            Solicită ofertă
          </Link>
        </div>

        {/* Coloana dreapta */}
        <div className={w.imageCol}>
          <Image
            src="/images/servicii/servicii/waiter-cat-1.png"
            alt="Preparate catering ZephiraEvents"
            fill
            style={{ objectFit: "contain", objectPosition: "bottom" }}
          />
        </div>
      </div>

      {/* Bandă primary full-bleed */}
      <div className={w.primaryBand} aria-hidden="true" />

      {/* Grid 4 carduri CTA */}
      <ul className={w.cardGrid} aria-label="Acțiuni rapide">
        {CARDS.map((card, i) => (
          <Appear as="li" key={card.id} className={s.cardSmall} delay={0.08 * i}>
            <Link href={card.href} className={s.cardSmallLink} aria-label={card.title}>
              <h3 className={s.cardTitleSmall}>{card.title}</h3>
              <p className={s.cardDescSmall}>{card.description}</p>
            </Link>
          </Appear>
        ))}
      </ul>
    </>
  );
}
