// pages/servicii.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";

import Appear, { AppearGroup } from "../components/animations/Appear";
import Breadcrumbs, { type Crumb } from "../components/Breadcrumbs";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import MenuOffers from "../components/sections/MenuOffers";
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
    name: "Locație & sală de evenimente",
    description:
      "Sală modernă în Focșani, setup flexibil pentru nuntă, botez, majorat sau corporate.",
  },
  {
    name: "Organizare & coordonare A–Z",
    description:
      "Planificare completă, timeline asumat, check-list și coordonare în ziua evenimentului.",
  },
  {
    name: "Meniu & catering",
    description:
      "Meniuri personalizate, servire impecabilă, opțiuni dietare (vegetarian, copii, alergeni).",
  },
  {
    name: "Decor & aranjamente",
    description: "Concept vizual, flori, candy bar, zone foto, semnalistică și styling al sălii.",
  },
  {
    name: "Foto-video & DJ/MC",
    description:
      "Parteneri validați, pachete flexibile, sunet și lumini potrivite pentru atmosferă.",
  },
  {
    name: "Corporate & conferințe",
    description: "Setup scenă/ecran, logistică pentru prezentări, coffee break & protocol.",
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
        description="ZephiraEvents oferă organizare completă pentru nunți, botezuri, majorate și evenimente corporate în Focșani, județul Vrancea — sală de evenimente, meniu personalizat, decor, foto-video, DJ, coordonare A–Z și servicii impecabile."
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
              subtitle="Sală de evenimente în Focșani, Vrancea — organizare completă pentru nunți, botezuri, majorate și corporate, cu servicii impecabile și coordonare A–Z."
              image={{
                src: "/images/current/hero-services.jpg",
                alt: "Sală de evenimente ZephiraEvents din Focșani",
              }}
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
                eyebrow="Ce oferim în Focșani, Vrancea"
                title="Servicii complete pentru evenimente reușite"
                lede="De la planificare și design de sală la meniu, decor, foto-video, DJ și coordonare în ziua evenimentului — soluții end-to-end pentru nuntă, botez, majorat sau corporate, cu servicii impecabile și atenție la detalii."
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
        <Appear>
          <MenuOffers />
        </Appear>
        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <MotivationCards
                items={[
                  {
                    title: "Organizare & logistică",
                    points: [
                      "Plan dedicat pentru nuntă, botez, majorat",
                      "Coordonare A–Z în ziua evenimentului",
                      "Parteneri: DJ, foto-video, decor",
                    ],
                    mediaSrc: "/images/motivationcards/mc-09.jpg",
                  },
                  {
                    title: "Locație & meniu",
                    points: [
                      "Sală de evenimente în Focșani, Vrancea",
                      "Meniu personalizat & servire impecabilă",
                      "Setup flexibil: clasic, modern, corporate",
                    ],
                    mediaSrc: "/images/motivationcards/mc-10.jpg",
                  },
                  {
                    title: "Experiența invitaților",
                    points: [
                      "Flow de sală pentru confort",
                      "Zone foto & momente speciale",
                      "Acces facil, parcare, semnalistică",
                    ],
                    mediaSrc: "/images/motivationcards/mc-11.jpg",
                  },
                  {
                    title: "Transparență & siguranță",
                    points: [
                      "Ofertă clară, fără costuri ascunse",
                      "Timeline asumat și check-listuri",
                      "Suport prompt înainte și după eveniment",
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
                eyebrow="Rezervă sala — Focșani"
                title="Spune-ne data și tipul evenimentului"
                lead="Trimite detalii despre nuntă, botez, majorat sau corporate (număr invitați, preferințe). Îți răspundem rapid cu disponibilitatea și oferta personalizată."
                cta={{ label: "Solicită ofertă", href: "/contact" }}
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
