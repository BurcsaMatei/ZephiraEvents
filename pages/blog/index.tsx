// pages/blog/index.tsx

// ==============================
// Imports
// ==============================
import type { GetStaticProps, NextPage } from "next";

import Appear, { AppearGroup } from "../../components/animations/Appear";
import BlogCard from "../../components/blog/BlogCard";
import Breadcrumbs from "../../components/Breadcrumbs";
import Grid from "../../components/Grid";
import Hero from "../../components/sections/Hero";
import IntroSection from "../../components/sections/IntroSection";
import MotivationCards from "../../components/sections/MotivationCards";
import Outro from "../../components/sections/Outro";
import Seo from "../../components/Seo";
import Separator from "../../components/Separator";
import type { Json } from "../../interfaces";
import { getAllPosts } from "../../lib/blogData";
import { absoluteUrl } from "../../lib/config";
import type { Post } from "../../types/blog";

// ==============================
// Types
// ==============================
type Props = { posts: readonly Post[] };

// ==============================
// Constants
// ==============================
const crumbs = [
  { name: "Acasă", href: "/" },
  { name: "Blog", current: true },
] as const;

// ==============================
// Page
// ==============================
const BlogIndex: NextPage<Props> = ({ posts }) => {
  const breadcrumbList: Json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
    ],
  };

  return (
    <>
      <Seo
        title="Blog"
        description="Noutăți, sfaturi și resurse pentru un web mai bun."
        url={absoluteUrl("/blog")}
        image={absoluteUrl("/images/og-blog.jpg")}
        structuredData={[breadcrumbList]}
      />

      <Breadcrumbs items={crumbs} />

      {/* Hero */}
      <section className="section">
        <div className="container">
          <Appear>
            <Hero
              title="Blog"
              subtitle="Noutăți, sfaturi practice și idei aplicabile despre Next.js, performanță și SEO."
              image={{ src: "/images/current/hero-index-blog.jpg", alt: "Hero blog" }}
              height="md"
            />
          </Appear>
        </div>
      </section>

      <Separator />

      {/* Grupăm secțiunile următoare pentru intrare pe rând */}
      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        {/* Intro */}
        <section className="section">
          <div className="container">
            <Appear>
              <IntroSection
                eyebrow="Articole"
                title="Noutăți, sfaturi și resurse"
                lede="Selectăm idei care te ajută să iei decizii mai bune pentru site-ul tău: performanță, UX, SEO și arhitectură."
                maxWidth="narrow"
              />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* Grid articole */}
        <section className="section">
          <div className="container">
            {/* Lăsăm containerul grilei neschimbat; animăm cardurile individual */}
            <Grid mobileCols={2} desktopCols={4} gap="16px" align="stretch" justify="stretch">
              {posts.map((post, i) => (
                <Appear as="div" key={post.slug} style={{ height: "100%" }} delay={0.1 * i}>
                  <BlogCard post={post} />
                </Appear>
              ))}
            </Grid>
          </div>
        </section>

        <Separator />

        {/* Motivation + Outro */}
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
                    points: [
                      "Monitorizare post-lansare",
                      "Patch-uri rapide",
                      "Optimizări periodice",
                    ],
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
};

// ==============================
// SSG
// ==============================
export const getStaticProps: GetStaticProps<Props> = async () => {
  const raw = getAllPosts();

  const posts: ReadonlyArray<Post> = raw.map((p) => {
    const out: Post = {
      slug: p.slug,
      title: p.title,
      date: p.date,
      excerpt: p.excerpt,
      tags: Array.isArray(p.tags) ? p.tags : [],
    };
    if (p.coverImage) out.coverImage = p.coverImage;
    if (p.author) out.author = p.author;
    return out;
  });

  return { props: { posts } };
};

// ==============================
// Export
// ==============================
export default BlogIndex;
