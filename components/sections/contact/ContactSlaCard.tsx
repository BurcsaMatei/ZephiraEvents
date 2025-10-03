// components/sections/contact/ContactSlaCard.tsx

"use client";

// ==============================
// Imports
// ==============================
import React from "react";

import { withBase } from "../../../lib/config";
import { btn, link as btnLink, secondary as btnSecondary } from "../../../styles/button.css";
import * as s from "../../../styles/contact/ContactSlaCard.css";
import Appear from "../../animations/Appear";
import Button from "../../Button";
import AnimatedIcon from "../../ui/AnimatedIcon";

// ==============================
// Types
// ==============================
type Props = {
  whatsapp?: string;
  guideHref?: string;
};

// ==============================
// Component
// ==============================
export default function ContactSlaCard({
  whatsapp = "+40740123456",
  guideHref = "/downloads/ghid-pregatire-continut.pdf",
}: Props) {
  const waHref = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <Appear as="article" aria-labelledby="contact-sla-title">
      <header className={s.headerRow}>
        <span className={s.iconTint} aria-hidden>
          <AnimatedIcon src={withBase("/icons/contact/clock.svg")} size={28} hoverTilt />
        </span>
        <h3 id="contact-sla-title" className={s.title}>
          Răspuns & program
        </h3>
      </header>

      <p className={s.lead}>
        Răspundem în <strong>24–48h</strong> în zile lucrătoare.
      </p>

      <ul className={s.list} aria-label="Program">
        <li className={s.listItem}>
          <span className={s.listIcon} aria-hidden>
            <AnimatedIcon src={withBase("/icons/contact/calendar.svg")} size={22} hoverTilt />
          </span>
          <span className={s.listText}>
            Luni–Vineri: <strong>00:00–00:00</strong>
          </span>
        </li>
        <li className={s.listItem}>
          <span className={s.listIcon} aria-hidden>
            <AnimatedIcon src={withBase("/icons/contact/calendar.svg")} size={22} hoverTilt />
          </span>
          <span className={s.listText}>
            Sâmbătă–Duminică: <strong>00:00–00:00</strong>
          </span>
        </li>
      </ul>

      <div className={s.actions}>
        <Button
          href={waHref}
          className={`${btn} ${btnSecondary}`}
          aria-label="Scrie-ne pe WhatsApp (urgent)"
        >
          <span className={s.inlineIcon} aria-hidden>
            <AnimatedIcon src={withBase("/icons/contact/whatsapp.svg")} size={20} hoverTilt />
          </span>
          WhatsApp (urgent)
        </Button>
      </div>

      <div className={s.miniCard}>
        <div className={s.miniIcon} aria-hidden>
          <AnimatedIcon src={withBase("/icons/contact/download.svg")} size={22} hoverTilt />
        </div>
        <div className={s.miniBody}>
          <div className={s.miniTitle}>Ghid pregătire conținut</div>
          <div className={s.miniText}>Checklist scurt ca să pornim rapid.</div>
          <Button
            href={withBase(guideHref)}
            className={`${btn} ${btnLink}`}
            aria-label="Descarcă ghidul de pregătire a conținutului"
          >
            Descarcă
          </Button>
        </div>
      </div>

      <p className={s.privacyNote}>
        <span className={s.inlineIcon} aria-hidden>
          <AnimatedIcon src={withBase("/icons/contact/shield.svg")} size={18} hoverTilt />
        </span>
        Trimisul mesajului implică procesarea datelor pentru a-ți răspunde. Nu vindem date și nu le
        trimitem către terți. Detalii în Politica de Confidențialitate.
      </p>
    </Appear>
  );
}
