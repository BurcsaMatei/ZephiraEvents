// pages/reviews.tsx
// Pagina recenzii — date din Git (data/reviews/*.json, status: approved), SSR via GitHub API.

import type { GetServerSideProps } from "next";

import Reviews from "../components/sections/reviews/Reviews";
import Seo from "../components/Seo";
import type { Json } from "../interfaces";
import { getFile, listFiles } from "../lib/admin/github";
import { absoluteOgImage, absoluteUrl, CONTACT, SITE } from "../lib/config";
import type { Rating, Review } from "../lib/reviews";
import { pageH1Class } from "../styles/sections/reviews/reviews.css";
import * as ti from "../styles/sections/tent/tentIntro.css";
import type { ReviewJson } from "./api/admin/reviews/index";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  items: Review[];
};

// ──────────────────────────────────────────────────────────
// Data fetching
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  let items: Review[] = [];

  try {
    const entries = await listFiles("data/reviews");
    const jsonFiles = entries.filter(
      (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
    );

    const all = await Promise.all(
      jsonFiles.map(async (entry) => {
        const { content } = await getFile(entry.path);
        return JSON.parse(content) as ReviewJson;
      }),
    );

    items = all
      .filter((r) => r.status === "approved")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r) => ({
        id: r.id,
        authorName: r.name,
        rating: r.rating as Rating,
        text: r.text,
        createdAt: new Date(r.publishedAt ?? r.createdAt).getTime(),
      }));
  } catch (err) {
    console.error("[reviews] GitHub fetch eșuat:", err);
  }

  return { props: { items } };
};

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────
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
    "@id": `${SITE.url}/#business`,
    name: SITE.name,
    url: absoluteUrl("/"),
    telephone: CONTACT.phone,
    image: absoluteOgImage(SITE.ogImage) || absoluteUrl("/images/og.jpg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postal,
      addressCountry: CONTACT.address.country,
    },
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
