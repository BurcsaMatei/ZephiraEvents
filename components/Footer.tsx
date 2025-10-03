// components/Footer.tsx
"use client";

// ==============================
// Imports
// ==============================
import Link from "next/link";

import { SITE, withBase } from "../lib/config";
import { SOCIAL as SOCIAL_DATA, type SocialKind } from "../lib/nav";
import {
  footerClass,
  footerCopyClass,
  footerDividerClass,
  footerInnerClass,
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
import Button from "./Button";
import { useCookieConsent } from "./cookies/CookieProvider";
import ExternalLink from "./ExternalLink";
import SmartLink from "./SmartLink";
import Img from "./ui/Img";

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
            <Img
              key="footer-logo"
              className={footerLogoImg}
              src="/logo.svg"
              alt={siteName}
              width={160}
              height={40}
              priority={false}
              variant="icon"
            />
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
