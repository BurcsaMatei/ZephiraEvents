// pages/contact.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";

import Appear, { AppearGroup } from "../components/animations/Appear";
import type { Crumb } from "../components/Breadcrumbs";
import Breadcrumbs from "../components/Breadcrumbs";
import ContactInfo from "../components/sections/contact/ContactInfo";
import ContactMapIframeConsent from "../components/sections/contact/ContactMapIframeConsent";
import FormContact from "../components/sections/contact/FormContact";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import MotivationCards from "../components/sections/MotivationCards";
import Outro from "../components/sections/Outro";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { absoluteUrl, CONTACT, SITE } from "../lib/config";

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
const crumbs: Crumb[] = [
  { name: "Acasă", href: "/" },
  { name: "Contact", current: true },
];

const ContactPage: NextPage = () => (
  <>
    <Seo
      title="Contact"
      description={SITE.description || "Contactează-ne pentru detalii și ofertă."}
      url={contactData.url}
      image="/images/og-contact.jpg"
      structuredData={[breadcrumbList, contactJsonLd]}
    />

    <Breadcrumbs items={crumbs} />

    {/* Hero */}
    <section className="section">
      <div className="container">
        <Appear>
          <Hero
            title="Contact"
            subtitle="Scrie-ne — revenim rapid."
            image={{ src: "/images/current/hero-contact.jpg", alt: "Hero contact" }}
            height="md"
          />
        </Appear>
      </div>
    </section>

    <Separator />

    {/* Secțiuni în cascadă */}
    <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
      <section className="section">
        <div className="container">
          <Appear>
            <IntroSection
              eyebrow="Hai să vorbim"
              title={`Contact ${contactData.businessName}`}
              lede="Completează formularul sau folosește datele de mai jos."
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

      {/* Hartă */}
      {CONTACT.enabled && contactData.mapEmbedUrl ? (
        <section className="section" aria-label="Hartă locație">
          <div className="container">
            <Appear>
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

      {/* Cards + Outro */}
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
                  points: ["Monitorizare post-lansare", "Patch-uri rapide", "Optimizări periodice"],
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

export default ContactPage;
