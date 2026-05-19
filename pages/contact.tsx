// pages/contact.tsx
//
// ==============================
// Imports
// ==============================
import type { NextPage } from "next";

import Appear, { AppearGroup } from "../components/animations/Appear";
import type { Crumb } from "../components/Breadcrumbs";
import Breadcrumbs from "../components/Breadcrumbs";
import OfferRequest from "../components/forms/OfferRequest";
import ContactInfo from "../components/sections/contact/ContactInfo";
import ContactMapAddress from "../components/sections/contact/ContactMapAddress";
import ContactMapIframeConsent from "../components/sections/contact/ContactMapIframeConsent";
import FormContact from "../components/sections/contact/FormContact";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import MotivationCards from "../components/sections/MotivationCards";
import OutroContact from "../components/sections/OutroContact";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { absoluteUrl, CONTACT, SITE } from "../lib/config";
import * as ti from "../styles/sections/tent/tentIntro.css";

// ==============================
// Types
// ==============================
type ContactData = {
  businessName: string;
  url: string; // path relativ de pagină
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  mapEmbedUrl: string;
};

// ==============================
// Data (din config centralizat)
// ==============================
const contactData: ContactData = {
  businessName: SITE.name,
  url: "/contact",
  email: CONTACT.email,
  phone: CONTACT.phone,
  address: {
    street: CONTACT.address.street,
    city: CONTACT.address.city,
    region: CONTACT.address.region,
    postalCode: CONTACT.address.postal,
    country: CONTACT.address.country,
  },
  mapEmbedUrl: CONTACT.mapEmbed,
};

const addressLine = [
  contactData.address.street,
  [contactData.address.city, contactData.address.region].filter(Boolean).join(", "),
  [contactData.address.postalCode, contactData.address.country].filter(Boolean).join(" "),
]
  .filter(Boolean)
  .join(", ");

// ==============================
// Breadcrumbs
// ==============================
const crumbs: Crumb[] = [
  { name: "Acasă", href: "/" },
  { name: "Contact", current: true },
];

// ==============================
// Helpers locale (JSON-LD)
// ==============================
function buildBreadcrumbList(pagePath: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Contact", item: absoluteUrl(pagePath) },
    ],
  };
}

function buildContactOrg(data: ContactData): Json {
  return {
    "@type": "Organization",
    name: data.businessName,
    url: absoluteUrl(data.url),
    ...(data.phone || data.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            ...(data.phone ? { telephone: data.phone } : {}),
            ...(data.email ? { email: data.email } : {}),
          },
        }
      : {}),
    ...((data.address.street ||
      data.address.city ||
      data.address.region ||
      data.address.postalCode ||
      data.address.country) && {
      address: {
        "@type": "PostalAddress",
        ...(data.address.street ? { streetAddress: data.address.street } : {}),
        ...(data.address.city ? { addressLocality: data.address.city } : {}),
        ...(data.address.region ? { addressRegion: data.address.region } : {}),
        ...(data.address.postalCode ? { postalCode: data.address.postalCode } : {}),
        ...(data.address.country ? { addressCountry: data.address.country } : {}),
      },
    }),
  };
}

const breadcrumbList = buildBreadcrumbList(contactData.url);
const contactJsonLd: Json = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: buildContactOrg(contactData),
};

