# ZephiraEvents — CLAUDE.md

**Versiune:** v2
**Data:** 2026-03-19
**Status:** activ

---

## 1. Ce este proiectul

ZephiraEvents este un website premium de prezentare și conversie pentru o sală de evenimente din Focșani, județul Vrancea. Scopul principal este să inspire încredere, să clarifice oferta comercială (meniuri, servicii, cort extern) și să capteze lead-uri prin formulare de contact și solicitare ofertă. Proiectul este o platformă editorial-comercială — nu un booking engine sau CRM.

---

## 2. Stack

- **Framework:** Next.js 15 (Pages Router), React 19, TypeScript strict
- **Styling:** Vanilla Extract (`*.css.ts`) — fără inline styling ca standard
- **Animații:** Framer Motion, componenta `Appear` internă
- **Storage:** Vercel KV (`lib/storage/kv.ts`), Vercel Blob (`lib/storage/blob.ts`)
- **Mail:** Nodemailer (SMTP `mail.zephiraevents.ro`)
- **Validare:** Zod
- **Lightbox:** yet-another-react-lightbox
- **Deployment:** Vercel
- **PWA:** next-pwa (activ doar în producție cu `NEXT_PUBLIC_ENABLE_PWA=1`)
- **SEO:** metadata centralizată, JSON-LD, OG dinamic, sitemap/robots server-side

---

## 3. Structura proiectului

```
components/
  animations/          Appear, AppearGroup — animații pe scroll/viewport
  blog/                BlogCard, RelatedPosts
  brand/               componente de identitate vizuală
  cookies/             CookieProvider, CookieBanner
  forms/               OfferRequest — formular solicitare ofertă
  pwa/                 InstallAppButton, PwaInstallCta, ServiceWorkerRegister (+ .inner)
  sections/
    contact/           ContactInfo, ContactMapAddress, ContactMapIframeConsent, ContactSlaCard, FormContact
    homepage/          ArcGallery, HeroIndex, LogoBeforeIntro
    menus/             ArcMenuGallery — galerie carduri meniuri cu autoplay
    reviews/           Reviews, ReviewsForm
    servicii/          CateringSection, MenusIntro, ServiciiComplete, WaiterBarSection
    tent/              TentAtLocationBanner, TentGallery, TentVideos
    Hero.tsx           Hero full-bleed cu mască arc SVG (pagini secundare)
    IntroSection.tsx   Bloc intro centrat refolosibil
    MotivationCards.tsx, Outro.tsx, OutroContact.tsx, Serviciipreview.tsx, ArticlesPreview.tsx
  ui/                  AnimatedIcon, Img, și alte componente UI mici
  Layout.tsx, Header.tsx, Footer.tsx, Seo.tsx, JsonLd.tsx, Breadcrumbs.tsx, Button.tsx, etc.

data/
  gallery.json         catalog imagini galerie (generat de scripts/build-gallery.mjs)
  galleryCaptions.json capțiuni galerie
  menus.json           catalog meniuri

lib/
  gallery/             schema.ts — validare și tipuri galerie
  mail/                offerRequestEmail.ts — template email ofertă
  seo/                 menuJsonLd.ts — structured data meniuri
  storage/             blob.ts — Vercel Blob; kv.ts — Vercel KV
  validation/          offerRequest.ts — validare Zod pentru ofertă
  blogData.ts          helper citire articole blog (MDX/fișiere)
  config.ts            centrul de adevăr: SITE, CONTACT, THEME, SOCIAL_URLS, BASE_PATH, helpers URL
  gallery.ts / gallery.data.ts / gallery.store.ts   parsing, mapare, store galerie
  menus.ts / menus.public.ts   logică domeniu meniuri
  nav.ts               NAV, SERVICII_SUBMENU, SOCIAL — navigație centralizată
  pageMeta.ts          metadata centralizată per pagină
  reviews.ts           logică domeniu recenzii
  url.ts, env.ts, cookies.ts, dates.ts, images.ts

pages/
  index.tsx            Homepage
  servicii.tsx         Pagina servicii
  galerie.tsx          Galerie foto
  contact.tsx          Contact + ofertă
  cort-evenimente-la-locatia-ta.tsx   Landing cort extern
  reviews.tsx          Pagina recenzii (SSR)
  blog/index.tsx       Blog — lista articole
  blog/[slug].tsx      Articol individual
  meniuri/[slug].tsx   Pagina dinamică meniu
  marca.tsx, cookie-policy.tsx, 404.tsx, 500.tsx, _offline.tsx
  robots.txt.ts, site.webmanifest.ts, sitemap*.ts
  api/                 (vezi secțiunea 4)

public/
  images/              current/, gallery/, blog/, motivationcards/, profiles/, servicii/
  videos/              current/, tent/
  icons/, masks/, screenshots/

scripts/
  build-gallery.mjs    generează lib/gallery.data.ts + data/gallery.json (rulat la prebuild)
  build-rss.ts         generează public/rss.xml + public/feed.xml (rulat la postbuild)
  project-tree.ps1     utilitar explorare structură (PowerShell)

styles/
  contact/             ContactInfo.css.ts, ContactMapIframeConsent.css.ts, etc.
  forms/               offerRequest.css.ts
  menus/               menuDetail.css.ts
  pwa/                 pwaCta.css.ts
  sections/
    homepage/          heroIndex.css.ts
    reviews/           reviews.css.ts, reviewsForm.css.ts
    tent/              tentAtLocationBanner.css.ts, tentGallery.css.ts, tentIntro.css.ts, tentVideos.css.ts
    articlesPreview.css.ts, introSection.css.ts, outro.css.ts, outroContact.css.ts
    arcMenuGallery.css.ts, logoBeforeIntro.css.ts, motivationCards.css.ts, waiterBarSection.css.ts
  theme.css.ts, theme.global.css.ts, globals.css, header.css.ts, hero.css.ts, services.css.ts, etc.

types/                 blog.ts, menu.ts, etc.
```

