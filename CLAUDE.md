# ZephiraEvents — Master Context File

**Versiune:** v1  
**Data sintezei:** 2026-03-12  
**Status:** activ  
**Surse folosite pentru reconstrucție:** istoricul conversațiilor ZephiraEvents disponibil în proiect + structura actuală a repo-ului + checkpoint-urile memorate din lucru.

> Notă importantă:
> Acest document reconstruiește fidel direcția, arhitectura și starea proiectului pe baza istoricului disponibil. Unde cronologia exactă a unui refactor nu apare explicit în conversații, ordinea este dedusă din repo-ul actual și din checkpoint-urile existente. Conținutul este gândit ca **fișier de context sănătos**, de folosit în toate conversațiile viitoare despre ZephiraEvents.

---

# 1) Stable context

## 1.1 Ce este ZephiraEvents

ZephiraEvents este un site de prezentare premium, orientat spre conversie, pentru un business din zona de evenimente. Nu este gândit ca simplu „site de vizită”, ci ca o combinație clară între:

- **brand presentation**
- **showcase vizual**
- **explicarea serviciilor și meniurilor**
- **captare de lead-uri**
- **consolidare de încredere prin recenzii și conținut**

În forma sa actuală, proiectul s-a definitivat ca o platformă editorială/comercială ușoară, cu accent pe:

- imagine premium
- structură clară de servicii
- pagini dedicate pentru meniuri
- galerie reală
- blog pentru SEO
- contact / solicitare ofertă
- recenzii reale / reputație
- extensii comerciale precum „cort evenimente la locația ta”

## 1.2 Ce NU este produsul

Direcția actuală nu este aceea de:

- booking engine complet
- CRM intern
- sistem complex de administrare evenimente
- marketplace
- SaaS

Produsul este corect poziționat în acest moment ca:
**site de prezentare + SEO + lead generation + încredere + clarificare ofertă**.

---

# 2) Conceptul proiectului și cum s-a definitivat

## 2.1 Conceptul inițial

Proiectul a pornit ca un website modern pentru prezentarea unui business de evenimente, construit în standarde KonceptID:

- design curat
- performanță bună
- structură scalabilă
- SEO tehnic solid
- imagini optimizate
- componente reutilizabile
- fără soluții improvizate

## 2.2 Cum s-a rafinat conceptul

Pe măsură ce proiectul a evoluat, direcția s-a clarificat în jurul a 5 piloni:

### A. Showcase premium

Homepage-ul și paginile cheie trebuie să inspire calitate, atmosferă și încredere.

### B. Claritate comercială

Serviciile nu sunt doar enumerate, ci sunt împinse spre o prezentare mai clară:

- preview servicii
- pagină servicii
- submeniuri
- pagini dedicate pentru meniuri
- pagină separată pentru serviciul de cort la locația clientului

### C. Dovadă vizuală reală

Galeria și imaginile reale au devenit o piesă centrală a produsului.

### D. Dovadă socială

Recenziile au fost tratate ca un modul important, nu ca detaliu secundar.

### E. Conversie

Contactul și formularul de solicitare ofertă au transformat site-ul într-un instrument comercial real, nu doar de imagine.

## 2.3 Forma finală actuală a conceptului

ZephiraEvents este, în prezent, un:
**website premium de prezentare și conversie pentru evenimente, construit pe un stack modern, cu pagini editoriale, lead capture, recenzii, servicii și meniuri prezentate într-o structură clară și scalabilă.**

---

# 3) Direcția corectă a produsului

## 3.1 Direcția bună deja aleasă

Direcția actuală este sănătoasă și trebuie menținută:

1. **site-ul vinde percepție + claritate + încredere**
2. **meniurile și serviciile devin obiecte comerciale clare**
3. **blogul susține SEO-ul**
4. **galeria susține dovada reală**
5. **recenziile susțin reputația**
6. **contactul și solicitarea de ofertă sunt mecanismele principale de conversie**

## 3.2 Direcția strategică recomandată pe mai departe

Produsul trebuie dus mai departe ca:

- **platformă editorial-comercială premium**
- nu ca aplicație grea
- nu ca booking engine complex, cel puțin nu în etapa actuală

Ordinea sănătoasă este:

1. finalizare și hardening pe ce există deja
2. clarificare completă ofertare / servicii / meniuri / recenzii
3. stabilizare SEO + UX + conversie
4. abia ulterior, dacă business-ul o cere, eventuale layere administrative

## 3.3 Principiu strategic

Pentru ZephiraEvents:
**mai important decât „mai mult feature scope” este „mai multă claritate comercială și mai multă încredere”.**

---

# 4) Repere fixe ale proiectului

## 4.1 Stack

Pe baza repo-ului actual, proiectul rulează pe:

- **Next.js** (Pages Router)
- **React**
- **TypeScript**
- **Vanilla Extract** pentru styling
- **Node scripts** pentru build-uri auxiliare și generare de artefacte
- API routes în `pages/api/*`
- structură de SEO server-side + JSON-LD + sitemap/robots/feed
- PWA layer (`site.webmanifest`, `_offline`, install CTA, SW register)
- cookie consent
- asset/data driven rendering pentru galerie și meniuri

## 4.2 Discipline tehnice fixe

Acest proiect urmează standardele KonceptID / workflow-ul deja stabilit:

- TypeScript strict
- cod curat, fără improvizații
- stilizare separată în `*.css.ts` / `globals.css`
- fără inline styling ca standard
- componente separate clar de utilitare și pagini
- accent pe reutilizare
- accent pe SEO și accesibilitate
- accent pe structură de agenție / scalare
- patch-uri complete, curate, ready-to-replace când sunt cerute
- branch per issue/task
- commit/push/PR/squash merge disciplinat

## 4.3 Principii UX/UI fixe

- design premium, aerisit
- componente coerente vizual
- imagini și media ca instrument comercial, nu decor gratuit
- responsive corect
- intrări animate controlat, nu agresiv
- focus pe claritate și citibilitate
- CTA-uri utile, nu abuzive

## 4.4 Principii SEO fixe

- metadata centralizată
- pagini cu identitate clară
- OG assets dedicate
- sitemap separat pe tipuri de conținut
- robots server-side
- JSON-LD acolo unde este cazul
- blog ca suport organic
- meniu și galerii tratate ca entități indexabile

---

# 5) Structura mare a proiectului

## 5.1 Nivel repo

Repo-ul este structurat clar și matur, cu separare între:

