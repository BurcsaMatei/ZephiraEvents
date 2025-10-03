// components/sections/Outro.lazy.tsx

"use client";

// ==============================
// Imports
// ==============================
import { type ReactNode, useId } from "react";

import { withBase } from "../../lib/config";
import * as btn from "../../styles/button.css";
import * as s from "../../styles/outro.css";
import Appear from "../animations/Appear";
import Button from "../Button";

// ==============================
// Types
// ==============================
export type OutroProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  bullets?: string[];
  cta?: { label?: string; href?: string; newTab?: boolean };
  extra?: ReactNode;
};

// ==============================
// Component
// ==============================
export default function Outro({
  id,
  eyebrow = "Hai să lucrăm împreună",
  title = "Gata să trecem la următorul pas?",
  lead = "Spune-ne câteva detalii despre proiectul tău și revenim rapid cu un plan clar.",
  bullets,
  cta = { label: "Contactează-ne", href: "/contact" },
  extra,
}: OutroProps) {
  const headingId = id ?? "outro-title";
  const leadId = useId();

  const href = withBase(cta?.href ?? "/contact");
  const label = cta?.label ?? "Contactează-ne";
  const newTab = typeof cta?.newTab === "boolean" ? cta.newTab : undefined;

  // ⚠️ Fără <section> / fără animație locală pe wrapper; paginile vor înfășura cu .section > .container
  return (
    <div className={s.panel} aria-labelledby={headingId}>
      <Appear as="div" className={s.inner}>
        {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}

        <h2 id={headingId} className={s.title} aria-describedby={lead ? leadId : undefined}>
          {title}
        </h2>

        {lead && (
          <p id={leadId} className={s.lead}>
            {lead}
          </p>
        )}

        {Array.isArray(bullets) && bullets.length > 0 && (
          <ul className={s.list}>
            {bullets.map((item, i) => (
              <li key={i} className={s.listItem}>
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className={s.cta}>
          <Button
            href={href}
            {...(typeof newTab === "boolean" ? { newTab } : {})}
            {...(newTab ? { rel: "noopener noreferrer" } : {})}
            className={`${btn.btn} ${btn.primary} ${btn.lg}`}
            aria-label={label}
          >
            {label}
          </Button>
        </div>

        {extra}
      </Appear>
    </div>
  );
}
