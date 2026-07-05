"use client";

// components/Footer.tsx

// ==============================
// Imports
// ==============================
import Link from "next/link";

import { COMPANY, SITE, withBase } from "../lib/config";
import { SOCIAL as SOCIAL_DATA, type SocialKind } from "../lib/nav";
import {
  footerClass,
  footerCopyClass,
  footerDividerClass,
  footerInnerClass,
  footerLegalClass,
  footerLinksRowClass,
  footerLogoBoxClass,
  footerLogoImg,
  footerLogoLink,
  footerSocialRow,
  iconFacebook,
  iconInstagram,
  iconTiktok,
  socialLink,
} from "../styles/footer.css";
import LogoMark from "./brand/LogoMark";
import Button from "./Button";
import { useCookieConsent } from "./cookies/CookieProvider";
import ExternalLink from "./ExternalLink";
import SmartLink from "./SmartLink";

// ==============================
// Constante
// ==============================
const iconByKind: Record<SocialKind, string> = {
  facebook: iconFacebook,
  instagram: iconInstagram,
  tiktok: iconTiktok,
};

const SOCIAL = SOCIAL_DATA.filter((s) => !!s.href && /^https?:\/\//i.test(s.href)).map((s) => ({
  href: s.href,
  label: s.label,
  iconClass: iconByKind[s.kind],
}));

// ==============================
// Component
// ==============================
export default function Footer(): JSX.Element {
  const { openSettings } = useCookieConsent();
  const siteName = SITE.name || "Site";

  return (
    <footer id="site-footer" className={footerClass} role="contentinfo">
      <div className={footerInnerClass}>
        {/* Logo */}
        <div className={footerLogoBoxClass}>
          <Link href={withBase("/")} className={footerLogoLink} aria-label={`${siteName} — Acasă`}>
            <LogoMark className={footerLogoImg} />
          </Link>
        </div>

        {/* Separator sub logo */}
        <hr className={footerDividerClass} />

        {/* Social icons (centrate, sub separator) */}
        <div className={footerSocialRow} aria-label="Rețele sociale">
          {SOCIAL.map((s) => (
            <ExternalLink key={s.label} href={s.href} className={socialLink} aria-label={s.label}>
              <span className={s.iconClass} aria-hidden />
            </ExternalLink>
          ))}
        </div>

        {/* Text copyright */}
        <span className={footerCopyClass}>
          © {new Date().getFullYear()} {siteName} — All rights reserved.
        </span>

        {/* Date legale firmă */}
        <div className={footerLegalClass}>
          <span>{siteName} este proprietate a:</span>
          <span>
            {COMPANY.name} · CUI {COMPANY.cui} · {COMPANY.regCom} · EUID {COMPANY.euid} ·
            Înființată {COMPANY.founded}
          </span>
          <span>{COMPANY.address}</span>
        </div>
        <span className={footerCopyClass}>
          ZephiraEvents™ — marcă în curs de înregistrare.{" "}
          <Link href={withBase("/marca")}>Detalii marcă</Link>
        </span>

        {/* Link-uri */}
        <div className={footerLinksRowClass}>
          <Button variant="link" onClick={openSettings} aria-label="Deschide setările de cookie">
            Setări cookie
          </Button>{" "}
          · <Link href={withBase("/cookie-policy")}>Politica Cookie</Link> ·{" "}
          <SmartLink href="https://anpc.ro/">ANPC</SmartLink>
        </div>
      </div>
    </footer>
  );
}