- `components/` → UI și secțiuni
- `data/` → conținut static / configurabil
- `downloads/` → assets descărcabile
- `interfaces/`, `types/` → tipuri și contracte
- `lib/` → utilitare, config, logic shared
- `pages/` → routing și API routes
- `public/` → media, icons, OG, screenshots, videos, favicons
- `scripts/` → scripturi de build/export
- `styles/` → stiluri globale și pe componente

## 5.2 Componente mari

### `components/`

Este împărțit sănătos în:

- `animations/`
- `blog/`
- `brand/`
- `cookies/`
- `forms/`
- `sections/`
- `ui/`
- componente shared la rădăcina folderului

Observație:
Există deja o separare bună între:

- componente pur vizuale
- secțiuni de pagină
- helpers/UI reusable
- componente lazy pentru reducerea costului inițial

## 5.3 Conținut și date

### `data/`

Acum există clar:

- `gallery.json`
- `galleryCaptions.json`
- `menus.json`

Asta confirmă o direcție bună:
**site data-driven, nu hardcoded haotic în componente**.

## 5.4 Logic / utilitare

### `lib/`

Este unul dintre cele mai importante foldere.
Conține:

- config
- env
- validation
- seo helpers
- url helpers
- blog data
- gallery parsing/store
- reviews logic
- blob/kv access
- menus logic
- page meta

Acesta este backbone-ul de standardizare al proiectului.

## 5.5 Routing / pages

### `pages/`

Există:

- pagini statice principale
- pagini dinamice (`blog/[slug]`, `meniuri/[slug]`)
- API routes
- document/app/offline/error pages
- sitemaps și robots

Asta arată un proiect ajuns la un nivel matur, nu doar landing page simplu.

## 5.6 Styles

### `styles/`

Stilizarea este:

- separată
- modulară
- pe domenii / secțiuni
- cu fișiere dedicate pentru aproape fiecare componentă importantă

Acest lucru este corect și trebuie păstrat.

---

# 6) Ce s-a făcut de la bun început și până acum

> Istoricul de mai jos este reconstruit pe faze logice din conversațiile de proiect și din repo-ul actual.

## Faza 1 — Foundation / shell de proiect

La începutul proiectului s-a construit baza sănătoasă:

- arhitectură Next.js Pages Router
- Layout general
- Header / Footer
- navigație
- SEO components
- JsonLd
- smart linking
- sistem de theme switching
- PWA install flow
- service worker register
- skip link
- shell pentru pagini de eroare și offline

Această fază a pus fundația produsului.

## Faza 2 — Identitate vizuală și homepage

A fost construit homepage-ul ca piesă centrală de prezentare:

- `HeroIndex`
- `LogoBeforeIntro`
- `IntroSection`
- `Serviciipreview`
- `ArcGallery`
- `ArticlesPreview`
- `MotivationCards`
- `Outro`
- `OutroContact`
- `Reviews` / `ReviewsForm` integrate ca parte a experienței

Homepage-ul nu este o singură secțiune statică, ci o compoziție de blocuri comerciale și editoriale.

## Faza 3 — Pagini de bază și infrastructură editorială

Au fost construite/organizate:

- `contact.tsx`
- `galerie.tsx`
- `servicii.tsx`
- `blog/index.tsx`
- `blog/[slug].tsx`
- `cookie-policy.tsx`
- `marca.tsx`
- `reviews.tsx`

Asta înseamnă că produsul a ieșit din stadiul de simplu home page și a devenit structură completă de website.

## Faza 4 — Sistemul de blog

A fost introdusă infrastructura pentru blog:

- listare articole
- pagini dinamice individuale
- `BlogCard`
- `RelatedPosts`
- `lib/blogData.ts`
- stilizare dedicată

Rolul blogului:

- susținere SEO
- trafic organic
- profunzime de brand
- pagini indexabile suplimentare

## Faza 5 — Sistemul de galerie

Galeria a fost adusă într-o formă data-driven:

- `data/gallery.json`
- `data/galleryCaptions.json`
- `lib/gallery.ts`
- `lib/gallery.data.ts`
- `lib/gallery.store.ts`
- `lib/gallery/schema.ts`
- `useLightboxKeyboard.ts`
- pagină dedicată galerie
- assets reale în `public/images/gallery/*`

Conversațiile recente confirmă și un task de:

- **swap / refresh pentru imaginile galeriei**

Asta arată că galeria este activ întreținută și tratată ca activ comercial real.

## Faza 6 — Contact și lead generation

A fost construită o infrastructură serioasă pentru contact:

- `ContactInfo`
- `ContactMapAddress`
- `ContactMapIframeConsent`
- `ContactSlaCard`
- `FormContact`
- `pages/api/contact.ts`

Checkpoint important memorat:

- pe Issue #27, contact form + API erau funcționale în dev
- următorul pas era finalizarea `.env.local`
- SMTP pe `mail.zephiraevents.ro`
- reCAPTCHA v2
- autoreply ON
- apoi test final și producție

Deci:
**contact flow există și a fost lucrat serios, inclusiv partea de integrare backend/mail.**

## Faza 7 — Solicitare ofertă

Există infrastructură separată pentru ofertare:

- `components/forms/OfferRequest.tsx`
- `pages/api/offer-request.ts`
- `lib/mail/offerRequestEmail.ts`
- `lib/validation/offerRequest.ts`
- stiluri dedicate `styles/forms/offerRequest.css.ts`

Checkpoint memorat:

- Issue #49 „Solicită ofertă” era funcțional în dev la nivel de UI/API/email
- dar a rămas în așteptarea unor decizii de business:
  - slugs finale tip eveniment
  - single vs multi-select meniuri
  - reguli de personal recomandat
  - personal extra
  - sumar email
  - recaptcha propriu la final
  - a11y mai strictă

Concluzie:
**infrastructura există, dar domeniul comercial final pentru acest flow nu este încă închis complet.**

## Faza 8 — Recenzii / reputație

A fost implementat un sistem de recenzii:

- `Reviews.tsx`
- `ReviewsForm.tsx`
- `pages/reviews.tsx`
- `pages/api/reviews.ts`
- `lib/reviews.ts`
- `lib/blob.ts`
- `lib/kv.ts`
- assets profile + cards asociate

Checkpoint important:

