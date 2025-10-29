// pages/services.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";

import Appear, { AppearGroup } from "../components/animations/Appear";
import Breadcrumbs, { type Crumb } from "../components/Breadcrumbs";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import MotivationCards from "../components/sections/MotivationCards";
import Outro from "../components/sections/Outro";
import ServiciiComplete from "../components/sections/servicii/ServiciiComplete";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { absoluteUrl } from "../lib/config";

// ==============================
// Constante
// ==============================
const pagePath = "/servicii";

const crumbs: Crumb[] = [
  { name: "AcasÄ", href: "/" },
  { name: "Servicii", current: true },
];

const breadcrumbList = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AcasÄ", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Servicii", item: absoluteUrl(pagePath) },
  ],
} as const satisfies Json;

// JSON-LD: ItemList de servicii (nume + descriere, fÄrÄ URL individual)
const serviceItems = [
  {
    name: "Design UI/UX",
    description: "Proiectare interfeČ›e clare Č™i moderne, orientate pe conversie.",
  },
  {
    name: "Dezvoltare Next.js",
    description: "Site-uri rapide, scalabile, cu TypeScript strict Č™i bune practici.",
  },
  {
    name: "Optimizare performanČ›Ä & SEO tehnic",
    description: "AnalizÄ, corecČ›ii Č™i bune practici pentru vitezÄ Č™i indexare.",
  },
  {
    name: "ConČ›inut Č™i blog",
    description: "StructurÄ editorialÄ Č™i texte clare, optimizate pentru SEO.",
  },
] as const;

const servicesItemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Serviciile noastre",
  itemListElement: serviceItems.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.name,
      description: s.description,
    },
  })),
} as const satisfies Json;

// ==============================
// Component
// ==============================
const ServicesPage: NextPage = () => {
  return (
    <>
      <Seo
  title="Servicii — sală de evenimente în Focșani, Vrancea"
  description="ZephiraEvents oferă organizare completă pentru nunți, botezuri, majorate și evenimente corporate în Focșani, județul Vrancea — sală de evenimente, meniu personalizat, decor, foto-video, DJ, coordonare A-Z și servicii impecabile."
  url={pagePath}
  image={absoluteUrl("/api/og?p=/servicii")}
  structuredData={[breadcrumbList, servicesItemList]}
/>

      <Breadcrumbs items={crumbs} />

      {/* Hero (LCP discret) */}
      <section className="section">
        <div className="container">
          <Appear>
            <Hero
              title="Servicii ZephiraEvents"
              subtitle="SalÄ de evenimente Ă®n FocČ™ani, Vrancea â€” organizare completÄ pentru nunČ›i, botezuri, majorate Č™i corporate, cu servicii impecabile Č™i coordonare A-Z."
              image={{
                src: "/images/current/hero-services.jpg",
                alt: "SalÄ de evenimente ZephiraEvents din FocČ™ani",
              }}
              height="md"
            />
          </Appear>
        </div>
      </section>

      <Separator />

      {/* GrupÄm secČ›iunile pentru intrare pe rĂ˘nd (stagger Ă®ntre secČ›iuni) */}
      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        <section className="section">
          <div className="container">
            <Appear>
              <IntroSection
                eyebrow="Ce oferim Ă®n FocČ™ani, Vrancea"
                title="Servicii complete pentru evenimente reuČ™ite"
                lede="De la planificare Č™i design de salÄ la meniu, decor, foto-video, DJ Č™i coordonare Ă®n ziua evenimentului â€” soluČ›ii end-to-end pentru nuntÄ, botez, majorat sau corporate, cu servicii impecabile Č™i atenČ›ie la detalii."
              />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* Lista completÄ de servicii */}
        <section className="section">
          <div className="container">
            <Appear>
              <ServiciiComplete />
            </Appear>
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <MotivationCards
                items={[
                  {
                    title: "Organizare & logisticÄ",
                    points: [
                      "Plan dedicat pentru nuntÄ, botez, majorat",
                      "Coordonare A-Z Ă®n ziua evenimentului",
                      "Parteneri: DJ, foto-video, decor",
                    ],
                    mediaSrc: "/images/motivationcards/mc-09.jpg",
                  },
                  {
                    title: "LocaČ›ie & meniu",
                    points: [
                      "SalÄ de evenimente Ă®n FocČ™ani, Vrancea",
                      "Meniu personalizat & servire impecabilÄ",
                      "Setup flexibil: clasic, modern, corporate",
                    ],
                    mediaSrc: "/images/motivationcards/mc-10.jpg",
                  },
                  {
                    title: "ExperienČ›a invitaČ›ilor",
                    points: [
                      "Flow de salÄ pentru confort",
                      "Zone foto & momente speciale",
                      "Acces facil, parcare, semnalisticÄ",
                    ],
                    mediaSrc: "/images/motivationcards/mc-11.jpg",
                  },
                  {
                    title: "TransparenČ›Ä & siguranČ›Ä",
                    points: [
                      "OfertÄ clarÄ, fÄrÄ costuri ascunse",
                      "Timeline asumat Č™i check-listuri",
                      "Suport prompt Ă®nainte Č™i dupÄ eveniment",
                    ],
                    mediaSrc: "/images/motivationcards/mc-12.jpg",
                  },
                ]}
              />
            </Appear>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <Appear>
              <Outro
                eyebrow="RezervÄ sala â€” FocČ™ani"
                title="Spune-ne data Č™i tipul evenimentului"
                lead="Trimite detalii despre nuntÄ, botez, majorat sau corporate (numÄr invitaČ›i, preferinČ›e). ĂŽČ›i rÄspundem rapid cu disponibilitatea Č™i oferta personalizatÄ."
                cta={{ label: "SolicitÄ ofertÄ", href: "/contact" }}
              />
            </Appear>
          </div>
        </section>
      </AppearGroup>
    </>
  );
};

// ==============================
// Exporturi
// ==============================
export default ServicesPage;
