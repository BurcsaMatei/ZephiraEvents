// pages/_offline.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import type { ReactElement } from "react";

import Layout from "../components/Layout";
import Img from "../components/ui/Img";
import { withBase } from "../lib/config";

// ==============================
// Component
// ==============================
const OfflinePage: NextPage & { getLayout?: (page: ReactElement) => ReactElement } = () => {
  return (
    <>
      {/* Noindex: pagina offline nu trebuie indexată */}
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <section aria-labelledby="offline-title">
        <div>
          <Img src="/logo.svg" alt="Logo" width={64} height={64} priority variant="icon" />
        </div>

        <h1 id="offline-title">Ești offline</h1>
        <p>
          Conexiunea la internet nu este disponibilă. Poți reveni mai târziu sau accesa paginile
          vizitate anterior (dacă sunt disponibile din cache).
        </p>

        <p>
          <Link href={withBase("/")}>Înapoi acasă</Link>
        </p>
      </section>
    </>
  );
};

// Integrează layout-ul global prin pattern-ul getLayout
OfflinePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default OfflinePage;
