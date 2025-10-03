// components/JsonLd.tsx

// ==============================
// Imports
// ==============================
import Script from "next/script";
import React from "react";

import type { Json } from "../interfaces";

// ==============================
// Types
// ==============================
type JsonLdProps = {
  /** Un singur obiect JSON-LD sau o listă de obiecte */
  schema: Json | Json[] | readonly Json[];
  /** ID opțional pentru primul script (util la deduplicare/targeting) */
  id?: string;
  /** Afișează JSON-ul cu spațiere (util în dev pentru debug) */
  pretty?: boolean;
};

// ==============================
// Utils
// ==============================
/** Normalizează într-o listă mutabilă de scheme */
function toArray(input: Json | Json[] | readonly Json[]): Json[] {
  return Array.isArray(input) ? [...input] : [input];
}

/** Cheie stabilă pentru fiecare schemă (ajută la dedup & debug) */
function schemaKey(schema: Json, idx: number): string {
  const s = (schema ?? {}) as Record<string, unknown>;
  const byId = (s["@id"] ?? s.id ?? s.url) as string | undefined;
  const byType = (s["@type"] ?? s.type) as string | undefined;
  if (byId && byType) return `${byType}:${byId}`;
  if (byId) return String(byId);
  if (byType) return `${byType}:${idx}`;

  const str = JSON.stringify(schema);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return `schema:${(h >>> 0).toString(16)}:${idx}`;
}

// ==============================
// Component
// ==============================
export default function JsonLd({ schema, id, pretty = false }: JsonLdProps) {
  const items = toArray(schema);
  const space = pretty ? 2 : undefined;

  return (
    <>
      {items.map((item, i) => {
        const json = JSON.stringify(item, null, space);
        const scriptId = i === 0 && id ? id : schemaKey(item, i);
        return (
          <Script
            // Next/Script aplică automat nonce când răspunsul are CSP nonce
            id={scriptId}
            key={scriptId}
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: json }}
          />
        );
      })}
    </>
  );
}
