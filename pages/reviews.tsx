// pages/reviews.tsx
// ==============================
// Pagina recenzii — date statice din data/reviews.json
// ==============================
import type { GetStaticProps } from "next";

import Reviews from "../components/sections/reviews/Reviews";
import Seo from "../components/Seo";
import type { Json } from "../interfaces";
import { absoluteUrl, SITE } from "../lib/config";
import { getAllReviews, type Review } from "../lib/reviews";
import { pageH1Class } from "../styles/sections/reviews/reviews.css";
import * as ti from "../styles/sections/tent/tentIntro.css";

// ==============================
// Types
// ==============================
type Props = {
  items: Review[];
};

// ==============================
// Data fetching
// ==============================
export const getStaticProps: GetStaticProps<Props> = () => {
  return {
    props: {
      items: getAllReviews(),
    },
  };
};

// ==============================
// Page
// ==============================
export default function ReviewsPage({ items }: Props) {
  const ratingCount = items.length;
  const ratingValue =
    ratingCount > 0
      ? Math.round((items.reduce((sum, r) => sum + r.rating, 0) / ratingCount) * 10) / 10
      : 5;

  const breadcrumbList: Json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Recenzii", item: absoluteUrl("/reviews") },
    ],
  };

  const localBusinessLd: Json = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    url: absoluteUrl("/"),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      bestRating: 5,
      worstRating: 1,
      ratingCount,
    },
  };

  return (
    <>
      <Seo
        title="Recenzii — sală de evenimente în Focșani, Vrancea"
        description="Descoperă ce spun clienții ZephiraEvents despre nunțile, botezurile, majoratele și evenimentele corporate organizate la sala noastră din Focșani, județul Vrancea. Recenzii reale de la cupluri și firme."
        url="/reviews"
        image="/images/og-reviews.jpg"
        structuredData={[breadcrumbList, localBusinessLd]}
      />

      <section className="section">
        <div className="container">
          <h1 className={`${ti.heading} ${pageH1Class}`}>Recenzii clienți ZephiraEvents</h1>
        </div>
      </section>

      <Reviews
        showForm
        fullBleed={false}
        limit={items.length}
        mode="page"
        heading="Recenzii"
        initialItems={items}
        formTitle="Scrie și tu o recenzie și spune-ne mai multe despre experiența ta la ZephiraEvents"
        formSubtitle="Toate recenziile sunt moderate. Trimițând, confirmi că ești de acord ca numele și mesajul să fie afișate public."
      />
    </>
  );
}
