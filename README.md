KonceptID — Base Template

Template Next.js + TypeScript strict + Vanilla Extract (doar importuri relative), optimizat pentru site-uri corporate mici/medii. Gândit să fie clonat și personalizat rapid (texte, imagini, date companie), fără modificări de arhitectură.

Cuprins

Caracteristici

Cerințe

Instalare & rulare

Configurare (.env)

Personalizare pentru client

SEO & JSON-LD

Sitemap & robots

PWA & Offline

Cookie consent

Galerie (generator)

Navigație centralizată

Accesibilitate

Structură proiect

Comenzi utile (QA)

Deploy

Troubleshooting

Licență

Caracteristici

Next.js + TypeScript (strict)

Vanilla Extract pentru stiluri (fără CSS global intruziv); temă și tokens în styles/theme.css.ts.

SEO centralizat: seo.config.ts, componente Seo.tsx și JsonLd.tsx.

Sitemap & robots generate on-the-fly: pages/sitemap.xml.ts, pages/robots.txt.ts.

PWA: manifest, SW minimal, pagină \_offline, CTA de instalare (PwaInstallCta), SW înregistrat doar în producție.

Cookie banner & setări (consimțământ granular, “Setări cookie” în footer), gating pentru viitoare scripturi terțe.

Galerie generată din script (thumbs + meta din fișierele data/…).

Navigație & Social centralizate în lib/nav.ts.

Accesibilitate: SkipLink, focus-trap în meniul mobil, aria-current, contrast OK.

Doar importuri relative (politică de proiect).

Cerințe

Node LTS (recomandat 18+)

npm / pnpm / yarn (exemplele folosesc npm)

Instalare & rulare
npm install
cp .env.example .env.local # editează valorile pentru proiectul curent
npm run dev

Build de producție:

npm run build
npm run start

Configurare (.env)

Editează .env.local (vezi și .env.example):

NEXT_PUBLIC_SITE_URL=https://exemplu.ro
NEXT_PUBLIC_SITE_NAME=Exemplu
NEXT_PUBLIC_SITE_TITLE_TEMPLATE=%s — Exemplu
NEXT_PUBLIC_DEFAULT_TITLE=Exemplu
NEXT_PUBLIC_SITE_DESC=Servicii X pentru Y.
NEXT_PUBLIC_OG_IMAGE=/images/og-image.jpg
NEXT_PUBLIC_TWITTER_HANDLE=
NEXT_PUBLIC_LOCALE=ro_RO

# Contact (doar afișare; formularul NU trimite mesaje)

NEXT_PUBLIC_CONTACT_ENABLED=false
NEXT_PUBLIC_CONTACT_EMAIL=contact@exemplu.ro
NEXT_PUBLIC_CONTACT_PHONE=+407xxxxxxxx
NEXT_PUBLIC_CONTACT_STREET=Strada Exemplu 1
NEXT_PUBLIC_CONTACT_CITY=Oraș
NEXT_PUBLIC_CONTACT_REGION=Județ
NEXT_PUBLIC_CONTACT_POSTAL=000000
NEXT_PUBLIC_CONTACT_COUNTRY=RO
NEXT_PUBLIC_CONTACT_MAP_EMBED= # iframe Google Maps (opțional)

NEXT_PUBLIC_SITE_TITLE_TEMPLATE trebuie să conțină %s (ex: %s — Exemplu), altfel titlul paginii nu se compune corect.

Personalizare pentru client

Ce schimbi doar prin conținut, fără a atinge arhitectura:

Brand & meta — .env.local (nume site, descriere, OG, locale, date contact).

Logo & imagini — în public/ (ex: /logo.svg, /images/og-image.jpg).

Meniu & Social — lib/nav.ts (liste simple).

Texte — pagini din pages/, componente din components/sections.

Galerie — vezi secțiunea de mai jos (titluri/descrieri în JSON, imagini în public/images/gallery).

Blog — articole în pages/blog/ (sau sursa pe care o folosește template-ul tău).

SEO & JSON-LD

Config global în seo.config.ts: seoDefaults, absoluteUrl, buildTitle.

Pe pagini, folosește <Seo … />:

