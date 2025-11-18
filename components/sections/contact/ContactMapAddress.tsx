// components/sections/contact/ContactMapAddress.tsx

// ==============================
// Imports
// ==============================
import React from "react";

import { CONTACT } from "../../../lib/config";
import { btn, secondary as btnSecondary } from "../../../styles/button.css";
import * as s from "../../../styles/contact/ContactMapAddress.css";

// ==============================
// Types
// ==============================
type Props = {
  className?: string;
};

// ==============================
// Utils
// ==============================
function buildFormattedAddress(): { formatted: string; mapsUrl: string | null } {
  const { street, commune, city, region, postal } = CONTACT.address;

  const parts: string[] = [];
  if (street) parts.push(street);
  if (commune) parts.push(commune);
  if (city) parts.push(city);
  if (region) parts.push(region);
  if (postal) parts.push(postal);

  const formatted = parts.join(", ");
  if (!formatted) return { formatted: "", mapsUrl: null };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    formatted,
  )}`;

  return { formatted, mapsUrl };
}

// ==============================
// Component
// ==============================
export default function ContactMapAddress({ className }: Props) {
  const { formatted, mapsUrl } = buildFormattedAddress();

  if (!formatted) return null;

  return (
    <div className={`${s.root} ${className ?? ""}`}>
      <div className={s.panel}>
        <p className={s.address}>
          <span className={s.label}>Adresă:</span> {formatted}
        </p>

        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className={`${btn} ${btnSecondary} ${s.button}`}
          >
            Vezi locația exactă
          </a>
        ) : null}
      </div>
    </div>
  );
}