---

## 4. Pagini și routing

### Pagini principale

| Pagină | Fișier | Rol comercial |
|--------|--------|---------------|
| `/` | `pages/index.tsx` | Homepage — brand, teaser servicii, galerie arc, recenzii, motivație |
| `/servicii` | `pages/servicii.tsx` | Prezentare completă servicii, meniuri (4 tipuri), cort extern, ospătari, catering |
| `/galerie` | `pages/galerie.tsx` | Galerie foto cu lightbox YARL + Zoom |
| `/contact` | `pages/contact.tsx` | Contact (tel/email/adresă), hartă cu consent, formular contact, formular ofertă |
| `/cort-evenimente-la-locatia-ta` | `pages/cort-evenimente-la-locatia-ta.tsx` | Landing serviciu cort extern — video, galerie, motivație |
| `/reviews` | `pages/reviews.tsx` | Recenzii clienți (SSR/KV) + formular adăugare |
| `/blog` | `pages/blog/index.tsx` | Lista articole blog (SEO) |
| `/blog/[slug]` | `pages/blog/[slug].tsx` | Articol individual cu Hero full-bleed |
| `/meniuri/[slug]` | `pages/meniuri/[slug].tsx` | Pagina dinamică meniu — detalii, prețuri, galerie |
| `/marca` | `pages/marca.tsx` | Pagina identitate brand |
| `/cookie-policy` | `pages/cookie-policy.tsx` | Politica cookie |

### API Routes

| Route | Fișier | Rol |
|-------|--------|-----|
| `POST /api/contact` | `pages/api/contact.ts` | Trimite email contact via SMTP + autoreply |
| `POST /api/offer-request` | `pages/api/offer-request.ts` | Procesează solicitare ofertă, trimite email |
| `GET/POST /api/reviews` | `pages/api/reviews.ts` | Citire/scriere recenzii în Vercel KV |
| `GET /api/og` | `pages/api/og.tsx` | Generare OG image dinamic (@vercel/og) |
| `POST /api/csp-report` | `pages/api/csp-report.ts` | Colectare rapoarte Content-Security-Policy |

---

## 5. Discipline tehnice obligatorii

### Cod
- TypeScript strict — fără `any`, fără workaround-uri
- Vanilla Extract pentru tot styling-ul — fără inline styling permanent
- Fișierele CSS sunt `styles/**/*.css.ts`, co-locate cu domeniul lor
- Componente lazy (`.lazy.tsx`) pentru tot ce e heavy sau sub fold
- Pattern `dynamic(() => import(...))` pentru componente cu SSR off

### Arhitectură
- `lib/config.ts` și `lib/nav.ts` sunt sursele de adevăr — nu duplica config în componente
- `data/*.json` pentru conținut data-driven (meniuri, galerie) — nu hardcoda în componente
- Separare clară: `components/` (UI) / `lib/` (logică) / `pages/` (routing) / `styles/` (styling)
- API routes validează cu Zod înainte de orice procesare

