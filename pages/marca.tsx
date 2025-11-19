// pages/marca.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";

import Seo from "../components/Seo";
import { absoluteUrl } from "../lib/config";

// ==============================
// Constante
// ==============================
const PAGE_PATH = "/marca" as const;
const PAGE_TITLE = "Marcă ZephiraEvents" as const;
const PAGE_DESCRIPTION =
  "ZephiraEvents™ este marcă în curs de înregistrare în România. Aici găsești detalii despre statutul mărcii și procesul de înregistrare la OSIM." as const;

// ==============================
// Component
// ==============================
const MarcaPage: NextPage = () => {
  const pageUrl = absoluteUrl(PAGE_PATH);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": pageUrl,
      url: pageUrl,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  ];

  return (
    <>
      <Seo
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        url={PAGE_PATH}
        structuredData={structuredData}
      />

      <main id="main-content">
        <section className="section">
          <div className="container">
            <h1>{PAGE_TITLE}</h1>
            <p>ZephiraEvents™ este marcă în curs de înregistrare în România.</p>
            <p>
              Procedura de înregistrare este derulată la Oficiul de Stat pentru Invenții și Mărci
              (OSIM). După finalizarea procesului și emiterea certificatului oficial de marcă, vom
              actualiza această pagină cu numărul de înregistrare și alte detalii relevante.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

// ==============================
// Export
// ==============================
export default MarcaPage;