- Issue #43 a rezolvat problema de full-bleed pentru reviews
- fix-ul a fost confirmat
- urmau:
  1. form only on page=1
  2. cleanup uploads test/seeded din Blob
  3. lint/typecheck/tests
  4. commit/PR/merge

Asta sugerează:

- reviews există și sunt funcționale
- există persistență / stocare asociată
- mai există puțin cleanup operațional

## Faza 9 — Servicii și meniuri

Aceasta este una dintre cele mai importante evoluții comerciale ale produsului.

Au fost introduse:

- `MenuOffers.tsx`
- `data/menus.json`
- `lib/menus.ts`
- `lib/menus.public.ts`
- `lib/seo/menuJsonLd.ts`
- `pages/meniuri/[slug].tsx`
- `components/sections/menus/ArcMenuGallery.tsx`
- `styles/menus/menuDetail.css.ts`
- `styles/sections/arcMenuGallery.css.ts`

Checkpoint clar:

- Issue #68 a introdus galerie de meniuri cu arc cards pe `pages/servicii.tsx`
- au fost create paginile dinamice de meniu
- s-au introdus folderele `components/sections/menus/` și `styles/menus/`
- s-au făcut ajustări în `lib/menus.ts` și `types/menu.ts`
- build/typecheck erau verzi
- exista doar un warning minor de hydration mismatch legat de `Appear/motion`

După aceea au mai urmat mici rafinări:

- modificări de titlu / prezentare pentru meniuri
- ribbon decor asset
- ajustări vizuale/comerciale

Concluzie:
**meniurile au devenit un obiect comercial serios în produs.**

## Faza 10 — Extensie de ofertă: cort evenimente la locația ta

Au fost adăugate:

- `pages/cort-evenimente-la-locatia-ta.tsx`
- `components/sections/TentAtLocationBanner.tsx`
- stiluri aferente

Asta marchează o extindere bună:
site-ul nu mai prezintă doar spațiul principal, ci și serviciul extern / mobil, cu landing separată.

## Faza 11 — Navigație, submeniuri, structurare servicii

Conversațiile recente confirmă:

- lucru pe submenu în zona `Servicii`
- update-uri în `Header.tsx`, `HeaderPanel.lazy.tsx`, `lib/nav.ts`, `lib/config.ts`, `pages/index.tsx`, `pages/servicii.tsx`
- integrarea paginii „cort-evenimente-la-locatia-ta” în fluxul comercial

Asta înseamnă că navigația a fost rafinată pentru a susține mai bine:

- claritatea informației
- accesul la oferte relevante
- conversia

## Faza 12 — Polish, warnings, asset refresh

Pe ultimele task-uri vizibile:

- s-au rezolvat warning-uri de hooks / lint
- s-au ajustat detalii pe galerie de meniuri
- s-a făcut swap la imaginile galeriei principale
- s-a continuat workflow-ul de commit / push / PR / squash merge

## Faza 14 — Hero full-bleed cu mască arc pe toate paginile secundare

`Hero.tsx` și `styles/hero.css.ts` refactorizate pentru full-bleed + mască SVG arc, consistent cu HeroIndex:

- `heroWrap`: adăugat arc SVG mask (`hero-arc-up.svg`), eliminat `borderRadius`/`boxShadow`/`border`/`background`
- `hSm/hMd/hLg`: înălțimi vh cu `height` explicit (`42/58/78vh`) între `minHeight` și `maxHeight` — permite centrare verticală corectă prin grid
- `hero` (clasa CSS): full-bleed mutat din inline style în clasa CSS (`width: 100vw`, `margin: calc(50% - 50vw)`)
- `heroInner`: `position: absolute; inset: 0` în loc de `position: relative; height: 100%` — umple `heroWrap` indiferent de înălțimea calculată, centrare verticală funcțională
- `Hero.tsx`: eliminat `fullBleedStyle` inline, `React` default import; adăugat `data-full-bleed="true"` pe `<section>`

Pe toate 6 pagini cu Hero (`servicii`, `galerie`, `blog/index`, `contact`, `cort-evenimente-la-locatia-ta`, `meniuri/[slug]`):

- eliminat `<div className="container">` wrapper din jurul Hero
- wrapper `<section>` fără clasa `.section` (evită `paddingBlock: 24px` care crea gap deasupra hero)
- `<Breadcrumbs>` mutat sub hero section
- `data-full-bleed="true"` pe wrapper section

PR #76, squash merge în main, branch șters.

## Faza 13 — TentAtLocationBanner rescris ca video hero

`TentAtLocationBanner.tsx` și `styles/sections/tentAtLocationBanner.css.ts` rescrise complet.

Panelul text-only a devenit modul video hero full-bleed, după pattern-ul exact din `HeroIndex`:

- video: `/videos/current/your-location-tent-video.mp4`
- poster fallback: `/images/current/hero-services.jpg`
- mască SVG arc identică cu HeroIndex (`hero-arc-up.svg`)
- gradient animat + dots overlay — identice cu HeroIndex
- fade-in video la `onCanPlay` cu `useState` — identic cu HeroIndex
- `HeroLCPImage` pentru poster, `Appear` pentru animarea conținutului
- conținut centrat deasupra video: eyebrow + H2 + lede scurt + CTA-uri albe centrate
- `minHeight: 62vh`, `maxHeight: 80vh` (mai mic decât HeroIndex 76/92)
- CTA-uri: „Vezi detalii" (alb solid) + „Solicită ofertă" (transparent/border alb), `justifyContent: center`

Structura CSS exportată în `tentAtLocationBanner.css.ts`:

- **Hero video**: `maskStage`, `mediaVideo`, `mediaVideoReady`, `gradient`, `dots`, `contentLayer`, `contentWrap`, `eyebrow`, `title`, `lede`, `ctaRow`, `ctaPrimary`, `ctaSecondary`
- **Intro block** (pentru `servicii.tsx`): `introBlock`, `introLede` (uppercase + 900), `introList`, `introListItem` (flex, centrat)
- **Card panel** (pentru `cort-evenimente-la-locatia-ta.tsx`): `panel`, `panelEyebrow`, `panelTitle`, `panelLede`, `panelList`, `panelListItem`

Pagini actualizate:

- `pages/cort-evenimente-la-locatia-ta.tsx` — folosește `panelEyebrow`, `panelTitle`, `panelLede`, `panelList`, `panelListItem` (nu mai are acces la stilurile vechi `root`, `panel` text-only)
- `pages/servicii.tsx` — adăugat intro block sub banner cu continuarea textului și lista cu ✓, centrat

