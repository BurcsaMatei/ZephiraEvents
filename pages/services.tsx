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
const pagePath = "/services";

const crumbs: Crumb[] = [
  { name: "Acasă", href: "/" },
  { name: "Servicii", current: true },
];

const breadcrumbList = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Servicii", item: absoluteUrl(pagePath) },
  ],
} as const satisfies Json;

// JSON-LD: ItemList de servicii (nume + descriere, fără URL individual)
const serviceItems = [
  {
    name: "Design UI/UX",
    description: "Proiectare interfețe clare și moderne, orientate pe conversie.",
  },
  {
    name: "Dezvoltare Next.js",
    description: "Site-uri rapide, scalabile, cu TypeScript strict și bune practici.",
  },
  {
    name: "Optimizare performanță & SEO tehnic",
    description: "Analiză, corecții și bune practici pentru viteză și indexare.",
  },
  {
    name: "Conținut și blog",
    description: "Structură editorială și texte clare, optimizate pentru SEO.",
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
        title="Servicii"
        description="Servicii web: design modern, dezvoltare Next.js, optimizare & SEO, conținut & blog."
        url={pagePath}
        image="/images/og-services.jpg"
        structuredData={[breadcrumbList, servicesItemList]}
      />

      <Breadcrumbs items={crumbs} />

      {/* Hero (LCP discret) */}
      <section className="section">
        <div className="container">
          <Appear>
            <Hero
              title="Servicii"
              subtitle="Tot ce ai nevoie pentru un site rapid și scalabil."
              image={{ src: "/images/current/hero-services.jpg", alt: "Hero servicii" }}
              height="md"
            />
          </Appear>
        </div>
      </section>

      <Separator />

      {/* Grupăm secțiunile pentru intrare pe rând (stagger între secțiuni) */}
      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        <section className="section">
          <div className="container">
            <Appear>
              <IntroSection
                eyebrow="Ce facem"
                title="Servicii web end-to-end"
                lede="Design UI/UX, dezvoltare Next.js, optimizare performanță & SEO tehnic, conținut și blog — integrate într-un flux clar."
              />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* Lista completă de servicii */}
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
                    title: "Procesul nostru",
                    points: ["Brief & plan clar", "Sprinturi transparente", "QA riguros"],
                  },
                  {
                    title: "Consultanță & PR",
                    points: ["Arhitectură & strategie", "SEO & performanță", "Mentorat tehnic"],
                  },
                  {
                    title: "Clienți mulțumiți",
                    points: ["SLA răspuns rapid", "Tracking transparent", "Îmbunătățiri continue"],
                  },
                  {
                    title: "Suport maxim",
                    points: [
                      "Monitorizare post-lansare",
                      "Patch-uri rapide",
                      "Optimizări periodice",
                    ],
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
                eyebrow="Vrei să intri în contact direct cu noi?"
                title="Hai să discutăm proiectul tău"
                lead="Spune-ne ce ai în minte și revenim rapid cu pașii următori."
                cta={{ label: "Contact", href: "/contact" }}
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