// ==============================
// Page
// ==============================
const ContactPage: NextPage = () => (
  <>
    <Seo
      title="Contact — sală de evenimente în Focșani, Vrancea"
      description="Contactează ZephiraEvents pentru organizarea de nunți, botezuri, majorate și evenimente corporate în Focșani, județul Vrancea. Verifică disponibilitatea sălii, solicită ofertă personalizată și beneficiezi de servicii impecabile, coordonare A-Z și răspuns rapid."
      url={contactData.url}
      image="/images/og-contact.jpg"
      structuredData={[breadcrumbList, contactJsonLd]}
    />

    {/* Hero */}
    <section data-full-bleed="true">
      <Appear>
        <Hero
          title="Contactează ZephiraEvents din Focșani, Vrancea"
          subtitle="Sală de evenimente în Focșani, Vrancea — scrie-ne pentru nuntă, botez, majorat sau corporate. Îți răspundem rapid cu disponibilitatea sălii și o ofertă adaptată."
          image={{
            src: "/images/current/hero-contact.webp",
            alt: "Contact sală de evenimente ZephiraEvents, Focșani",
          }}
          height="md"
        />
      </Appear>
    </section>

    <Breadcrumbs items={crumbs} />

    <Separator />

    {/* Secțiuni în cascadă */}
    <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
      <section className="section">
        <div className="container">
          <Appear>
            <IntroSection
              eyebrow="Contact — Focșani, Vrancea"
              title={`Contact ${contactData.businessName}`}
              lede="Completează formularul pentru a rezerva sala de evenimente sau folosește datele de mai jos. Spune-ne tipul evenimentului (nuntă, botez, majorat sau corporate) și numărul estimativ de invitați — revenim rapid cu oferta și pașii următori."
            />
          </Appear>
        </div>
      </section>

      <Separator />

      {/* Formular */}
      {CONTACT.enabled && (
        <section className="section">
          <div className="container">
            <Appear>
              <FormContact />
            </Appear>
          </div>
        </section>
      )}

      <Separator />
      {/* ==== «Solicită ofertă» — după formularul de contact existent ==== */}
      <section id="oferta" className="section">
        <div className="container">
          <OfferRequest />
        </div>
      </section>
      <Separator />

      {/* Hartă */}
      {CONTACT.enabled && contactData.mapEmbedUrl ? (
        <section className="section" aria-label="Hartă locație">
          <div className="container">
            <Appear>
              <ContactMapAddress />
              <ContactMapIframeConsent src={contactData.mapEmbedUrl} />
            </Appear>
          </div>
        </section>
      ) : null}

      <Separator />

      {/* Date contact */}
      {CONTACT.enabled && (
        <section className="section">
          <div className="container">
            <Appear>
              <ContactInfo
                businessName={contactData.businessName}
                address={addressLine || "—"}
                phone={contactData.phone || "—"}
                email={contactData.email || "—"}
              />
            </Appear>
          </div>
        </section>
      )}

      <Separator />

      <section className="section">
        <div className="container">
          <Appear>
            <div className={ti.wrap}>
              <p className={ti.eyebrow}>Suntem aici pentru tine</p>
              <h2 className={ti.heading}>Hai să construim ceva frumos împreună</h2>
              <p className={ti.lede}>
                Indiferent de tipul evenimentului, echipa noastră te ghidează de la prima discuție
                până la final.
              </p>
            </div>
          </Appear>
        </div>
      </section>

      <Separator />

      {/* Cards + OutroContact */}
      <section className="section">
        <div className="container">
          <Appear>
            <MotivationCards
              items={[
                {
                  title: "Rezervare & organizare",
                  points: [
                    "Disponibilitate sală pentru Focșani, Vrancea",
                    "Plan dedicat pentru nuntă, botez, majorat",
                    "Coordonare A-Z în ziua evenimentului",
                  ],
                  mediaSrc: "/images/motivationcards/mc-17.webp",
                  ctaHref: "/servicii",
                  backMsg: "Descoperă toate serviciile noastre.",
                },
                {
                  title: "Servicii impecabile",
                  points: [
                    "Meniu personalizat & servire atentă",
                    "Parteneri DJ, foto-video & decor",
                    "Setup clasic, modern sau corporate",
                  ],
                  mediaSrc: "/images/motivationcards/mc-18.webp",
                  ctaHref: "/servicii#meniuri-nunta",
                  backMsg: "Vezi meniurile noastre pentru nuntă.",
                },
                {
                  title: "Confort pentru invitați",
                  points: [
                    "Flow de sală gândit pentru experiență",
                    "Zone foto & momente memorabile",
                    "Acces facil, parcare, semnalistică",
                  ],
                  mediaSrc: "/images/motivationcards/mc-19.webp",
                  ctaHref: "/galerie",
                  backMsg: "Explorează galeria evenimentelor noastre.",
                },
                {
                  title: "Transparență & siguranță",
                  points: [
                    "Ofertă clară, fără costuri ascunse",
                    "Timeline asumat și check-listuri",
                    "Suport prompt înainte/după eveniment",
                  ],
                  mediaSrc: "/images/motivationcards/mc-20.webp",
                  ctaHref: "/blog",
                  backMsg: "Citește articolele noastre pe blog.",
                },
              ]}
            />
          </Appear>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Appear>
            <OutroContact />
          </Appear>
        </div>
      </section>
    </AppearGroup>
  </>
);

export default ContactPage;