Componenta apare în `pages/index.tsx` (teaser homepage) și `pages/servicii.tsx` (secțiune dedicată).

## Faza 15 — Pagina cort-la-locatie: galerie video + galerie imagini + blocuri motivaționale

`pages/cort-evenimente-la-locatia-ta.tsx` extinsă substanțial. PR #77, squash merge în main, branch șters.

**Componente noi:**

- `components/sections/TentVideos.tsx` — grid fluid (max 2 col desktop, `minmax(min(100%, 480px), 1fr)`) cu 8 video-uri `/videos/tent/01–08.mp4`, `autoPlay muted loop playsInline`, fără text/caption/lightbox
- `components/sections/TentGallery.tsx` — grid fluid cu 20 imagini `/images/gallery/tent/g-001–020.jpg`, lightbox YARL cu plugin Zoom (lazy-loaded on-idle, pattern identic cu `galerie.tsx`), `<button>` clickabil cu `aria-label`, `Next/Image fill`

**Stiluri noi (Vanilla Extract):**

- `styles/sections/tentVideos.css.ts` — `grid`, `videoWrap` (aspectRatio 16/9, borderRadius lg), `video` (absolute fill, objectFit cover)
- `styles/sections/tentGallery.css.ts` — `grid`, `imageWrap` (aspectRatio 4/3, button reset, hover shadow, focus-visible ring), `image` (objectFit cover)
- `styles/sections/tentIntro.css.ts` — pattern bloc centrat fără border card: `wrap` (grid, textAlign center), `eyebrow` (badge capsulă + `margin: 0 auto` pentru centrare în grid context), `heading` (gradient text identic Outro), `lede` (muted, maxWidth 68ch), `list`/`listItem` (✓ accent cu `vars.color.link`), `ctaRow` (flex centrat)

**Assets adăugate:**

- `public/images/gallery/tent/g-001.jpg … g-020.jpg` — 20 imagini galerie cort
- `public/videos/tent/01.mp4 … 08.mp4` — 8 video-uri cort
- `public/images/motivationcards/mc-21.jpg … mc-24.jpg` — 4 imagini pentru MotivationCards

**Structura finală a paginii:**

```
Hero → Breadcrumbs → Separator
→ IntroSection („Serviciu complet, la tine acasă")
→ Separator → bloc „Ce include" (ti.wrap, fără border card)
→ Separator → TentVideos (8 video-uri, grid 2col desktop)
→ Separator → bloc motivațional „Locația ta, atmosfera noastră" + CTA tel:
→ Separator → TentGallery (20 imagini + lightbox Zoom)
→ Separator → bloc „De ce ZephiraEvents"
→ Separator → MotivationCards (mc-21–24, ctaHref contextual per card)
→ Separator → Outro
```

**Note tehnice:**

- `tentIntro.css.ts` reutilizat pentru toate blocurile text centrate de pe pagină (3 blocuri distincte)
- CTA telefon (`<a href="tel:...">`) folosește `CONTACT.phone` din `lib/config.ts` + `replace(/[^\d+]/g, "")`, condiționat dacă variabila e setată — același pattern ca `Header.tsx`
- Blocul „Ce include" restilaizat de la `b.panel` (border card) la `ti.wrap` (text centrat, aerisit, fără border) în același task

---

## Faza 18 — WaiterBarSection și CateringSection

Două componente noi adăugate în pages/servicii.tsx pentru serviciile
„Ospătari & Bar" și „Bucătărie Proprie & Catering".

**Componente noi:**

- `components/sections/servicii/WaiterBarSection.tsx`
- `components/sections/servicii/CateringSection.tsx`
- `styles/sections/waiterBarSection.css.ts` (stiluri comune pentru ambele)

**Structura fiecărei componente:**

- Bloc 3 coloane: imagine PNG transparentă | text central | imagine PNG transparentă
- Imaginile se sprijină jos pe o bandă primary full-bleed subțire (7px)
- Grid 4 carduri clickabile sub bandă — pattern identic cu ServiciiComplete
  (hover tint rgba primary 0.08, border primary, translateY -3px)
- assets: `public/images/servicii/servicii/waiter.png`, `cook.png`, `waiter-cat-1.png`, `waiter-cat-2.png`

**Layout mobile:**

- `textTop` (eyebrow + heading + lede) — deasupra imageRow, full-width
- imageRow 3 coloane (1fr 2fr 1fr) — imagine | textBottom | imagine
- `textBottom` (pre-CTA + CTA) — centrat vertical între personaje cu `alignSelf: center`
- `textCol` (desktop) — `display: none` pe mobile, `display: flex` pe `mq.lg`

**Ancore adăugate în pages/servicii.tsx:**

- `id="ospatari-bar"` pe section WaiterBarSection
- `id="catering"` pe section CateringSection

**Href-uri actualizate în ServiciiComplete ALL_SERVICES:**

- Card 6 Bucătărie Proprie & Catering → `#catering`
- Card 7 Servicii Ospătari & Bar → `#ospatari-bar`
- Card 8 Cazare & Logistică Invitați → `/contact#oferta`

**Ancora adăugată în pages/contact.tsx:**

- `id="oferta"` pe section-ul care conține OfferRequest

---

## Faza 19 — Mobile menu polish + HeaderPanel glassmorphism

