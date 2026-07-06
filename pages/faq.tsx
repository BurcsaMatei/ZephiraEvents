// pages/faq.tsx
// Pagina Întrebări frecvente (FAQ) — SSG, sursă unică pentru lista vizibilă și FAQPage JSON-LD.

import Appear, { AppearGroup } from "../components/animations/Appear";
import Seo from "../components/Seo";
import type { Json } from "../interfaces";
import { absoluteOgImage, absoluteUrl, SITE } from "../lib/config";
import { FAQ_ITEMS } from "../lib/faq";

// ==============================
// Constants
// ==============================
const CANONICAL_PATH = "/faq";

// ==============================
// JSON-LD — FAQPage (SSR via <Seo structuredData>)
// ==============================
const faqPageLd: Json = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE.url}/faq#faqpage`,
  url: absoluteUrl(CANONICAL_PATH),
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const breadcrumbList: Json = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Întrebări frecvente", item: absoluteUrl("/faq") },
  ],
};

// ==============================
// Component
// ==============================
export default function FaqPage(): JSX.Element {
  return (
    <>
      <Seo
        title="Întrebări frecvente"
        description="Răspunsuri clare despre ZephiraEvents din Focșani, Vrancea — prețuri per persoană, capacitatea sălii, cort exterior, rezervare, program, personalizare meniu și operatorul legal."
        url={CANONICAL_PATH}
        image={absoluteOgImage("/images/og-faq.jpg")}
        structuredData={[breadcrumbList, faqPageLd]}
      />

      <main>
        <section className="section">
          <div className="container">
            <Appear as="header">
              <h1>Întrebări frecvente</h1>
              <p>
                Răspunsuri la cele mai frecvente întrebări despre sala noastră de evenimente din
                Focșani — capacitate, prețuri, meniuri, cort exterior și rezervări.
              </p>
            </Appear>

            <AppearGroup as="div" stagger={0.06} delay={0.04}>
              {FAQ_ITEMS.map((item) => (
                <Appear as="section" key={item.question}>
                  <h2>{item.question}</h2>
                  <p>{item.answer}</p>
                </Appear>
              ))}
            </AppearGroup>
          </div>
        </section>
      </main>
    </>
  );
}
