// pages/404.tsx

// ==============================
// Imports
// ==============================
import type { NextPage } from "next";
import Link from "next/link";

import Appear from "../components/animations/Appear";
import Seo from "../components/Seo";
import { withBase } from "../lib/config";
import {
  errorActions,
  errorCard,
  errorInlineLink,
  errorLink,
  errorText,
  errorTitle,
  errorWrap,
} from "../styles/errorPages.css";

// ==============================
// Component
// ==============================
const NotFoundPage: NextPage = () => (
  <>
    <Seo title="Pagina nu a fost găsită — 404" url="/404" noindex />

    <main className={errorWrap}>
      <Appear as="section" className={errorCard} role="alert" aria-live="assertive">
        <h1 className={errorTitle}>404 — Pagina nu există</h1>

        <p className={errorText}>
          Ne pare rău, pagina pe care o cauți nu a fost găsită. Verifică adresa sau întoarce-te la
          pagina principală. Dacă ai nevoie de ajutor,{" "}
          <Link href={withBase("/contact")} className={errorInlineLink} aria-label="Contactează-ne">
            contactează-ne
          </Link>
          .
        </p>

        <div className={errorActions}>
          <Link href={withBase("/")} className={errorLink}>
            Înapoi la Acasă →
          </Link>
        </div>
      </Appear>
    </main>
  </>
);

export default NotFoundPage;
