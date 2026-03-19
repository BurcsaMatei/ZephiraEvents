// pages/reviews.tsx
// ==============================
// Pagina recenzii — date statice din data/reviews.json
// ==============================
import type { GetStaticProps } from "next";
import Head from "next/head";

import Reviews from "../components/sections/reviews/Reviews";
import { SITE } from "../lib/config";
import { getAllReviews, type Review } from "../lib/reviews";

type Props = {
  items: Review[];
};

export const getStaticProps: GetStaticProps<Props> = () => {
  return {
    props: {
      items: getAllReviews(),
    },
  };
};

export default function ReviewsPage({ items }: Props) {
  return (
    <>
      <Head>
        <title>Recenzii — ZephiraEvents</title>
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${SITE.url}/reviews`} />
      </Head>

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