**Mobile menu typography fix (PR #85, #86):**

- `panelLink`, `panelAccordionBtn`, `panelSubLink` — `fontWeight` uniformizat la `600`
- `panelLink`, `panelAccordionBtn`, `panelSubLink` — `fontSize: "1rem"` explicit
  (elimină diferența de sizing între `<a>` și `<button>` din browser defaults)

**HeaderPanel glassmorphism (PR #87, #88):**

- `panel`: `backdropFilter: blur(16px)` + `WebkitBackdropFilter: blur(16px)`
- Light mode: `background: rgba(255, 255, 255, 0.55)`
- Dark mode: `background: rgba(17, 18, 21, 0.60)` + `blur(20px)`
- `darkThemeClass` importat în `header.css.ts`

---

## Faza 20 — Menus polish + MenusIntro component

**Eyebrow/title swap pe toate cele 4 secțiuni ArcMenuGallery din servicii.tsx:**

- presentation.eyebrow → "Meniuri" (generic)
- presentation.title → titlul specific ("Meniuri nuntă", "Meniuri botez & cununie", etc.)

**Panel/card removal din ArcMenuGallery:**

- Eliminat wrapper-ul glassmorphism/card cu ribbon decorativ
- eyebrow + title + lede rămân randate simplu, centrat, fără border/background

**Arc grid centrat:**

- styles/sections/arcMenuGallery.css.ts — grid înlocuit cu
  auto-fit + minmax(0, 280px) + justifyContent: center
- Cardurile se centrează automat indiferent de număr (3, 4, 6)

**Componentă nouă MenusIntro:**

- components/sections/servicii/MenusIntro.tsx
- Pattern identic cu WaiterBarSection/CateringSection
- Imagini: /images/servicii/servicii/menus-left.png + menus-right.png
- Bandă primary jos, layout mobile identic (textTop/textBottom split)
- textBottom: "Descoperă toate opțiunile disponibile" + CTA "Vezi meniurile ↓" → #meniuri-nunta
- Integrată în servicii.tsx între tent.introBlock și primul ArcMenuGallery

**Fix separatoare în servicii.tsx:**

- Adăugat Separator între TentAtLocationBanner și tent.introBlock
- Adăugat Separator între MotivationCards și Outro

---

## Faza 21 — MotivationCards polish

**backMsg contextual (PR #90):**
- Adăugat câmp `backMsg?: string` în tipul `Item`
- Fiecare pagină transmite un mesaj contextual diferit pe spatele cardului
- Fallback: "Planifică evenimentul ideal la Zephira — servicii complete și flexibile."
- 6 pagini actualizate: index, servicii, galerie, contact, blog, cort-la-locatie

**Mobile layout fix (PR #91):**
- Grid: `repeat(2, 1fr)` pe mobile — 2 coloane
- `list`: `display: none` pe mobile — bifele ascunse
- `title`: `clamp(1.2rem, 4vw, 1.5rem)` pe mobile — mărit
- `card minHeight`: 260px → 180px pe mobile
- `inner paddingBottom`: 64px → 48px pe mobile
- `inner justifyContent: flex-end` pe mobile — titlul stă jos deasupra mediaBadge
- `grid alignItems: start` pe mobile — cardurile nu se întind la înălțimea maximă
- `backContent`: textAlign left, placeItems start, padding md pe mobile
- `backTitle` + `backMsg`: textAlign left, fontSize clamp pe mobile

---

## Faza 17 — Servicii cards clickable cu anchor links și hover tint

`ServiciiComplete.tsx` și `Serviciipreview.lazy.tsx` actualizate cu carduri clickabile. PR #81, squash merge în main, branch șters.

**Modificări `ServiciiComplete.tsx`:**

- Import `Link` from `next/link`
- Toate cele 8 carduri au `href` completat în `ALL_SERVICES`
- Card content învelit în `<Link href={it.href} className={s.cardSmallLink}>` — un singur element interactiv per card
- `hoverTilt={false}` pe `AnimatedIcon` — CSS preia controlul animației

**Modificări `Serviciipreview.lazy.tsx`:**

- Import `Link` adăugat
- `href` completat pe toate cele 4 carduri din `DEFAULT_PREVIEW` (cu prefix `/servicii#ancora`)
- Card content învelit în `<Link href={it.href ?? "/servicii"} className={s.cardSmallLink}>`
- `hoverTilt={false}` pe `AnimatedIcon`

**Mapping href-uri `ServiciiComplete`:**

- Organizare Nuntă → `#meniuri-nunta`
- Botez & Cununie → `#meniuri-botez-cununie`
- Corporate & Team Building → `#meniuri-corporate-team-building`
- Petreceri Private & Majorate → `#meniuri-petreceri-private-majorate`
- Evenimente în Aer Liber → `/cort-evenimente-la-locatia-ta`
- Bucătărie Proprie & Catering → `#meniuri-nunta` (fallback, de rafinat ulterior)
- Servicii Ospătari & Bar → `#meniuri-nunta` (fallback, de rafinat ulterior)
- Cazare & Logistică Invitați → `#meniuri-nunta` (fallback, de rafinat ulterior)

**Modificări `styles/services.css.ts`:**

- `cardSmall`: `cursor: pointer`, hover/focus-within → `background: rgba(85, 97, 242, 0.08)` + `borderColor: primary` + `translateY(-3px)`
- `cardSmallLink`: `display: block`, padding, no underline, `color: inherit`
- `cardIconTint`: tranziție transform spring-like curve
- `globalStyle`: hover pe card declanșează animația SVG (`rotate(3deg)` + `translateY(-2px)`)
- Tranziție `background 0.25s cubic-bezier(.2,0,.2,1)`

---

## Faza 16 — MotivationCards CTA-uri contextuale per card per pagină

`MotivationCards.lazy.tsx` extins cu props `ctaHref?: string` și `ctaLabel?: string` pe tipul `Item`. PR #80, squash merge în main, branch șters.

**Modificare componentă:**

- `Item` tip: adăugat `ctaHref?: string` (fallback `/servicii`) și `ctaLabel?: string` (fallback `"Descoperă serviciile →"`)
- `Card` subcomponent: primește și aplică `ctaHref` și `ctaLabel`; tipul intern folosește `string | undefined` (compatibil cu `exactOptionalPropertyTypes: true`)
- `<Link href={ctaHref ?? "/servicii"} aria-label={ctaLabel ?? "Descoperă serviciile →"}>`

**Toate cele 6 pagini actualizate cu `ctaHref` contextual:**

| Pagină          | Card 1                  | Card 2                          | Card 3                                    | Card 4                         |
| --------------- | ----------------------- | ------------------------------- | ----------------------------------------- | ------------------------------ |
| index           | /servicii               | /servicii#meniuri-nunta         | /galerie                                  | /contact                       |
| galerie         | /servicii#meniuri-nunta | /servicii#meniuri-botez-cununie | /servicii#meniuri-corporate-team-building | /galerie                       |
| contact         | /servicii               | /servicii#meniuri-nunta         | /galerie                                  | /blog                          |
| blog            | /servicii               | /servicii#meniuri-nunta         | /galerie                                  | /contact                       |
| cort-la-locatie | /servicii#meniuri-nunta | /servicii#meniuri-botez-cununie | /servicii#meniuri-corporate-team-building | /cort-evenimente-la-locatia-ta |
| servicii        | /contact                | /servicii#meniuri-nunta         | /galerie                                  | /blog                          |

---

# 7) Ce este făcut ca standardizare de arhitectură

## 7.1 Separare clară pe straturi

Proiectul este standardizat sănătos în straturi:

### UI / presentation

- `components/*`
- `styles/*`

### content/data

- `data/*`
- parte din `public/*`

### domain/shared logic

- `lib/*`
- `types/*`
- `interfaces/*`

### routing / delivery

- `pages/*`
- `pages/api/*`

Această separare este bună și trebuie menținută.

## 7.2 Config centralizat

`lib/config.ts` și `lib/nav.ts` joacă rol de centre de adevăr pentru:

- configurații de site
- linkuri și navigație
- probabil helpers de path/url/canonical/base

Acesta este un standard corect și trebuie păstrat.

## 7.3 SEO centralizat

Există o standardizare clară pentru SEO:

- `Seo.tsx`
- `JsonLd.tsx`
- `pageMeta.ts`
- `menuJsonLd.ts`
- OG route `pages/api/og.tsx`
- robots/sitemap/feed generate server-side

Aceasta este una dintre piesele solide ale proiectului.

## 7.4 Pattern lazy pentru componente grele

Există pattern-uri de tip:

- `Component.tsx`
- `Component.lazy.tsx`

Acest lucru apare în mai multe zone:

- homepage
- blog
- maps
- menus
- sections

Este un standard bun pentru:

- reducerea costului inițial
- control mai bun al încărcării
- SSR/client boundaries mai curate

## 7.5 Theme system și global shell

Sunt standardizate:

- `theme.css.ts`
- `theme.global.css.ts`
- `ThemeSwitcher.tsx`
- `globals.css`
- `Layout.tsx`

Acest lucru oferă consistență globală de stil și comportament.

## 7.6 PWA / install flow

Sunt standardizate:

- install button
- PWA CTA
- service worker register
- manifest
- offline page

PWA este parte din infrastructură, chiar dacă nu este piesa centrală a produsului.

## 7.7 Consent / cookie layer

Există infrastructură standardizată pentru:

- `CookieProvider`
- `CookieBanner`
- `cookie-policy.tsx`
- utilitare în `lib/cookies.ts`

## 7.8 Media / assets organization

Media este organizată sănătos:

- blog covers
- current heroes
- gallery
- motivation cards
- profiles
- servicii / meniu
- og images
- screenshots
- videos

Asta face proiectul ușor de întreținut.

---

# 8) Utilitare comune server-side

> Mai jos sunt utilitarele importante care au impact server-side, infrastructural sau shared-domain.

## 8.1 Config / environment

### `lib/env.ts`

Rol:

- citire și validare config de runtime
- separare logică între mediu local / producție
- bază pentru API routes și mail/integrări

### `lib/config.ts`

Rol:

- configurare centrală site/app
- probabil sursă pentru URL-uri, meta, navigație, branding și/sau path helpers

### `lib/url.ts`

Rol:

- helpers de URL
- compunere URL-uri absolute/relative
- suport pentru SEO/canonical/OG/feed/sitemap

## 8.2 SEO / metadata

### `lib/pageMeta.ts`

Rol:

- centralizare metadata pe pagini
- standardizare title/description/canonical/og

### `lib/seo/menuJsonLd.ts`

Rol:

- structured data pentru meniuri / pagini relevante

## 8.3 Mail / forms / validation

### `lib/mail/offerRequestEmail.ts`

Rol:

- generare email pentru solicitările de ofertă

### `lib/validation/offerRequest.ts`

Rol:

- validare payload pentru offer request

Acestea confirmă că oferta nu este doar componentă UI, ci flow server-side real.

## 8.4 Reviews / storage

### `lib/reviews.ts`

Rol:

- logică domeniu pentru recenzii

### `lib/blob.ts`

Rol:

- integrare blob storage pentru uploads/assets asociate recenziilor

### `lib/kv.ts`

Rol:

- persistență / stocare simplificată pentru date asociate recenziilor sau altor layere

## 8.5 Gallery / content parsing

### `lib/gallery.ts`

### `lib/gallery.data.ts`

### `lib/gallery.store.ts`

### `lib/gallery/schema.ts`

Rol:

- parsare
- validare
- mapare
- store / acces la datele galeriei

## 8.6 Menus domain

### `lib/menus.ts`

### `lib/menus.public.ts`

Rol:

- acces public / mapare pentru meniuri
- susținere pentru pagini dinamice și prezentare comercială

## 8.7 Blog / content helpers

### `lib/blogData.ts`

Rol:

- sursă și mapare pentru conținutul de blog

## 8.8 Alte utilitare utile

### `lib/images.ts`

Rol:

- standardizare pe imagini / path-uri / surse

### `lib/dates.ts`

Rol:

- formatare și consistență pe date

### `lib/nav.ts`

Rol:

- centralizare navigație

### `lib/useLightboxKeyboard.ts`

Rol:

- UX pentru galerie/lightbox

---

# 9) Ce este funcțional și validat

> Această secțiune enumeră ce este fie evident funcțional din repo, fie confirmat în conversații ca validat / QA passed / build green.

## 9.1 Evident funcțional din repo

- homepage complet secționat
- pagină servicii
- pagină galerie
- pagină contact
- blog index + post dinamic
- pagini dinamice pentru meniuri
- reviews page
- cookie policy
- sitemap / robots / manifest / offline / errors
- Header / Footer / Layout / SEO / ThemeSwitcher / PWA install
- API routes pentru contact / reviews / offer request / OG / CSP report

## 9.2 Confirmat din conversații ca validat sau stabil

### Meniuri

- Issue #68: arc cards + pagini meniu + build/typecheck green
- ajustări ulterioare de titlu/prezentare finalizate

### Submenu servicii

- implementat și dus prin workflow de branch → commit → PR

### Pagină dedicată „cort evenimente la locația ta”

- introdusă împreună cu navigația și bannerul aferent
- extinsă cu TentVideos, TentGallery, blocuri motivaționale și MotivationCards (PR #77); CTA-uri contextuale per card prin `ctaHref` prop (PR #80)

### TentAtLocationBanner — video hero

- rescris complet ca video hero cu arc mask, gradient, dots, CTA-uri albe centrate
- intro centrat adăugat în `servicii.tsx` sub banner
- build/typecheck/lint green

### Reviews full-bleed fix

- confirmat rezolvat

### Contact form + API

- funcțional în dev la checkpoint-ul memorat
- urma doar finalizarea `.env.local` și test final

### Gallery image swap

- realizat pe branch dedicat

## 9.3 Ce este „funcțional, dar cu follow-up”

### Reviews

- funcțional, dar cu cleanup restant și condiționare form/page

### Offer Request

- infrastructură existentă și funcțională în dev
- business rules finale încă neînchise

### Contact

- funcțional în dev
- mai necesită confirmare de producție/env final, dacă nu s-a făcut deja în alt task ulterior

---

# 10) Current checkpoint

## 10.1 Unde este proiectul acum

ZephiraEvents este deja un proiect matur la nivel de:

- prezentare
- structură comercială
- SEO
- routing
- content organization
- lead generation de bază
- reviews
- meniu detail pages
- infrastructură PWA și UX modern

Nu mai este în faza de foundation.
Este într-o fază de:
**polish + consolidare + hardening + comercializare mai clară.**

## 10.2 Ce pare închis / solid

- shell-ul aplicației
- arhitectura mare
- majoritatea paginilor principale
- galeria
- blogul
- meniurile
- navigația principală
- reviews ca modul existent
- contact ca flow existent
- SEO infrastructure
- cardurile de servicii clickabile (`ServiciiComplete` + `ServiciiPreview`)
- WaiterBarSection și CateringSection (servicii complete fără fallback-uri)
- ancora `id="oferta"` în pagina de contact
- mobile menu drawer — typography uniformă și glassmorphism
- meniuri din pagina servicii — prezentare curată, fără panel, grid centrat
- MenusIntro component — tranziție vizuală între cort și meniuri
- MotivationCards — backMsg contextual + mobile layout compact

## 10.3 Ce rămâne sensibil / deschis

### A. Offer Request final business logic

Issue #49 rămâne cel mai clar punct deschis din punct de vedere comercial.

### B. Reviews final cleanup

Există mici restanțe operaționale.

### C. Production hardening

Mai ales pentru:

- mail
- reCAPTCHA
- medii
- eventual storage cleanup
- verificări finale de build/lint/typecheck

### D. Posibile micro-warning-uri tehnice

Exemplu memorat:

- hydration mismatch minor legat de `Appear/motion`

---

# 11) Roadmap logic și structurat

## Etapa 1 — Hardening pe ce există deja

Obiectiv: nimic nou major până nu este stabilizat ce există.

### 1.1 Contact flow

- verificare finală `.env.local` / producție
- SMTP
- reCAPTCHA
- autoreply
- test complet

### 1.2 Reviews flow

- form doar pe pagina 1 dacă asta a rămas deschis
- cleanup Blob / seed/test assets
- verificare persistență și moderare minimă dacă există

### 1.3 Offer Request flow

- închidere deciziilor comerciale
- finalizare validări și sumar email
- finalizare UX/a11y
- recaptcha propriu
- testare completă

## Etapa 2 — Consolidare comercială

Obiectiv: site-ul să explice mai bine și să convertească mai bine.

### 2.1 Servicii

- rafinare copy dacă este necesar
- ancore clare între servicii și meniuri
- legături comerciale mai bune între homepage / servicii / ofertare

### 2.2 Meniuri

- rafinare eventuală a conținutului și a CTA-urilor
- verificare schema / metadata / canonical pe paginile de meniu
- consolidare SEO pe meniuri

### 2.3 Cort la locație ✓

- TentAtLocationBanner rescris ca video hero — CTA-uri clare, intro centrat în servicii
- conectare în homepage și servicii — complet

## Etapa 3 — SEO și conținut

Obiectiv: creștere organică.

### 3.1 Blog

- extindere conținut
- interlinking între blog, servicii, meniuri și ofertare
- revizie pe metadata și structured data unde lipsesc

### 3.2 Galerie

- captions, alt-uri, ordonare și selecție comercială
- posibil filtrare viitoare doar dacă merită comercial

### 3.3 Reviews

- indexare controlată și paginare sănătoasă dacă este cazul

## Etapa 4 — UX și polish

Obiectiv: experiență premium fără zgomot tehnic.

- eliminare warnings rămase
- verificare hydration issues
- validare responsive pe paginile-cheie
- revizie LCP pe homepage și paginile importante
- verificare accesibilitate de bază

## Etapa 5 — Eventuală fază ulterioară

Numai dacă business-ul cere:

- mini-admin content flow
- captare lead-uri mai avansată
- integrare CRM/export
- tracking mai avansat
- raportare

---

# 12) Workflow obligatoriu

## 12.1 Reguli de lucru

- lucrăm **issue/task by issue/task**
- **branch separat** pentru fiecare task
- patch-uri doar pe fișierele implicate
- fără presupuneri inutile
- fără modificări în lanț care rup scope-ul
- păstrăm standardele KonceptID

## 12.2 Stil de livrare

- răspunsuri clare și eficiente
- patch-uri full file ready-to-replace când se cere explicit
- explicații scurte înainte de patch
- comenzi PowerShell curate pentru git workflow

## 12.3 Git workflow

Standardul folosit repetat:

1. create branch
2. implement local
3. run QA / lint / typecheck / build unde este cazul
4. commit
5. push
6. PR
7. squash merge
8. delete branch
9. update context file

## 12.4 Reguli tehnice obligatorii

- TypeScript strict
- fără `any`
- fără inline styling ca soluție permanentă
- Vanilla Extract
- structură clară
- cod scalabil
- fără workaround-uri hacky
- accent pe SEO / performanță / a11y
- **orice componentă de galerie/grid care folosește `<Appear>` trebuie să aibă `immediate` prop setat** — fără `immediate`, `IntersectionObserver` nu declanșează animația pe mobile în producție, lăsând grid-ul la `opacity: 0` (fix dovedit în PR #56 pe galeria principală și PR #79 pe TentGallery)

## 12.5 Regula nouă de continuitate

După fiecare task închis:

- se actualizează acest context file
- conversația următoare începe din context file, nu din recapitulări lungi

---

# 13) Ask-for-files list pentru task-uri viitoare

Când se reia munca pe ZephiraEvents, fișierele cerute depind de task, dar de regulă sunt relevante:

## Pentru navigație / servicii / meniuri

- `lib/nav.ts`
- `lib/config.ts`
- `pages/servicii.tsx`
- `components/Header.tsx`
- `components/HeaderPanel.lazy.tsx`
- `components/sections/menus/*`
- `data/menus.json`
- `lib/menus.ts`
- `types/menu.ts`

## Pentru ofertare

- `components/forms/OfferRequest.tsx`
- `pages/api/offer-request.ts`
- `lib/mail/offerRequestEmail.ts`
- `lib/validation/offerRequest.ts`
- `styles/forms/offerRequest.css.ts`

## Pentru contact

- `components/sections/contact/*`
- `pages/contact.tsx`
- `pages/api/contact.ts`
- `.env.example` / variabile relevante

## Pentru reviews

- `components/sections/Reviews.tsx`
- `components/sections/ReviewsForm.tsx`
- `pages/reviews.tsx`
- `pages/api/reviews.ts`
- `lib/reviews.ts`
- `lib/blob.ts`
- `lib/kv.ts`

## Pentru SEO / metadata

- `components/Seo.tsx`
- `components/JsonLd.tsx`
- `lib/pageMeta.ts`
- `lib/url.ts`
- `lib/seo/*`
- `pages/robots.txt.ts`
- `pages/sitemap*.ts`

## Pentru shell / theme / layout

- `components/Layout.tsx`
- `styles/theme.css.ts`
- `styles/theme.global.css.ts`
- `styles/globals.css`
- `components/ThemeSwitcher.tsx`

---

# 14) Do / Don’t

## Do

- menține proiectul ca platformă premium de prezentare + conversie
- păstrează config-ul și SEO centralizate
- păstrează data-driven content unde există deja
- finalizează comercial fluxurile existente înainte să adaugi altele noi
- tratează meniurile, reviews și oferta ca piloni comerciali reali
- actualizează contextul după fiecare task

## Don’t

- nu transforma proiectul prea devreme într-un sistem complex de booking/admin
- nu rupe standardizarea pentru micro-fix-uri rapide
- nu hardcoda conținut care deja are structură data-driven
- nu introduce soluții vizuale sau tehnice care ies din disciplina KonceptID
- nu porni task-uri noi mari înainte de hardening pe contact/reviews/offer-request

---

# 15) Update log reconstruit

## Faze majore identificate

1. Foundation / shell / SEO / PWA / theming
2. Homepage premium cu secțiuni multiple
3. Pagini principale și infrastructură editorială
4. Sistem blog
5. Sistem galerie data-driven
6. Contact flow cu API
7. Offer Request flow cu validare/mail
8. Reviews flow cu storage/backend
9. Servicii + meniuri + pagini dinamice meniu
10. Pagină dedicată „cort evenimente la locația ta”
11. Submenu servicii și rafinare navigație
12. Polish tehnic + warning fixes + refresh imagini galerie
13. TentAtLocationBanner rescris ca video hero (arc mask, CTA-uri, intro centrat în servicii)
14. Hero full-bleed cu mască arc pe toate paginile secundare
15. Pagina cort-la-locatie extinsă: TentVideos + TentGallery + blocuri motivaționale + MotivationCards

## Checkpoint-uri memorate explicit

- ZE-27: contact form/API funcțional în dev; urma env final + producție
- ZE-43: reviews full-bleed fix confirmat; restanțe mici de cleanup/flow
- ZE-49: solicită ofertă funcțional în dev, dar în așteptarea deciziilor finale de business
- ZE-68: meniuri dinamice + arc cards implementate, build/typecheck green
- post ZE-68: title/presentation tweak pentru meniuri
- task recent: submenu servicii + page/bannere asociate
- task recent: swap imagini galerie
- feature/tent-hero-video: TentAtLocationBanner → video hero complet, merged în main
- feature/hero-fullbleed-mask (PR #76): Hero full-bleed + arc mask + centrare verticală pe toate paginile secundare, merged în main
- feature/tent-gallery-videos (PR #77): pagina cort-la-locatie extinsă cu TentVideos, TentGallery, blocuri motivaționale, MotivationCards, tentIntro.css.ts — merged în main
- fix/tent-gallery-mobile (PR #78): TentGallery `<button>` → `<div role="button">` + `aspectRatio` fix pe imageWrap și videoWrap — merged în main
- fix/tent-gallery-mobile-v2 (PR #79): TentGallery `Appear immediate` + `Image width/height` fix + `image` CSS `width: 100% / height: auto` — merged în main
- feature/motivation-cards-cta (PR #80): MotivationCards `ctaHref`/`ctaLabel` props + CTA-uri contextuale pe toate cele 6 pagini — merged în main
- feature/servicii-cards-clickable (PR #81): ServiciiComplete + ServiciiPreview carduri clickabile cu anchor links, hover tint `rgba(85, 97, 242, 0.08)`, animație SVG CSS-driven — merged în main
- feature/waiter-bar-section (PR #82): WaiterBarSection + CateringSection implementate, ancore servicii complete actualizate, `id="oferta"` în contact — merged în main
- feature/waiter-bar-mobile-layout (PR #83): layout mobile textTop/textBottom split pentru ambele componente — merged în main
- fix/waiter-bar-textbottom-center (PR #84): `alignSelf: center` pe textBottom — merged în main
- fix/mobile-menu-typography (PR #85): fontWeight 600 uniform pe toate elementele drawer mobil — merged în main
- fix/mobile-menu-fontsize (PR #86): fontSize 1rem explicit pe panelLink/panelAccordionBtn/panelSubLink — merged în main
- feature/header-panel-glass (PR #87): glassmorphism pe HeaderPanel — merged în main
- fix/header-panel-glass-opacity (PR #88): opacitate ajustată light 0.55 / dark 0.60 — merged în main
- feature/menus-polish (PR #89): menus polish complet — eyebrow/title swap, panel removed, arc grid centrat, MenusIntro component, fix separatoare — merged în main
- feature/motivation-cards-polish (PR #90): backMsg contextual pe toate cele 6 pagini — merged în main
- fix/motivation-cards-mobile (PR #91): mobile 2col, height compact, title jos, back text stânga — merged în main

---

# 16) Rezumat executiv

ZephiraEvents este deja un produs matur la nivel de prezentare și structură.  
Cea mai sănătoasă direcție de acum înainte este:

1. **hardening** pe flow-urile existente
2. **închiderea comercială** pe Offer Request
3. **curățare și finalizare** pe Reviews
4. **verificare finală Contact/SMTP/reCAPTCHA/producție**
5. **consolidare SEO + conversie** pe servicii / meniuri / blog / galerie

Pe scurt:
**fundația este bună, arhitectura este sănătoasă, produsul are direcție clară; următoarea etapă nu este reinventare, ci consolidare inteligentă.**