<Seo
title="Titlu pagină"
description="Descriere…"
image="/images/og.jpg"
url="/ruta"
structuredData={{ "@context":"https://schema.org", "@type":"BreadcrumbList", … }}
/>

BreadcrumbList sau alte tipuri: prin prop-ul structuredData.

Sitemap & robots

pages/robots.txt.ts și pages/sitemap.xml.ts se generează la request, cu URL-uri absolute pe baza NEXT_PUBLIC_SITE_URL.

Cache headers setate corect (CDN friendly).

PWA & Offline

Manifest în public/site.webmanifest.

Service Worker înregistrat doar în producție (components/ServiceWorkerRegister.tsx).

Pagină offline: pages/\_offline.tsx.

CTA instalare: components/PwaInstallCta.tsx (se ascunde aproape de footer; include hint iOS).

Cookie consent

Context + banner + dialog în components/cookies/ (CookieProvider și CookieBanner).

Setări cookie sunt accesibile din footer.

Gating pentru scripturi viitoare:

const { hasConsent } = useCookieConsent();
if (hasConsent("analytics")) {
// injectează analytics aici
}

Galerie (generator)

Imaginile: public/images/gallery/…

Date (titluri/caption): fișiere JSON din data/ (ex: gallery.json, galleryCaptions.json).

Scriptul de build regenerează indexul galeriei (și/opțional thumbnails).

Rulează scriptul din scripts/ conform setup-ului din proiect (ex: un script npm gallery:build sau direct node scripts/build-gallery.\*).

Folosește fișierul existent în repo (nu adăugăm dependențe noi).

Navigație centralizată

lib/nav.ts:

export const NAV = [
{ href: "/", label: "Acasă" },
{ href: "/galerie", label: "Galerie" },
{ href: "/services", label: "Servicii" },
{ href: "/blog", label: "Blog" },
{ href: "/contact", label: "Contact" },
];

export const SOCIAL = [
{ href: "https://facebook.com/", label: "Facebook", kind: "facebook" },
{ href: "https://instagram.com/", label: "Instagram", kind: "instagram" },
{ href: "https://tiktok.com/", label: "TikTok", kind: "tiktok" },
];

Header și Footer citesc de aici și mapează kind → icon.

Accesibilitate

SkipLink la începutul layout-ului (target <main id="main">).

Meniu mobil cu focus-trap, închidere pe Esc/overlay, aria-current pentru ruta activă.

Componente interactive au focus vizibil (:focus-visible).

Structură proiect
components/
cookies/
sections/
ui/
Header.tsx, Footer.tsx, SmartLink.tsx, SkipLink.tsx, PwaInstallCta.tsx, ServiceWorkerRegister.tsx
pages/
\_app.tsx, \_document.tsx, \_offline.tsx
index.tsx, galerie.tsx, contact.tsx, ...
404.tsx, 500.tsx
robots.txt.ts, sitemap.xml.ts
styles/
_.css.ts (Vanilla Extract), theme.css.ts
lib/
nav.ts, cookies.ts, ...
data/
gallery_.json, ...
public/
images/, icons/, logo.svg, site.webmanifest

Comenzi utile (QA)

# format + lint + typecheck

npx prettier . --write
npm run lint # eslint .
npm run typecheck # tsc --noEmit
npm run build && npm run start

Deploy

Vercel: importă repo; setările implicite funcționează.
Setează variabilele .env la Project Settings → Environment Variables.

Node server: npm run build && npm run start pe un host Node LTS.

CSP: configurat în next.config.mjs să permită Google Maps (frame-src).

Troubleshooting

Map iframe “refused to connect”: verifică NEXT_PUBLIC_CONTACT_MAP_EMBED și că CSP include frame-src https://www.google.com https://\*.google.com.

OG image nu apare: confirmă că imaginea există în public/images/ și că NEXT_PUBLIC_OG_IMAGE indică path-ul corect.

Galeria nu se actualizează: rulează scriptul de build al galeriei după ce schimbi imaginile/JSON-ul din data/.

Licență

Proiect intern KonceptID — folosit ca sablon pentru proiecte client. Distribuirea în afara companiei se face doar cu acordul titularului.
