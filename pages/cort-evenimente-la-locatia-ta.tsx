// pages/cort-evenimente-la-locatia-ta.tsx

// ==============================
// Imports
// ==============================
import "yet-another-react-lightbox/styles.css";

import type { NextPage } from "next";

import Appear, { AppearGroup } from "../components/animations/Appear";
import Breadcrumbs, { type Crumb } from "../components/Breadcrumbs";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import MotivationCards from "../components/sections/MotivationCards";
import Outro from "../components/sections/Outro";
import TentGallery from "../components/sections/tent/TentGallery";
import TentVideos from "../components/sections/tent/TentVideos";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { absoluteUrl, CONTACT } from "../lib/config";
import * as btn from "../styles/button.css";
import * as ti from "../styles/sections/tent/tentIntro.css";

// ==============================
// Constante
// ==============================
const pagePath = "/cort-evenimente-la-locatia-ta";
const telHref = CONTACT.phone ? `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}` : "";

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
        image="/images/og-cort.jpg"
        structuredData={[breadcrumbList, serviceJsonLd]}
      />

      <section data-full-bleed="true">
        <Appear>
          <Hero
            title="Cort de evenimente premium — la locația ta din Vrancea"
            subtitle="Amplasăm cortul, organizăm, gătim, servim și coordonăm A–Z — tu alegi locația, noi ne ocupăm de restul."
            image={{
              src: "/images/current/hero-tent.webp",
              alt: "Cort de evenimente — servicii ZephiraEvents",
            }}
            height="md"
          />
        </Appear>
      </section>

      <Breadcrumbs items={crumbs} />

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
              <div className={ti.wrap}>
                <p className={ti.eyebrow}>Ce include</p>
                <h2 className={ti.heading}>Ne ocupăm de tot, cap-coadă</h2>
                <p className={ti.lede}>
                  Venim cu soluția completă, adaptată locației și numărului de invitați — ca tu să
                  ai o experiență impecabilă, fără bătăi de cap.
                </p>

                <ul className={ti.list}>
                  <li className={ti.listItem}>Cort + montaj/demontaj, plan de amplasare</li>
                  <li className={ti.listItem}>Meniuri personalizate + catering complet</li>
                  <li className={ti.listItem}>
                    Echipă de servire + coordonare în ziua evenimentului
                  </li>
                  <li className={ti.listItem}>Logistică & organizare A–Z</li>
                </ul>
              </div>
            </Appear>
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <TentVideos />
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <div className={ti.wrap}>
                <p className={ti.eyebrow}>Locația ta, atmosfera noastră</p>
                <h2 className={ti.heading}>
                  Transformăm orice spațiu într-un eveniment de neuitat
                </h2>
                <p className={ti.lede}>
                  De la grădini private la ferme, de la curți de conac la terase cu priveliște —
                  aducem cortul, echipa și magia direct la tine. Tu alegi locul, noi ne ocupăm de
                  tot.
                </p>
                {telHref && (
                  <div className={ti.ctaRow}>
                    <a href={telHref} className={`${btn.btn} ${btn.primary} ${btn.lg}`}>
                      {CONTACT.phone}
                    </a>
                  </div>
                )}
              </div>
            </Appear>
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <TentGallery />
          </div>
        </section>

        <Separator />

        <section className="section">
          <div className="container">
            <Appear>
              <div className={ti.wrap}>
                <p className={ti.eyebrow}>De ce ZephiraEvents</p>
                <h2 className={ti.heading}>Experiență reală. Oameni de încredere.</h2>
                <p className={ti.lede}>
                  Am organizat sute de evenimente în locații diverse — și știm că fiecare detaliu
                  contează. Aducem cu noi nu doar echipamentul, ci și liniștea ta în ziua cea mare.
                </p>
              </div>
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
                    title: "Nuntă în aer liber",
                    points: [
                      "Cort premium, montat și demontat de echipa noastră",
                      "Decor personalizat și coordonare completă",
                      "Meniu și catering la standarde înalte",
                    ],
                    mediaSrc: "/images/motivationcards/mc-21.webp",
                    ctaHref: "/servicii#meniuri-nunta",
                    backMsg: "Vezi meniurile complete pentru nunta ta.",
                  },
                  {
                    title: "Botez și majorat la locație",
                    points: [
                      "Concept personalizat pentru familia ta",
                      "Echipă de servire + coordonare în ziua mare",
                      "Meniu adaptat și program flexibil",
                    ],
                    mediaSrc: "/images/motivationcards/mc-22.webp",
                    ctaHref: "/servicii#meniuri-botez-cununie",
                    backMsg: "Explorează pachetele pentru botez și cununie.",
                  },
                  {
                    title: "Corporate la alegerea ta",
                    points: [
                      "Setup complet pentru events și gale",
                      "Logistică, tehnic și protocol la cheie",
                      "Accesibil oriunde în județ",
                    ],
                    mediaSrc: "/images/motivationcards/mc-23.webp",
                    ctaHref: "/servicii#meniuri-corporate-team-building",
                    backMsg: "Descoperă soluțiile noastre corporate.",
                  },
                  {
                    title: "Locație unică, servicii complete",
                    points: [
                      "De la curți private la ferme și conace",
                      "Organizare A–Z fără bătăi de cap",
                      "Transparență totală la ofertă",
                    ],
                    mediaSrc: "/images/motivationcards/mc-24.webp",
                    ctaHref: "/cort-evenimente-la-locatia-ta",
                    backMsg: "Află mai multe despre serviciul de cort la locația ta.",
                  },
                ]}
              />
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
