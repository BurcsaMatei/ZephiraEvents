// components/sections/servicii/WaiterBarSection.tsx

// ==============================
// Imports
// ==============================
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { CONTACT } from "../../../lib/config";
import * as ti from "../../../styles/sections/tent/tentIntro.css";
import * as w from "../../../styles/sections/waiterBarSection.css";
import * as s from "../../../styles/services.css";
import Appear from "../../animations/Appear";

// ==============================
// Data
// ==============================
const CARDS = [
  {
    id: "wbs-1",
    title: "Solicită ofertă",
    description: "Completează formularul și te contactăm în cel mai scurt timp.",
    href: "/contact#oferta",
  },
  {
    id: "wbs-2",
    title: "Vezi galeria",
    description: "Imagini reale din evenimentele noastre.",
    href: "/galerie",
  },
  {
    id: "wbs-3",
    title: "Explorează meniurile",
    description: "Pachete complete pentru orice tip de eveniment.",
    href: "/servicii#meniuri-nunta",
  },
  {
    id: "wbs-4",
    title: "Descoperă serviciile complete",
    description: "Tot ce oferim, într-un singur loc.",
    href: "/servicii",
  },
] as const;

// ==============================
// Component
// ==============================
export default function WaiterBarSection(): JSX.Element {
  const rawPhone = CONTACT?.phone?.trim() || "";
  const telHref = rawPhone ? `tel:${rawPhone.replace(/[^\d+]/g, "")}` : "";

  return (
    <>
      {/* Bloc text deasupra imaginilor — vizibil doar pe mobile */}
      <div className={w.textTop}>
        <span className={ti.eyebrow}>Ospătari &amp; Bar</span>
        <h2 className={ti.heading} aria-hidden="true">
          Echipa care face diferența
        </h2>
        <p className={ti.lede}>
          Ospătari profesioniști, bar complet echipat și un serviciu impecabil — de la primul
          aperitiv până la ultimul toast. Noi ne ocupăm ca fiecare invitat să se simtă special.
        </p>
      </div>

      {/* Rând imagini: 3 coloane — imagine | CTA mobile / text desktop | imagine */}
      <div className={w.imageRow}>
        {/* Coloana stânga — ospătar */}
        <div className={w.imageCol}>
          <Image
            src="/images/servicii/servicii/waiter.webp"
            alt="Ospătar profesionist ZephiraEvents"
            fill
            style={{ objectFit: "contain", objectPosition: "bottom" }}
          />
        </div>

        {/* Coloana centru — CTA pe mobile, text complet pe desktop */}
        <div className={w.textBottom}>
          {rawPhone ? (
            <>
              <p className={w.preCtaText}>Ia legătură cu managerul de organizare</p>
              <a href={telHref} className={w.ctaPhone}>
                {CONTACT.phone}
              </a>
            </>
          ) : null}
        </div>
        <div className={w.textCol}>
          <span className={ti.eyebrow}>Ospătari &amp; Bar</span>
          <h2 className={ti.heading}>Echipa care face diferența</h2>
          <p className={ti.lede}>
            Ospătari profesioniști, bar complet echipat și un serviciu impecabil — de la primul
            aperitiv până la ultimul toast. Noi ne ocupăm ca fiecare invitat să se simtă special.
          </p>
          {rawPhone ? (
            <>
              <p className={w.preCtaText}>Ia legătură cu managerul de organizare</p>
              <a href={telHref} className={w.ctaPhone}>
                {CONTACT.phone}
              </a>
            </>
          ) : null}
        </div>

        {/* Coloana dreapta — bucătar */}
        <div className={w.imageCol}>
          <Image
            src="/images/servicii/servicii/cook.webp"
            alt="Bucătar ZephiraEvents"
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
