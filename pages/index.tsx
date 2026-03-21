// pages/index.tsx

// ==============================
// Imports
// ==============================
import type { GetStaticProps, NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Appear, { AppearGroup } from "../components/animations/Appear";
import ArticlesPreview from "../components/sections/ArticlesPreview";
// Componente homepage heavy — SSR off, lazy loaded
import HeroIndex from "../components/sections/homepage/HeroIndex";
import LogoBeforeIntro from "../components/sections/homepage/LogoBeforeIntro";
import IntroSection from "../components/sections/IntroSection";
import MotivationCards from "../components/sections/MotivationCards";
import Outro from "../components/sections/Outro";
import { Serviciipreview } from "../components/sections/Serviciipreview";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { getAllPosts } from "../lib/blogData";
import { absoluteUrl } from "../lib/config";
import { getLatestReviews, type Review } from "../lib/reviews";
import * as ti from "../styles/sections/tent/tentIntro.css";

const ArcGallery = dynamic(() => import("../components/sections/homepage/ArcGallery.lazy"), {
  ssr: false,
  loading: () => null,
});
const TentAtLocationBanner = dynamic(
  () => import("../components/sections/tent/TentAtLocationBanner"),
  { ssr: false, loading: () => null },
);
const Reviews = dynamic(() => import("../components/sections/reviews/Reviews"), {
  ssr: false,
  loading: () => null,
});

// ==============================
// Types
// ==============================
type BlogPostItem = ReturnType<typeof getAllPosts>[number];
type HomeProps = { postsPreview: BlogPostItem[]; reviewItems: Review[] };

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
const Home: NextPage<HomeProps> = ({ postsPreview, reviewItems }) => {
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
      <Head>
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=%2Fimages%2Fcurrent%2Fhero.jpg&w=640&q=70"
          imageSrcSet="
            /_next/image?url=%2Fimages%2Fcurrent%2Fhero.jpg&w=360&q=70 360w,
            /_next/image?url=%2Fimages%2Fcurrent%2Fhero.jpg&w=640&q=70 640w,
            /_next/image?url=%2Fimages%2Fcurrent%2Fhero.jpg&w=768&q=70 768w,
            /_next/image?url=%2Fimages%2Fcurrent%2Fhero.jpg&w=1024&q=70 1024w,
            /_next/image?url=%2Fimages%2Fcurrent%2Fhero.jpg&w=1280&q=70 1280w,
            /_next/image?url=%2Fimages%2Fcurrent%2Fhero.jpg&w=1920&q=70 1920w
          "
          imageSizes="100vw"
        />
      </Head>
      <Seo
        title="Acasă"
        description="Sală de evenimente premium în Focșani, Vrancea — nunți, botezuri, majorate și corporate. Organizare A-Z, meniuri personalizate, cort exterior la locația ta și servicii impecabile."
        url="/"
        image="/images/og.jpg"
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
        heading="ZephiraEvents"
        subheading="Sală de evenimente în Focșani, Vrancea"
      />

      {/* Subfold: grupăm pentru intrare pe rând (fără Reviews aici) */}
      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        {/* Intro */}
        <section className="section">
          <div className="container">
            <Appear>
              <>
                <LogoBeforeIntro />
                <IntroSection
                  eyebrow="Sală de evenimente în Focșani, Vrancea"
                  title="Evenimente impecabile. Fără stres."
                  lede="ZephiraEvents — sală de evenimente în Focșani, județul Vrancea — pentru nunți, botezuri, majorate și evenimente corporate. Organizare cap-coadă, servicii impecabile și atenție la detalii pentru tine și invitații tăi."
                />
              </>
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

        {/* Banner: Cort la locație */}
        <section className="section">
          <div className="container">
            <Appear>
              <TentAtLocationBanner />
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
      </AppearGroup>

      <Separator />

      {/* REVIEWS FULL-BLEED — ÎN AFARA oricărui .container / .section / AppearGroup */}
      <Reviews fullBleed mode="home" showForm={false} limit={12} initialItems={reviewItems} />

      <Separator />

      {/* Pre-intro + MotivationCards + Outro */}
      <AppearGroup stagger={0.12} delay={0.06} amount={0.2}>
        <section className="section">
          <div className="container">
            <Appear>
              <div className={ti.wrap}>
                <p className={ti.eyebrow}>De ce noi</p>
                <h2 className={ti.heading}>Calitate dovedită, oameni de încredere</h2>
                <p className={ti.lede}>
                  De la primul detaliu până la ultimul toast — suntem alături de tine la fiecare
                  pas.
                </p>
              </div>
            </Appear>
          </div>
        </section>

        <Separator />

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
                    ctaHref: "/servicii",
                    backMsg: "Descoperă cum organizăm fiecare detaliu pentru tine.",
                  },
                  {
                    title: "Locație & servicii",
                    points: [
                      "Sală de evenimente în Focșani, Vrancea",
                      "Meniu personalizat & servire impecabilă",
                      "Setup flexibil: clasic, modern, corporate",
                    ],
                    ctaHref: "/servicii#meniuri-nunta",
                    backMsg: "Vezi pachetele complete pentru nunta ta.",
                  },
                  {
                    title: "Experiență pentru invitați",
                    points: [
                      "Flow de sală gândit pentru confort",
                      "Scenografie foto & momente speciale",
                      "Acces facil, parcare, indicatoare",
                    ],
                    ctaHref: "/galerie",
                    backMsg: "Explorează galeria noastră de evenimente reale.",
                  },
                  {
                    title: "Transparență & siguranță",
                    points: [
                      "Ofertă clară, fără costuri ascunse",
                      "Timeline asumat și check-listuri",
                      "Suport prompt înainte și după eveniment",
                    ],
                    ctaHref: "/contact",
                    backMsg: "Ia legătura cu noi și discutăm împreună.",
                  },
                ]}
              />
            </Appear>
          </div>
        </section>

        <Separator />

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
export const getStaticProps: GetStaticProps<HomeProps> = () => {
  const postsPreview = getAllPosts().slice(0, 4);
  const reviewItems = getLatestReviews(12);
  return { props: { postsPreview, reviewItems } };
};

// ==============================
// Exporturi
// ==============================
export default Home;
