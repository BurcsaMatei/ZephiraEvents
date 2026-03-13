// pages/servicii.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";

import Appear, { AppearGroup } from "../components/animations/Appear";
import Breadcrumbs, { type Crumb } from "../components/Breadcrumbs";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import ArcMenuGallery from "../components/sections/menus/ArcMenuGallery";
import MotivationCards from "../components/sections/MotivationCards";
import Outro from "../components/sections/Outro";
import ServiciiComplete from "../components/sections/servicii/ServiciiComplete";
import TentAtLocationBanner from "../components/sections/TentAtLocationBanner";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { absoluteUrl } from "../lib/config";
import { getMenusByEventType } from "../lib/menus";
import * as tent from "../styles/sections/tentAtLocationBanner.css";

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
  const nuntaMenus = getMenusByEventType("Nunta");
  const botezMenus = getMenusByEventType("Botez & Cununie");
  const privateMenus = getMenusByEventType("Petreceri Private & Majorate");
  const corporateMenus = getMenusByEventType("Corporate & Team Building");

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

        {/* Banner: Cort la locație */}
        <section className="section">
          <div className="container">
            <Appear>
              <TentAtLocationBanner />
            </Appear>
          </div>
        </section>

        {/* Intro: Ce include serviciul de cort */}
        <section className="section">
          <div className="container">
            <Appear>
              <div className={tent.introBlock}>
                <p className={tent.introLede}>
                  organizare, catering, servire și coordonare A–Z — ca tu să ai un eveniment
                  impecabil, fără stres.
                </p>
                <ul className={tent.introList}>
                  <li className={tent.introListItem}>
                    Cort + montaj/demontaj, setup adaptat locației
                  </li>
                  <li className={tent.introListItem}>
                    Meniu complet &amp; catering, opțiuni personalizate
                  </li>
                  <li className={tent.introListItem}>
                    Echipă de servire + coordonare în ziua evenimentului
                  </li>
                  <li className={tent.introListItem}>Logistică &amp; organizare cap-coadă</li>
                </ul>
              </div>
            </Appear>
          </div>
        </section>

        <Separator />

        {/* Meniuri nuntă */}
        <Appear>
          <ArcMenuGallery
            id="meniuri-nunta"
            heading="OFERTE MENIURI"
            menus={nuntaMenus}
            presentation={{
              eyebrow: "Meniuri nuntă",
              title: "MENIURI",
              lede: "Meniuri gândite pentru o nuntă elegantă, cu preparate echilibrate și prezentare impecabilă. Personalizăm opțiunile în funcție de preferințe (copii, vegetarian, alergeni), astfel încât masa să completeze perfect atmosfera serii.",
            }}
          />
        </Appear>

        <Separator />

        {/* Meniuri botez & cununie */}
        <Appear>
          <ArcMenuGallery
            id="meniuri-botez-cununie"
            heading="OFERTE MENIURI"
            menus={botezMenus}
            presentation={{
              eyebrow: "Meniuri botez & cununie",
              title: "MENIURI",
              lede: "Opțiuni potrivite pentru botez și cununie, cu gusturi clasice și porții bine calculate. Ajustăm structura meniului în funcție de invitați și preferințe, pentru o experiență lejeră și memorabilă.",
            }}
          />
        </Appear>

        <Separator />

        {/* Meniuri petreceri private & majorate */}
        <Appear>
          <ArcMenuGallery
            id="meniuri-petreceri-private-majorate"
            heading="OFERTE MENIURI"
            menus={privateMenus}
            presentation={{
              eyebrow: "Meniuri petreceri private & majorate",
              title: "MENIURI",
              lede: "Meniuri flexibile pentru petreceri private și majorate — combinații fresh, ritm bun al servirii și opțiuni pentru toate preferințele. Alegem împreună varianta care se potrivește stilului tău de eveniment.",
            }}
          />
        </Appear>

        <Separator />

        {/* Meniuri corporate & team building */}
        <Appear>
          <ArcMenuGallery
            id="meniuri-corporate-team-building"
            heading="OFERTE MENIURI"
            menus={corporateMenus}
            presentation={{
              eyebrow: "Meniuri corporate & team building",
              title: "MENIURI",
              lede: "Meniuri pentru evenimente corporate și team building, cu servire eficientă și opțiuni versatile. Personalizăm în funcție de program, număr de invitați și tipul momentului (protocol, buffet, cină).",
            }}
          />
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
