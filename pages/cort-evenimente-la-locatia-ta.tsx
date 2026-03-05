// pages/cort-evenimente-la-locatia-ta.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";

import Appear, { AppearGroup } from "../components/animations/Appear";
import Breadcrumbs, { type Crumb } from "../components/Breadcrumbs";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import Outro from "../components/sections/Outro";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { absoluteUrl } from "../lib/config";
import * as b from "../styles/sections/tentAtLocationBanner.css";

// ==============================
// Constante
// ==============================
const pagePath = "/cort-evenimente-la-locatia-ta";

const crumbs: Crumb[] = [
  { name: "Acasă", href: "/" },
  { name: "Servicii", href: "/servicii" },
  { name: "Cort de evenimente la locația ta", current: true },
];

const breadcrumbList = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Servicii", item: absoluteUrl("/servicii") },
    {
      "@type": "ListItem",
      position: 3,
      name: "Cort de evenimente la locația ta",
      item: absoluteUrl(pagePath),
    },
  ],
} as const satisfies Json;

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Cort de evenimente la locația ta",
  description:
    "Amplasăm un cort premium la locația aleasă de client și oferim organizare completă: catering, servire și coordonare A–Z.",
  areaServed: "Focșani, Vrancea",
  provider: {
    "@type": "Organization",
    name: "ZephiraEvents",
    url: absoluteUrl("/"),
  },
} as const satisfies Json;

// ==============================
// Component
// ==============================
const TentAtLocationPage: NextPage = () => {
  return (
    <>
      <Seo
        title="Cort de evenimente la locația ta — organizare completă A–Z"
        description="ZephiraEvents amplasează un cort premium la locația aleasă de tine și se ocupă de tot: organizare, meniu & catering, servire și coordonare A–Z — pentru un eveniment impecabil, fără stres."
        url={pagePath}
        image={absoluteUrl("/api/og?p=/cort-evenimente-la-locatia-ta")}
        structuredData={[breadcrumbList, serviceJsonLd]}
      />

      <Breadcrumbs items={crumbs} />

      <section className="section">
        <div className="container">
          <Appear>
            <Hero
              title="Cort de evenimente la locația ta"
              subtitle="Amplasăm cortul, organizăm, gătim, servim și coordonăm A–Z — tu alegi locația, noi ne ocupăm de restul."
              image={{
                src: "/images/current/hero-services.jpg",
                alt: "Cort de evenimente — servicii ZephiraEvents",
              }}
              height="md"
            />
          </Appear>
        </div>
      </section>

      <Separator />

      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        <section className="section">
          <div className="container">
            <Appear>
              <IntroSection
                eyebrow="Serviciu complet, la tine acasă"
                title="Evenimentul tău, în locația dorită"
                lede="Indiferent că e nuntă, botez, majorat sau corporate, putem amplasa un cort de evenimente la locația aleasă de tine și livrăm organizare completă: meniuri, catering, servire și coordonare A–Z."
              />
            </Appear>
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <div className={b.panel}>
                <p className={b.eyebrow}>Ce include</p>
                <h2 className={b.title}>Ne ocupăm de tot, cap-coadă</h2>
                <p className={b.lede}>
                  Venim cu soluția completă, adaptată locației și numărului de invitați — ca tu să
                  ai o experiență impecabilă, fără bătăi de cap.
                </p>

                <ul className={b.list}>
                  <li className={b.listItem}>Cort + montaj/demontaj, plan de amplasare</li>
                  <li className={b.listItem}>Meniuri personalizate + catering complet</li>
                  <li className={b.listItem}>
                    Echipă de servire + coordonare în ziua evenimentului
                  </li>
                  <li className={b.listItem}>Logistică & organizare A–Z</li>
                </ul>
              </div>
            </Appear>
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <Outro
                eyebrow="Solicită ofertă"
                title="Spune-ne locația și data evenimentului"
                lead="Trimite-ne tipul evenimentului, numărul estimativ de invitați și locația. Îți răspundem rapid cu o ofertă personalizată."
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
export default TentAtLocationPage;
