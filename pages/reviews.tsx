// pages/reviews.tsx
// Pagina recenzii — recenzii Google Business Profile (data/google-reviews.json), SSG.

import type { GetStaticProps } from "next";

import GoogleReviews from "../components/sections/GoogleReviews";
import Seo from "../components/Seo";
import type { Json } from "../interfaces";
import { absoluteOgImage, absoluteUrl, CONTACT, SITE, SOCIAL_URLS } from "../lib/config";
import {
  getGoogleReviews,
  getGoogleReviewsStats,
  type GoogleReview,
  type GoogleReviewsStats,
} from "../lib/googleReviews";
import { pageH1Class } from "../styles/sections/googleReviews.css";
import * as ti from "../styles/sections/tent/tentIntro.css";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  items: GoogleReview[];
  stats: GoogleReviewsStats;
};

// ──────────────────────────────────────────────────────────
// Data fetching (SSG — fs local la build-time)
// ──────────────────────────────────────────────────────────
export const getStaticProps: GetStaticProps<Props> = () => {
  const items = getGoogleReviews();
  const stats = getGoogleReviewsStats(items);
  return { props: { items, stats } };
};

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────
export default function ReviewsPage({ items, stats }: Props) {
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
    "@type": ["LocalBusiness", "EventVenue"],
    "@id": `${SITE.url}/#business`,
    name: SITE.name,
    url: absoluteUrl("/"),
    telephone: CONTACT.phone,
    maximumAttendeeCapacity: 250,
    image: absoluteOgImage(SITE.ogImage) || absoluteUrl("/images/og.jpg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postal,
      addressCountry: CONTACT.address.country,
    },
    sameAs: [SOCIAL_URLS.instagram, SOCIAL_URLS.tiktok, SOCIAL_URLS.googleMaps].filter(
      (u): u is string => typeof u === "string" && u.length > 0,
    ),
    ...(stats.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: stats.ratingValue,
            bestRating: 5,
            worstRating: 1,
            ratingCount: stats.ratingCount,
          },
        }
      : {}),
  };

  return (
    <>
      <Seo
        title="Recenzii — sală de evenimente în Focșani, Vrancea"
        description="Descoperă ce spun clienții ZephiraEvents despre nunțile, botezurile, majoratele și evenimentele corporate organizate la sala noastră din Focșani, județul Vrancea. Recenzii reale de pe Google."
        url="/reviews"
        image="/images/og-reviews.jpg"
        structuredData={[breadcrumbList, localBusinessLd]}
      />

      <section className="section">
        <div className="container">
          <h1 className={`${ti.heading} ${pageH1Class}`}>Recenzii clienți ZephiraEvents</h1>
        </div>
      </section>

      <GoogleReviews items={items} stats={stats} mode="page" fullBleed={false} />
    </>
  );
}
