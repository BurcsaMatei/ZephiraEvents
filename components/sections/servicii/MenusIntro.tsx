// components/sections/servicii/MenusIntro.tsx

// ==============================
// Imports
// ==============================
import Image from "next/image";
import Link from "next/link";
import React from "react";

import * as ti from "../../../styles/sections/tent/tentIntro.css";
import * as w from "../../../styles/sections/waiterBarSection.css";

// ==============================
// Component
// ==============================
export default function MenusIntro(): JSX.Element {
  return (
    <>
      {/* Bloc text deasupra imaginilor — vizibil doar pe mobile */}
      <div className={w.textTop}>
        <span className={ti.eyebrow}>Meniurile noastre</span>
        <h2 className={ti.heading} aria-hidden="true">
          Alege pachetul potrivit evenimentului tău
        </h2>
        <p className={ti.lede}>
          Fiecare meniu este gândit pentru un tip de eveniment — de la nunți elegante la corporate
          și petreceri private. Personalizăm orice detaliu împreună cu tine.
        </p>
      </div>

      {/* Rând imagini: 3 coloane — imagine | text desktop | imagine */}
      <div className={w.imageRow}>
        {/* Coloana stânga */}
        <div className={w.imageCol}>
          <Image
            src="/images/servicii/servicii/menus-left.webp"
            alt="Meniuri ZephiraEvents"
            fill
            style={{ objectFit: "contain", objectPosition: "bottom" }}
          />
        </div>

        {/* Coloana centru — CTA pe mobile, text complet pe desktop */}
        <div className={w.textBottom}>
          <p className={w.preCtaText}>Descoperă toate opțiunile disponibile</p>
          <Link href="#meniuri-nunta" className={w.ctaButton}>
            Vezi meniurile ↓
          </Link>
        </div>
        <div className={w.textCol}>
          <span className={ti.eyebrow}>Meniurile noastre</span>
          <h2 className={ti.heading}>Alege pachetul potrivit evenimentului tău</h2>
          <p className={ti.lede}>
            Fiecare meniu este gândit pentru un tip de eveniment — de la nunți elegante la corporate
            și petreceri private. Personalizăm orice detaliu împreună cu tine.
          </p>
        </div>

        {/* Coloana dreapta */}
        <div className={w.imageCol}>
          <Image
            src="/images/servicii/servicii/menus-right.webp"
            alt="Preparate meniu ZephiraEvents"
            fill
            style={{ objectFit: "contain", objectPosition: "bottom" }}
          />
        </div>
      </div>

      {/* Bandă primary full-bleed */}
      <div className={w.primaryBand} aria-hidden="true" />
    </>
  );
}