### Reguli speciale descoperite în lucru
- **`Appear` cu `immediate` prop:** orice componentă `<Appear>` pe un grid/container trebuie să aibă `immediate` setat — fără el, `IntersectionObserver` nu declanșează animația pe mobile în producție (fix dovedit în PR #56, #79)
- **Full-bleed pattern:** secțiunile Hero nu se învelesc în `.section > .container` — au `data-full-bleed="true"` și nu au clasa `.section` pe wrapper (aceasta adaugă `paddingBlock: 24px` și creează gap)
- **`Breadcrumbs` după Hero:** întotdeauna sub secțiunea `<Hero>`, nu în interiorul ei
- **`<Appear>` pe container, nu pe fiecare item:** pentru grid-uri cu multe items, `Appear` cu `immediate` se pune pe containerul `Grid`, nu pe fiecare card individual

### SEO
- Metadata centralizată în `lib/pageMeta.ts`
- JSON-LD pe paginile relevante
- OG assets dedicate per pagină unde e cazul
- `Seo` și `JsonLd` componente în `Layout` sau direct în pagină

---

## 6. Workflow git

```
1. git checkout -b feature/nume-task
2. Implementare locală
3. npm run typecheck        # 0 erori
4. npm run lint             # 0 erori
5. npm run build            # build green
6. git add <fișiere>
7. git commit -m "tip: descriere scurtă (#issue)"
8. git push -u origin feature/nume-task
9. gh pr create --base main
10. gh pr merge <nr> --squash
11. git checkout main && git pull
12. git branch -d feature/nume-task && git push origin --delete feature/nume-task
13. Actualizează CLAUDE.md dacă s-au schimbat arhitectura sau regulile
```

**Reguli commit:** prefix semantic (`feat:`, `fix:`, `refactor:`, `docs:`), mesaj scurt, fără `--no-verify`.

---

## 7. Fișiere cheie per domeniu

### Navigație / Header
- `lib/nav.ts` — NAV, SERVICII_SUBMENU, SOCIAL
- `lib/config.ts` — BASE_PATH, withBase, CONTACT, SITE
- `components/Header.tsx`, `components/HeaderPanel.lazy.tsx`

### Meniuri
- `data/menus.json` — datele meniurilor
- `lib/menus.ts`, `lib/menus.public.ts` — logică domeniu
- `types/menu.ts`
- `lib/seo/menuJsonLd.ts` — structured data
- `components/sections/menus/ArcMenuGallery.lazy.tsx`
- `pages/meniuri/[slug].tsx`
- `styles/menus/menuDetail.css.ts`

### Galerie
- `data/gallery.json` (generat), `data/galleryCaptions.json`
- `lib/gallery.ts`, `lib/gallery.data.ts`, `lib/gallery.store.ts`, `lib/gallery/schema.ts`
- `pages/galerie.tsx`
- `scripts/build-gallery.mjs` — adaugă imagini în `public/images/gallery/` și regenerează

### Contact
- `components/sections/contact/ContactInfo.tsx`, `FormContact.tsx`, `ContactMapIframeConsent.tsx`
- `pages/contact.tsx` — are `id="oferta"` pe secțiunea OfferRequest
- `pages/api/contact.ts`
- `.env.local` — SMTP, reCAPTCHA

### Solicitare ofertă
- `components/forms/OfferRequest.tsx`
- `pages/api/offer-request.ts`
- `lib/mail/offerRequestEmail.ts`
- `lib/validation/offerRequest.ts`
- `styles/forms/offerRequest.css.ts`

### Recenzii
- `components/sections/reviews/Reviews.tsx`, `ReviewsForm.tsx`
- `pages/reviews.tsx`, `pages/api/reviews.ts`
- `lib/reviews.ts`
- `lib/storage/blob.ts`, `lib/storage/kv.ts`

### SEO / Metadata
- `components/Seo.tsx`, `components/JsonLd.tsx`
- `lib/pageMeta.ts`, `lib/url.ts`
- `lib/seo/menuJsonLd.ts`
- `pages/robots.txt.ts`, `pages/sitemap*.ts`
- `pages/api/og.tsx`

### Shell / Theme / Layout
- `components/Layout.tsx`
- `styles/theme.css.ts`, `styles/theme.global.css.ts`, `styles/globals.css`
- `components/ThemeSwitcher.tsx`
- `components/pwa/` — InstallAppButton, PwaInstallCta, ServiceWorkerRegister

---

## 8. Ce este deschis / în lucru

**Offer Request** (`pages/api/offer-request.ts`, `components/forms/OfferRequest.tsx`)
Infrastructura există și funcționează în dev. Rămân neînchise: business rules finale (slugs tip eveniment, single/multi-select meniuri, personal recomandat), sumar email complet, reCAPTCHA propriu, a11y strictă.

**Reviews — cleanup minor**
Form condiționat doar pe pagina 1. Cleanup uploads test/seeded din Blob. Altfel funcțional.

**Contact — verificare producție**
Form + API funcționale în dev. Necesită confirmare finală `.env.local` producție: SMTP, reCAPTCHA v2, autoreply ON, test end-to-end.

---

## 9. Ce să nu faci

- Nu transforma proiectul în booking engine sau admin panel înainte de a finaliza ce există
- Nu hardcoda conținut care are deja structură data-driven (`data/menus.json`, `data/gallery.json`)
- Nu pune inline styling permanent — Vanilla Extract pentru tot
- Nu omite `immediate` pe `<Appear>` când wrappezi grid-uri sau galerii
- Nu înfășura `<Hero>` în `.section` sau `.container` — strică full-bleed
- Nu adăuga scripturi noi în `package.json` fără să stergi cele devenite inutile
- Nu porni task-uri noi mari înainte de hardening pe Contact / Reviews / Offer Request
- Nu face `git push --force` pe `main`
- Nu sări peste `typecheck + lint + build` înainte de commit
