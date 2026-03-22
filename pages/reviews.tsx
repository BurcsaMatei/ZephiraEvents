// pages/reviews.tsx
// Pagina recenzii — date din Supabase (approved), fallback la data/reviews.json.

import { createClient } from "@supabase/supabase-js";
import type { GetServerSideProps } from "next";

import Reviews from "../components/sections/reviews/Reviews";
import Seo from "../components/Seo";
import type { Json } from "../interfaces";
import { absoluteUrl, SITE } from "../lib/config";
import { getAllReviews, type Rating, type Review } from "../lib/reviews";
import { pageH1Class } from "../styles/sections/reviews/reviews.css";
import * as ti from "../styles/sections/tent/tentIntro.css";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  items: Review[];
};

// ──────────────────────────────────────────────────────────
// Supabase fetch
// ──────────────────────────────────────────────────────────
async function fetchApprovedReviews(): Promise<Review[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) throw new Error("Supabase env vars lipsă");

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await client
    .from("reviews")
    .select("id, name, rating, text, photo_url, published_at, created_at")
    .eq("status", "approved")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const ts = row.published_at ?? row.created_at;
    const review: Review = {
      id: row.id as string,
      authorName: row.name as string,
      rating: (row.rating as number) as Rating,
      text: row.text as string,
      createdAt: new Date(ts as string).getTime(),
    };
    if (row.photo_url) review.profilePhotoUrl = row.photo_url as string;
    return review;
  });
}

// ──────────────────────────────────────────────────────────
// Data fetching
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  let items: Review[];

  try {
    items = await fetchApprovedReviews();
    // Dacă Supabase returnează gol dar JSON-ul are date, fallback
    if (items.length === 0) {
      items = getAllReviews();
    }
  } catch (err) {
    console.error("[reviews] Supabase fetch eșuat, fallback la JSON static:", err);
    items = getAllReviews();
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
