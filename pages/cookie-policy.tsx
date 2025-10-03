// pages/cookie-policy.tsx

// ==============================
// Imports
// ==============================
import Appear, { AppearGroup } from "../components/animations/Appear";
import Seo from "../components/Seo";
import type { Json } from "../interfaces";
import { absoluteAssetUrl, absoluteOgImage, absoluteUrl, SITE, withBase } from "../lib/config";
import { formatDateRo } from "../lib/dates";

// ==============================
// Constants
// ==============================
const CANONICAL_PATH = "/cookie-policy";
const LAST_UPDATED = formatDateRo(new Date()); // ex: „08 septembrie 2025”

// ==============================
// JSON-LD
// ==============================
const jsonLd: Json = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Politica Cookie",
  description: "Cum folosim cookie-urile, tipuri și opțiuni de gestionare.",
  url: absoluteUrl(CANONICAL_PATH),
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    logo: {
      "@type": "ImageObject",
      url: absoluteAssetUrl(SITE.ogImage || "/images/og.jpg"),
    },
  },
} as const;

// ==============================
// Component
// ==============================
export default function CookiePolicyPage(): JSX.Element {
  return (
    <>
      <Seo
        title="Politica Cookie"
        description="Cum folosim cookie-urile, tipuri și opțiuni de gestionare."
        url={CANONICAL_PATH}
        image={absoluteOgImage(SITE.ogImage || "/images/og.jpg")}
        structuredData={[jsonLd]}
      />

      <main>
        {/* Layout global: fără padding inline; control prin .section + .container */}
        <section className="section">
          <div className="container">
            {/* Intro animat discret */}
            <Appear as="header">
              <h1>Politica privind fișierele cookie</h1>
              <p>
                Această politică explică ce sunt cookie-urile, cum le folosim și ce opțiuni ai la
                dispoziție pentru a le gestiona.
              </p>
            </Appear>

            {/* Secțiunile de conținut intră pe rând (stagger), fără a rupe layout-ul */}
            <AppearGroup as="div" stagger={0.1} delay={0.06}>
              <Appear as="section">
                <h2>1. Ce sunt cookie-urile?</h2>
                <p>
                  Cookie-urile sunt fișiere mici plasate pe dispozitiv de site-urile web vizitate.
                  Sunt utilizate pentru funcționare, măsurare și personalizare.
                </p>
              </Appear>

              <Appear as="section" delay={0.02}>
                <h2>2. Tipuri de cookie-uri pe care le folosim</h2>
                <ul>
                  <li>
                    <strong>Esențiale</strong> — necesare funcționării site-ului.
                  </li>
                  <li>
                    <strong>Analitice</strong> — măsurarea anonimă a traficului.
                  </li>
                  <li>
                    <strong>Marketing</strong> — personalizare reclame.
                  </li>
                </ul>
              </Appear>

              <Appear as="section" delay={0.04}>
                <h2>3. Cum poți controla cookie-urile</h2>
                <p>
                  Le poți gestiona din setările browserului sau din{" "}
                  <a href={withBase("/cookie-settings")}>Setări cookie</a> (dacă sunt disponibile pe
                  acest site).
                </p>
              </Appear>

              <Appear as="section" delay={0.06}>
                <h2>4. Modificări</h2>
                <p>
                  <em>Ultima actualizare: {LAST_UPDATED}</em>
                </p>
              </Appear>
            </AppearGroup>
          </div>
        </section>
      </main>
    </>
  );
}
