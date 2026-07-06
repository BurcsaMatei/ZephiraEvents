// pages/faq.tsx
// Pagina Întrebări frecvente (FAQ) — SSG, sursă unică pentru lista vizibilă și FAQPage JSON-LD.

import Appear, { AppearGroup } from "../components/animations/Appear";
import Seo from "../components/Seo";
import type { Json } from "../interfaces";
import { absoluteOgImage, absoluteUrl, COMPANY, CONTACT, SITE } from "../lib/config";

// ==============================
// Constants
// ==============================
const CANONICAL_PATH = "/faq";

/** Capacitatea maximă a sălii — folosită și în EventVenue (maximumAttendeeCapacity) pe / și /reviews. */
const MAX_CAPACITY = 250;

// ==============================
// Conținut FAQ — sursă unică (vizibil + JSON-LD)
// ==============================
type FaqItem = { question: string; answer: string };

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Ce tipuri de evenimente organizați?",
    answer:
      "Nunți, botezuri, cununii civile, majorate, petreceri private, banchete, evenimente corporate și team building. Oferim organizare completă A–Z sau doar locație + catering, în funcție de nevoile tale.",
  },
  {
    question: "Câte persoane încap în sală?",
    answer: `Sala găzduiește evenimente private de până la ${MAX_CAPACITY} de persoane, cu configurații de așezare adaptate tipului de eveniment (banchet, mese rotunde, ring central de dans).`,
  },
  {
    question: "Care este prețul minim per persoană?",
    answer:
      "Cel mai accesibil meniu de botez pornește de la 46 EUR/persoană (Botez Basic). Pentru nunți, prețul de pornire este 56 EUR/persoană (Basic). Pentru corporate și petreceri private, pornește de la 180 RON/persoană (~36 EUR).",
  },
  {
    question: "Ce include pachetul complet?",
    answer:
      "Locație sală, catering cu meniul ales, decor tematic, DJ/MC, foto-video (sau coordonare cu furnizorii tăi), personal de serviciu și coordonare completă în ziua evenimentului.",
  },
  {
    question: "Oferiți cort exterior?",
    answer:
      "Da. Serviciul de cort exterior permite organizarea evenimentului la locația ta — grădini, curți, proprietăți private — oriunde în județul Vrancea și zonele limitrofe. Organizarea A–Z este inclusă.",
  },
  {
    question: "Câte meniuri sunt disponibile?",
    answer:
      "17 meniuri în 4 categorii: 5 pentru nunți (Basic, Gold, Tradițional, Platinum, Diamond), 6 pentru botez și cununie, 3 pentru corporate și team building, 3 pentru petreceri private și majorate.",
  },
  {
    question: "Putem personaliza meniul?",
    answer:
      "Da. Meniurile pot fi adaptate în funcție de preferințe, alergeni sau opțiuni vegetariene. Contactează-ne pentru o degustare și o discuție personalizată.",
  },
  {
    question: "Cum rezerv o dată?",
    answer: `Contactează-ne la ${CONTACT.phone} (telefon/WhatsApp) sau prin formularul de ofertă de pe site. Rezervarea se confirmă după semnarea contractului și achitarea avansului.`,
  },
  {
    question: "Care este programul de funcționare?",
    answer:
      "Luni–Vineri, 09:00–21:00. Sâmbătă–Duminică la cerere. Pentru urgențe, WhatsApp este disponibil în afara programului.",
  },
  {
    question: "Unde este situată sala?",
    answer: `${CONTACT.address.street}, ${CONTACT.address.city}, ${CONTACT.address.region}, ${CONTACT.address.postal}, ${CONTACT.address.country}. Locație cu parcare proprie, la câțiva kilometri de centrul Focșaniului.`,
  },
  {
    question: "Cine operează ZephiraEvents?",
    answer: `${SITE.name} este proprietatea ${COMPANY.name} — CUI ${COMPANY.cui}, Reg. Com. ${COMPANY.regCom}, EUID ${COMPANY.euid}, înființată ${COMPANY.founded}.`,
  },
  {
    question: "Aveți recenzii de la clienți?",
    answer:
      "Da. Afișăm recenzii reale de pe Google Business Profile, cu o evaluare medie de 5.0/5, pe pagina de recenzii a site-ului.",
  },
];

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
