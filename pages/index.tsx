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
                eyebrow="Sală de evenimente în Focșani, Vrancea"
                title="Evenimente impecabile. Fără stres."
                lede="ZephiraEvents — sală de evenimente în Focșani, județul Vrancea — pentru nunți, botezuri, majorate și evenimente corporate. Organizare cap-coadă, servicii impecabile și atenție la detalii pentru tine și invitații tăi."
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
                    title: "Organizare & logistică",
                    points: [
                      "Plan dedicat pentru nuntă, botez, majorat",
                      "Coordonare A-Z în ziua evenimentului",
                      "Parteneri de încredere: DJ, foto-video, decor",
                    ],
                  },
                  {
                    title: "Locație & servicii",
                    points: [
                      "Sală de evenimente în Focșani, Vrancea",
                      "Meniu personalizat & servire impecabilă",
                      "Setup flexibil: clasic, modern, corporate",
                    ],
                  },
                  {
                    title: "Experiență pentru invitați",
                    points: [
                      "Flow de sală gândit pentru confort",
                      "Scenografie foto & momente speciale",
                      "Acces facil, parcare, indicatoare",
                    ],
                  },
                  {
                    title: "Transparență & siguranță",
                    points: [
                      "Ofertă clară, fără costuri ascunse",
                      "Timeline asumat și check-listuri",
                      "Suport prompt înainte și după eveniment",
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
                eyebrow="Rezervă-ți data"
                title="Hai să-ți planificăm evenimentul în Focșani"
                lead="Spune-ne tipul de eveniment (nuntă, botez, majorat sau corporate) și numărul estimativ de invitați. Îți răspundem rapid cu disponibilitatea sălii și o ofertă adaptată."
                cta={{ label: "Verifică disponibilitatea", href: "/contact" }}
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
