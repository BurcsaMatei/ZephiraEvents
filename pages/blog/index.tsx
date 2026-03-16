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
        title="Blog — sală de evenimente în Focșani, Vrancea"
        description="Sfaturi și idei pentru organizarea de nunți, botezuri, majorate și evenimente corporate în Focșani, județul Vrancea — inspirație pentru sală, decor, meniu și servicii impecabile."
        url={absoluteUrl("/blog")}
        image={absoluteUrl("/api/og?p=/blog")}
        structuredData={[breadcrumbList]}
      />

      {/* Hero */}
      <section data-full-bleed="true">
        <Appear>
          <Hero
            title="Blog ZephiraEvents"
            subtitle="Ghiduri, liste de verificare și inspirație pentru nunți, botezuri, majorate și corporate în Focșani, Vrancea — sală de evenimente, organizare A-Z și servicii impecabile."
            image={{
              src: "/images/current/hero-index-blog.jpg",
              alt: "Blog ZephiraEvents — idei pentru evenimente în Focșani",
            }}
            height="md"
          />
        </Appear>
      </section>

      <Breadcrumbs items={crumbs} />

      <Separator />

      {/* Grupăm secțiunile următoare pentru intrare pe rând */}
      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        {/* Intro */}
        <section className="section">
          <div className="container">
            <Appear>
              <IntroSection
                eyebrow="Articole pentru organizarea evenimentelor"
                title="Sfaturi, inspirație & resurse practice"
                lede="Scriem despre planificarea evenimentelor în Focșani, județul Vrancea: cum alegi sala de evenimente, idei de decor, meniu, program și coordonare pentru nunți, botezuri, majorate sau corporate — ca totul să iasă impecabil."
                maxWidth="narrow"
              />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* Grid articole */}
        <section className="section">
          <div className="container">
            {/* base=1 (mobil), md=2 (tabletă portret), lg=4 (desktop) */}
            <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="16px" align="stretch" justify="stretch">
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
                    title: "Planificare & logistică",
                    points: [
                      "Checklist pentru nuntă, botez, majorat",
                      "Timeline A-Z pentru ziua evenimentului",
                      "Parteneri de încredere: DJ, foto-video, decor",
                    ],
                    mediaSrc: "/images/motivationcards/mc-13.jpg",
                    ctaHref: "/servicii",
                    backMsg: "Descoperă serviciile complete ZephiraEvents.",
                  },
                  {
                    title: "Sală & servicii",
                    points: [
                      "Sală de evenimente în Focșani, Vrancea",
                      "Meniu personalizat & servire impecabilă",
                      "Setup clasic, modern sau corporate",
                    ],
                    mediaSrc: "/images/motivationcards/mc-14.jpg",
                    ctaHref: "/servicii#meniuri-nunta",
                    backMsg: "Vezi meniurile noastre pentru nuntă.",
                  },
                  {
                    title: "Experiența invitaților",
                    points: [
                      "Flow de sală gândit pentru confort",
                      "Zone foto & momente memorabile",
                      "Acces facil, parcare, semnalistică",
                    ],
                    mediaSrc: "/images/motivationcards/mc-15.jpg",
                    ctaHref: "/galerie",
                    backMsg: "Explorează galeria evenimentelor noastre.",
                  },
                  {
                    title: "Transparență & siguranță",
                    points: [
                      "Ofertă clară, fără costuri ascunse",
                      "Comunicare rapidă și transparentă",
                      "Suport înainte și după eveniment",
                    ],
                    mediaSrc: "/images/motivationcards/mc-16.jpg",
                    ctaHref: "/contact",
                    backMsg: "Contactează-ne pentru mai multe detalii.",
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
                eyebrow="Ai un eveniment în Focșani?"
                title="Întreabă-ne orice — îți răspundem rapid"
                lead="Spune-ne tipul de eveniment (nuntă, botez, majorat sau corporate) și numărul estimativ de invitați. Îți trimitem disponibilitatea sălii și o ofertă adaptată."
                cta={{ label: "Contactează-ne", href: "/contact" }}
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
