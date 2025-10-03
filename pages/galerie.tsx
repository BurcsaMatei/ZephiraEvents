// pages/galerie.tsx

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Plugin, Slide } from "yet-another-react-lightbox";

import Appear, { AppearGroup } from "../components/animations/Appear";
import type { Crumb } from "../components/Breadcrumbs";
import Breadcrumbs from "../components/Breadcrumbs";
import Button from "../components/Button";
import CardGrid, { type GalleryCard } from "../components/CardGrid";
import Hero from "../components/sections/Hero";
import IntroSection from "../components/sections/IntroSection";
import MotivationCards from "../components/sections/MotivationCards";
import Outro from "../components/sections/Outro";
import Seo from "../components/Seo";
import Separator from "../components/Separator";
import type { Json } from "../interfaces";
import { absoluteAssetUrl, absoluteUrl, seoDefaults } from "../lib/config";
import { getGalleryItems } from "../lib/gallery";

// ==============================
// Types
// ==============================
type GalleryItem = ReturnType<typeof getGalleryItems>[number];

// ==============================
// Dynamic import
// ==============================
// Lightbox: componentă React, dinamic pe client
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

// ==============================
// Constante
// ==============================
const PAGE_SIZE = 12;

// ==============================
// Component
// ==============================
function GaleriePage() {
  const crumbs: Crumb[] = [
    { name: "Acasă", href: "/" },
    { name: "Galerie", current: true },
  ];

  // 1) Items (copie mutabilă din readonly) – rezolvă TS4104
  const allItems: GalleryItem[] = useMemo(() => getGalleryItems().slice(), []);

  // 2) CardGrid data – alt garantat string; caption doar dacă există
  const cards: GalleryCard[] = useMemo(
    () =>
      allItems.map((it) => ({
        src: it.src,
        alt: it.alt ?? it.caption ?? "Galerie",
        ...(it.caption ? { caption: it.caption } : {}),
      })),
    [allItems],
  );

  // 3) Slides pentru YARL – description string (fallback "")
  const slides: Slide[] = useMemo(
    () =>
      cards.map((c) => ({
        src: c.src,
        alt: c.alt,
        title: c.alt,
        description: c.caption ?? "",
      })),
    [cards],
  );

  // Pagination incrementală
  const [visible, setVisible] = useState(PAGE_SIZE);
  const visibleCards = cards.slice(0, visible);
  const canLoadMore = visible < cards.length;

  // IO pentru „load more” la scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);
  const [ioSupported, setIoSupported] = useState(false);

  useEffect(() => {
    setIoSupported(typeof window !== "undefined" && "IntersectionObserver" in window);
  }, []);

  useEffect(() => {
    if (!ioSupported || !sentinelRef.current) return;

    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting || !canLoadMore || lockRef.current) return;

        lockRef.current = true;
        setVisible((v) => Math.min(v + PAGE_SIZE, cards.length));
        setTimeout(() => {
          lockRef.current = false;
        }, 300);
      },
      { root: null, rootMargin: "400px 0px", threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ioSupported, canLoadMore, cards.length]);

  // Lightbox
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openAt = useCallback((i: number) => setOpenIndex(i), []);
  const close = useCallback(() => setOpenIndex(null), []);

  // ▶ Lazy-load pentru pluginuri YARL (Captions, Zoom, Share)
  //    - prefetch on-idle (ca să fie gata la primul click)
  //    - fără `any`, folosim `Plugin[]`
  const pluginsRef = useRef<Plugin[] | null>(null);
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);

  const loadPlugins = useCallback(async () => {
    if (pluginsRef.current) return;
    const [mCaptions, mZoom, mShare] = await Promise.all([
      import("yet-another-react-lightbox/plugins/captions"),
      import("yet-another-react-lightbox/plugins/zoom"),
      import("yet-another-react-lightbox/plugins/share"),
    ]);
    const arr = [mCaptions.default, mZoom.default, mShare.default] as Plugin[];
    pluginsRef.current = arr;
    setPlugins(arr);
  }, []);

  // Prefetch on-idle
  useEffect(() => {
    if (typeof window === "undefined") return;
    let t: number | undefined;

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(
        () => {
          void loadPlugins();
        },
        { timeout: 1500 },
      );
    } else {
      t = window.setTimeout(() => {
        void loadPlugins();
      }, 800);
    }
    return () => {
      if (t !== undefined) window.clearTimeout(t);
    };
  }, [loadPlugins]);

  // Dacă user-ul deschide mai repede decât idle, ne asigurăm că le încărcăm imediat
  useEffect(() => {
    if (openIndex !== null && !pluginsRef.current) {
      void loadPlugins();
    }
  }, [openIndex, loadPlugins]);

  // JSON-LD (BreadcrumbList)
  const breadcrumbList: Json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Galerie", item: absoluteUrl("/galerie") },
    ],
  };

  // JSON-LD (ImageGallery)
  const imagesLd: Json[] = allItems.slice(0, 100).map((it) => {
    const abs = absoluteAssetUrl(it.src);
    const obj = {
      "@type": "ImageObject",
      contentUrl: abs,
      url: abs,
      ...(it.alt ? { name: it.alt } : {}),
      ...(it.caption ? { caption: it.caption } : {}),
    } as const;
    return obj as unknown as Json;
  });

  const imageGalleryLd: Json = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Galerie",
    mainEntity: { "@type": "ImageGallery", image: imagesLd },
    url: absoluteUrl("/galerie"),
  };

  return (
    <>
      <Seo
        title="Galerie"
        description={seoDefaults.description}
        image="/images/og-gallery.jpg"
        url="/galerie"
        structuredData={[breadcrumbList, imageGalleryLd]}
      />

      <Breadcrumbs items={crumbs} />

      {/* Hero */}
      <section className="section">
        <div className="container">
          <Appear>
            <Hero
              title="Portofoliu concret"
              subtitle="Selecție vizuală din proiecte — imagini optimizate, grilă responsivă, lightbox accesibil."
              image={{
                src: "/images/current/hero-gallery.jpg",
                alt: "Colaj de imagini din proiecte",
              }}
              height="md"
            />
          </Appear>
        </div>
      </section>

      <Separator />

      <section className="section">
        <div className="container">
          <Appear>
            <IntroSection
              eyebrow="Portofoliu vizual"
              title="Proiecte prezentate pe scurt"
              lede="Navighează prin imagini — click pentru zoom și detalii. Poți extinde automat pe măsură ce derulezi."
              maxWidth="narrow"
            />
          </Appear>
        </div>
      </section>

      <Separator />

      {/* GRID Galerie */}
      <section className="section">
        <div className="container">
          {/* Notă: pentru stagger pe carduri vom face un mic patch în CardGrid */}
          <Appear>
            {cards.length === 0 ? (
              <p className="u-text-center">Nu există imagini de afișat momentan.</p>
            ) : (
              <CardGrid
                cards={visibleCards}
                onItemClick={(i) => openAt(i)}
                aboveTheFold
                priorityCount={6}
              />
            )}

            {!ioSupported && canLoadMore && (
              <div className="u-text-center u-mt-md">
                <Button
                  type="button"
                  aria-label="Încarcă mai multe imagini"
                  onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, cards.length))}
                >
                  Încarcă mai multe
                </Button>
              </div>
            )}

            <div ref={sentinelRef} aria-hidden className="u-h-1" />
          </Appear>
        </div>
      </section>

      <Separator />

      {/* Secțiuni finale, intrare pe rând */}
      <AppearGroup stagger={0.12} delay={0.06}>
        <section className="section">
          <div className="container">
            <Appear>
              <MotivationCards
                items={[
                  {
                    title: "Ruxi e cea mai cea",
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
                eyebrow="Suntem la un mesaj distanță"
                title="Vrei să discutăm pe concret?"
                lead="Îți răspundem rapid și propunem pașii următori."
                cta={{ label: "Hai pe /contact", href: "/contact" }}
              />
            </Appear>
          </div>
        </section>
      </AppearGroup>

      {/* Lightbox (doar când avem plugin-urile încărcate) */}
      {openIndex !== null && plugins && (
        <Lightbox open index={openIndex} close={close} slides={slides} plugins={plugins} />
      )}
    </>
  );
}

// ==============================
// Exporturi
// ==============================
export default GaleriePage;
