// components/sections/OutroContact.tsx
//
// ==============================
// Imports
// ==============================
import { useId } from "react";

import * as base from "../../styles/outro.css";
import * as s from "../../styles/outroContact.css";
import Appear from "../animations/Appear";
import Button from "../Button";

// ==============================
// Types
// ==============================
export type OutroContactProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  phoneHref?: string; // ex: "tel:+40769990800"
  phoneLabel?: string; // ex: "+40 769 990 800"
  whatsappHref?: string; // ex: "https://wa.me/40769990800"
  whatsappLabel?: string; // ex: "WhatsApp"
};

// ==============================
// Component
// ==============================
export default function OutroContact({
  eyebrow = "Rezervă sala de evenimente",
  title = "Sună-ne sau scrie-ne pe WhatsApp",
  lead = "ZephiraEvents — sală de evenimente în Focșani, județul Vrancea. Spune-ne data și tipul evenimentului (nuntă, botez, majorat sau corporate) și numărul estimativ de invitați. Îți răspundem rapid cu disponibilitatea și o ofertă cu servicii impecabile și coordonare A-Z.",
  phoneHref = "tel:+40769990800",
  phoneLabel = "+40 769 990 800",
  whatsappHref = "https://wa.me/40769990800",
  whatsappLabel = "WhatsApp",
}: OutroContactProps) {
  const titleId = useId();
  const leadId = useId();

  return (
    <div className={base.panel} aria-labelledby={titleId}>
      {/* Păstrăm Appear ca și componenta Outro originală */}
      <Appear as="div" className={base.inner}>
        {eyebrow && <p className={base.eyebrow}>{eyebrow}</p>}

        <h2 id={titleId} className={base.title} aria-describedby={lead ? leadId : undefined}>
          {title}
        </h2>

        {lead && (
          <p id={leadId} className={base.lead}>
            {lead}
          </p>
        )}

        {/* Acțiuni: Telefon + WhatsApp */}
        <div className={s.actions} role="group" aria-label="Acțiuni de contact">
          <Button href={phoneHref} aria-label={`Sună ${phoneLabel}`}>
            {phoneLabel}
          </Button>
          <Button
            href={whatsappHref}
            newTab
            rel="noopener noreferrer"
            aria-label="Scrie-ne pe WhatsApp"
          >
            {whatsappLabel}
          </Button>
        </div>
      </Appear>
    </div>
  );
}
