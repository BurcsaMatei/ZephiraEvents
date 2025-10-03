// pages/500.tsx

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
const ServerErrorPage: NextPage = () => (
  <>
    <Seo title="Eroare server — 500" url="/500" noindex />

    <main className={errorWrap}>
      <Appear as="section" className={errorCard} role="alert" aria-live="assertive">
        <h1 className={errorTitle}>500 — A apărut o eroare</h1>

        <p className={errorText}>
          Te rugăm să încerci din nou sau să revii mai târziu. Dacă problema persistă, ne poți{" "}
          <Link href={withBase("/contact")} className={errorInlineLink} aria-label="Contactează-ne">
            contacta
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

export default ServerErrorPage;
