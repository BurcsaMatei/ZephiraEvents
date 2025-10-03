// components/sections/contact/ContactMapIframeConsent.lazy.tsx

"use client";

// ==============================
// Imports
// ==============================
import { useMemo, useState } from "react";

import { btn, primary as btnPrimary } from "../../../styles/button.css";
import {
  centerText,
  consentP,
  iframeFull,
  mapWrap,
} from "../../../styles/contact/contactMapIframeConsent.css";
import Appear from "../../animations/Appear";
import Button from "../../Button";

// ==============================
// Types
// ==============================
export type ContactMapIframeConsentProps = {
  src: string;
  title?: string;
};

// ==============================
// Utils
// ==============================
function toEmbedUrl(src: string): string {
  if (/google\.com\/maps\/embed/i.test(src)) return src;
  if (/google\.com\/maps/i.test(src)) {
    const hasQuery = src.includes("?");
    return `${src}${hasQuery ? "&" : "?"}output=embed`;
  }
  return src;
}

// ==============================
// Component
// ==============================
export default function ContactMapIframeConsent({
  src,
  title = "Hartă Google – Locația KonceptID",
}: ContactMapIframeConsentProps) {
  const [show, setShow] = useState(false);
  const embedSrc = useMemo(() => toEmbedUrl(src), [src]);

  if (!show) {
    return (
      <Appear as="div" aria-label="Previzualizare hartă" className={centerText}>
        <p className={consentP}>
          Pentru a încărca harta Google, avem nevoie de consimțământul tău.
        </p>
        <Button
          type="button"
          onClick={() => setShow(true)}
          className={`${btn} ${btnPrimary}`}
          aria-label="Încarcă harta Google"
        >
          Încarcă harta
        </Button>
      </Appear>
    );
  }

  return (
    <Appear as="div" className={mapWrap} role="region" aria-label={title}>
      <iframe
        id="contact-map-iframe"
        title={title}
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={iframeFull}
        allowFullScreen
      />
      <noscript>
        <p>
          JavaScript este dezactivat. Poți deschide harta în{" "}
          <a href={embedSrc} target="_blank" rel="noopener noreferrer">
            Google&nbsp;Maps
          </a>
          .
        </p>
      </noscript>
    </Appear>
  );
}
