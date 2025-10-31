// pages/reviews.tsx
// ==============================
// Pagina recenzii: Formular + listă statică + paginare simplă SSR
// ==============================
import type { GetServerSideProps } from "next";
import Head from "next/head";

import Reviews from "../components/sections/Reviews";
import { kv } from "../lib/kv";
import type { Review } from "../lib/reviews";

type Props = {
  page: number;
  perPage: number;
  items: Review[];
  total: number;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const perPage = 12;
  const page = Math.max(1, Number(ctx.query.page) || 1);

  // Paginare directă din KV (newest first)
  const idsAsc = await kv.zrange<string[]>("reviews:bydate", 0, -1);
  const ids = idsAsc.reverse(); // newest first
  const total = ids.length;

  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, total);
  const slice = ids.slice(start, end);

  const pipeline = kv.pipeline();
  slice.forEach((id) => pipeline.get<Review>(`review:${id}`));
  const rows = (await pipeline.exec()).filter(Boolean) as Review[];

  // sort desc by createdAt for safety
  rows.sort((a, b) => b.createdAt - a.createdAt);

  return {
    props: {
      page,
      perPage,
      items: rows,
      total,
    },
  };
};

export default function ReviewsPage({ page, perPage, items, total }: Props) {
  // Construim query links
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const prev = page > 1 ? `/reviews?page=${page - 1}` : null;
  const next = page < lastPage ? `/reviews?page=${page + 1}` : null;

  return (
    <>
      <Head>
        <title>Recenzii — ZephiraEvents</title>
        <meta name="robots" content="index,follow" />
      </Head>

      {/* Formular doar pe pagina 1 + listă carduri egale, expand pe click */}
      <Reviews
        showForm={page === 1}
        fullBleed={false}
        limit={Math.max(perPage, items.length)}
        mode="page"
        heading="Recenzii-ZephiraEvents"
        formTitle="Scrie și tu o recenzie aici și spune-ne mai multe despre experiența ta la ZephiraEvents"
        formSubtitle="Toate recenziile sunt verificate iar recenzia ta va fi publicată pe site. Trimițând, confirmi că ești de acord ca numele și mesajul să fie afișate public."
      />

      {/* Paginare simplă */}
      <nav className="container u-text-center u-mt-md" aria-label="Paginare recenzii">
        {prev && (
          <a href={prev} style={{ marginRight: 16 }}>
            ← Înapoi
          </a>
        )}
        <span>
          Pagina {page} / {lastPage}
        </span>
        {next && (
          <a href={next} style={{ marginLeft: 16 }}>
            Înainte →
          </a>
        )}
      </nav>
    </>
  );
}
