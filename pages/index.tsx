// pages/index.tsx

// ==============================
// Imports
// ==============================
import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Appear, { AppearGroup } from "../components/animations/Appear";
import ArticlesPreview from "../components/sections/ArticlesPreview";
// Subfold heavy – lazy wrapper care montează la intrarea în viewport (SSR off în interior)
import ArcGallery from "../components/sections/homepage/ArcGallery.lazy";
import HeroIndex from "../components/sections/homepage/HeroIndex";
import IntroSection from "../components/sections/IntroSection";
import MotivationCards from "../components/sections/MotivationCards";
import Outro from "../components/sections/Outro";
import { Serviciipreview } from "../components/sections/Serviciipreview";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { getAllPosts } from "../lib/blogData";
import { absoluteUrl, seoDefaults } from "../lib/config";

// ==============================
// Types
// ==============================
type BlogPostItem = ReturnType<typeof getAllPosts>[number];
type HomeProps = { postsPreview: BlogPostItem[] };

// ==============================
// Constante
// ==============================
const breadcrumbList = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") }],
} as const satisfies Json;

// ==============================
// Component
// ==============================
const Home: NextPage<HomeProps> = ({ postsPreview }) => {
  const router = useRouter();

  // Prefetch /galerie când browserul e idle
  useEffect(() => {
    const prefetch = () => router.prefetch("/galerie");
    if (typeof window === "undefined") return;

    let cleanup: (() => void) | undefined;
    const w = window as unknown as {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(prefetch, { timeout: 2000 });
      cleanup = () => w.cancelIdleCallback?.(handle);
    } else {
      const id = window.setTimeout(prefetch, 1200);
      cleanup = () => window.clearTimeout(id);
    }
    return () => cleanup?.();
  }, [router]);

  return (
    <>
      <Seo
        title="Acasă"
        description={seoDefaults.description}
        url="/"
        image={seoDefaults.ogImage}
        structuredData={[breadcrumbList]}
      />

      {/* HERO FULL-BLEED, FĂRĂ SECTION/CONTAINER (fără niciun padding lateral) */}
      <HeroIndex
        image={{
          src: "/images/current/hero.jpg",
          alt: "",
          priority: true,
          width: 1024, // raport corect (~3:2) → anti „incorrect aspect ratio”
          height: 683,
        }}
      />

      <Separator />

      {/* Subfold: grupăm pentru intrare pe rând */}
      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        {/* Intro */}
        <section className="section">
          <div className="container">
            <Appear>
              <IntroSection
                eyebrow="Despre noi"
                title="Calitate. Claritate. Viteză."
                lede="Template-ul de bază pentru proiecte scalabile."
              />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* ArcGallery */}
        <section className="section">
          <div className="container">
            <Appear>
              <ArcGallery />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* Servicii preview */}
        <section className="section">
          <div className="container">
            <Appear>
              <Serviciipreview />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* Articole */}
        <section className="section">
          <div className="container">
            <Appear>
              <ArticlesPreview posts={postsPreview} />
            </Appear>
          </div>
        </section>

        <Separator />

        {/* MotivationCards */}
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

        <Separator />

        {/* Outro */}
        <section className="section">
          <div className="container">
            <Appear>
              <Outro
                eyebrow="Vrei să ne cunoaștem?"
                title="Hai să discutăm proiectul tău"
                lead="Spune-ne ce ai în minte și revenim rapid cu pașii următori."
                cta={{ label: "Contact", href: "/contact" }}
              />
            </Appear>
          </div>
        </section>
      </AppearGroup>

      <Separator />
    </>
  );
};

// ==============================
// Data fetching
// ==============================
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const postsPreview = getAllPosts().slice(0, 4);
  return { props: { postsPreview } };
};

// ==============================
// Exporturi
// ==============================
export default Home;
