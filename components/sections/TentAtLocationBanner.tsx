// components/sections/TentAtLocationBanner.tsx

// ==============================
// Imports
// ==============================
import Link from "next/link";

import { withBase } from "../../lib/config";
import * as s from "../../styles/sections/tentAtLocationBanner.css";

// ==============================
// Component
// ==============================
export default function TentAtLocationBanner() {
  return (
    <div className={s.root} aria-label="Cort de evenimente la locația ta">
      <div className={s.panel}>
        <p className={s.eyebrow}>Serviciu nou</p>

        <h2 className={s.title}>Cort de evenimente la locația ta</h2>

        <p className={s.lede}>
          Amplasăm un cort premium la locația aleasă de tine și ne ocupăm de tot: organizare,
          catering, servire și coordonare A–Z — ca tu să ai un eveniment impecabil, fără stres.
        </p>

        <ul className={s.list}>
          <li className={s.listItem}>Cort + montaj/demontaj, setup adaptat locației</li>
          <li className={s.listItem}>Meniu complet & catering, opțiuni personalizate</li>
          <li className={s.listItem}>Echipă de servire + coordonare în ziua evenimentului</li>
          <li className={s.listItem}>Logistică & organizare cap-coadă</li>
        </ul>

        <div className={s.ctaRow}>
          <Link className={s.ctaPrimary} href={withBase("/cort-evenimente-la-locatia-ta")}>
            Vezi detalii
          </Link>
          <Link className={s.ctaSecondary} href={withBase("/contact")}>
            Solicită ofertă
          </Link>
        </div>
      </div>
    </div>
  );
}
