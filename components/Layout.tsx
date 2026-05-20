// components/Layout.tsx

// ==============================
// Imports
// ==============================
import Head from "next/head";
import type { ReactNode } from "react";

import { SITE, withBase } from "../lib/config";
import Footer from "./Footer";
import Header from "./Header";
import SkipLink from "./SkipLink";
import BackToTop from "./ui/BackToTop";

// ==============================
// Types
// ==============================
type LayoutProps = {
  children?: ReactNode;
  /** @deprecated Containerul se aplică global din _app.tsx; acest flag este ignorat. */
  wrap?: boolean;
};

// ==============================
// Component
// ==============================
function Layout({ children }: LayoutProps) {
  const siteName = SITE.name || "Site";

  return (
    <div>
      <Head>
        {/* DOAR meta globale/tehnice — SEO per pagină rămâne în <Seo /> */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="author" content={siteName} />

        {/* Favicons (manifest + apple-touch-icon sunt în _document.tsx) */}
        <link rel="icon" href={withBase("/favicon.png")} />
        <link rel="icon" type="image/png" sizes="32x32" href={withBase("/favicon-32x32.png")} />
        <link rel="icon" type="image/png" sizes="16x16" href={withBase("/favicon-16x16.png")} />

        {/* 🔗 RSS feed discovery */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteName} — Blog`}
          href={withBase("/feed.xml")}
        />
      </Head>

      {/* A11y: primul element focusabil pentru tastatură */}
      <SkipLink />

      <Header />

      {/* A11y target pentru SkipLink */}
      <main id="main" tabIndex={-1}>
        {children}
      </main>

      <Footer />

      {/* UI: Back to Top (fixed; apare după pragul de scroll) */}
      <BackToTop />

    </div>
  );
}

export default Layout;
