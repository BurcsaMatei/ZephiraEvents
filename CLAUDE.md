# ZephiraEvents — CLAUDE.md

**Versiune:** v26
**Data:** 2026-06-13
**Status:** activ

---

## 1. Ce este proiectul

ZephiraEvents este un website premium de prezentare și conversie pentru o sală de evenimente din Focșani, județul Vrancea. Scopul principal este să inspire încredere, să clarifice oferta comercială (meniuri, servicii, cort extern) și să capteze lead-uri prin formulare de contact și solicitare ofertă. Proiectul este o platformă editorial-comercială — nu un booking engine sau CRM.

---

## 2. Stack

- **Framework:** Next.js 15 (Pages Router), React 19, TypeScript strict
- **Styling:** Vanilla Extract (`*.css.ts`) — fără inline styling ca standard
- **Animații:** Framer Motion, componenta `Appear` internă, `ReducedMotionProvider` — context global pentru `useReducedMotion()`
- **Validare:** Zod
- **Lightbox:** yet-another-react-lightbox
- **Persistență universală:** GitHub Contents API (PAT) — fișiere JSON în `data/messages/`, `data/reviews/`, `data/menus/`; articole blog în `data/blog/*.md`; `lib/admin/github.ts` pentru toate operațiunile de scriere
- **Deployment:** Vercel
- **PWA:** next-pwa (activ doar în producție cu `NEXT_PUBLIC_ENABLE_PWA=1`); `public/sw.js`, `public/workbox-*.js`, `public/fallback-*.js` sunt generate la build și sunt în `.gitignore`
- **SEO:** metadata centralizată, JSON-LD, OG static pre-generat, sitemap/robots server-side
- **Assets media:** imagini servite nativ ca **WebP** (conversie one-shot 2026-05-19, fără pipeline runtime); video-uri servite nativ ca **MP4 H.264** (deja optimizate CRF 28, mai eficiente decât VP9 pe conținut pre-comprimat); excepții: `og*.jpg` rămân JPG (compatibilitate OG social), `public/icons/*.png` + favicon + screenshots + `logo-dedicat.png` rămân PNG (PWA/JSON-LD)
- **Billing:** `stripe ^22.1.1` — verificare semnătură webhook (`stripe.webhooks.constructEvent`), procesare `invoice.paid`
- **devDependencies notabile:** `sharp` (optimizare imagini + procesare foto profil recenzii), `puppeteer` (generare OG screenshots), `gray-matter` + `marked` (parsare articole blog Markdown)

---

## 3. Structura proiectului

```
components/
  admin/               AdminLayout.tsx — sidebar nav cu iconițe SVG inline (Inbox/Recenzii/Meniuri/Blog/KonceptID), logout, manifest PWA admin
                       AdminSearch.tsx — câmp de căutare global admin (mesaje + recenzii)
                       AdminInstallButton.tsx — buton PWA install (apare în sidebar)
  animations/          Appear, AppearGroup — animații pe scroll/viewport; ReducedMotionProvider — context global useReducedMotion()
  blog/                BlogCard, RelatedPosts
  brand/               componente de identitate vizuală
  cookies/             CookieProvider, CookieBanner
  forms/               OfferRequest — formular solicitare ofertă; prop `hideHeading?: boolean` ascunde h2+lead intern (când e wrapat în IntroSection extern)
  pwa/                 InstallAppButton, PwaInstallCta, ServiceWorkerRegister (+ .inner)
  sections/
    contact/           ContactInfo, ContactMapIframeConsent, FormContact
                       ~~ContactMapAddress~~ — eliminată (2026-05-20, PR #148): adresa e acum în IntroSection lede pe pagina /contact
                       ContactSlaCard — componentă orfană (neutilizată în prezent)
    homepage/          ArcGallery, HeroIndex, LogoBeforeIntro
    menus/             ArcMenuGallery — galerie carduri meniuri cu autoplay
    reviews/           Reviews, ReviewsForm
    servicii/          CateringSection, MenusIntro, ServiciiComplete, WaiterBarSection
    tent/              TentAtLocationBanner, TentGallery, TentVideos
    Hero.tsx           Hero full-bleed cu mască arc SVG (pagini secundare)
    IntroSection.tsx   Bloc intro centrat refolosibil
    MotivationCards.tsx, Outro.tsx, OutroContact.tsx, Serviciipreview.tsx, ArticlesPreview.tsx
  ui/                  AnimatedIcon, Img, și alte componente UI mici
  Layout.tsx, Header.tsx, Footer.tsx, Seo.tsx, Breadcrumbs.tsx, Button.tsx, etc.
  ~~JsonLd.tsx~~ — șters (2026-03-21): era client-side only; folosește prop `structuredData` pe `<Seo>`

data/
  gallery.json         catalog imagini galerie (generat de scripts/build-gallery.mjs)
  galleryCaptions.json capțiuni galerie
  blog/                articole blog — fișiere Markdown cu front-matter gray-matter (`*.md`); citite via `lib/blog.server.ts`
                       creat/editat/șters via GitHub API din admin (`pages/admin/blog/`)
  menus/               directorul activ de persistență meniuri — 17 fișiere JSON individuale ({slug}.json)
                       populat one-time prin scripts/migrate-menus.mjs (2026-05-20); creat/editat/șters via GitHub API din admin
  menus-index.json     index generat la prebuild (scripts/build-menus-index.mjs) — [{slug, title, eventType}], fără deleted; importat client-safe în lib/menus.public.ts
  messages/            directorul activ de persistență mesaje — fișiere JSON individuale (contact-{ts}-{id}.json, offer-{ts}-{id}.json)
                       salvate de `pages/api/contact.ts` și `pages/api/offer-request.ts` via GitHub API; citite admin via `lib/admin/github.ts`
  ~~menus.json~~       șters (2026-05-20) — înlocuit cu data/menus/*.json individuale
  reviews.json         12 recenzii statice originale — sursă one-time pentru migrare; NU mai e sursa activă
  reviews/             directorul activ de persistență recenzii — fișiere JSON individuale (review-{ts}-{id}.json)
                       populate inițial prin scripts/migrate-reviews.ts; creat prin formular + moderare admin
  konceptid/           billing KonceptID — contract.json (contract activ) + contract_ZE.pdf (PDF trackat în git) + invoices/ (facturi per event invoice.paid)
                       contract.json creat/editat manual; contract_ZE.pdf trackat în git; invoices/ populat automat de webhook Stripe

lib/
  admin/               auth.ts, response.ts, sanitize.ts, search.ts, login.ts, logout.ts
                       github.ts — GitHub Contents API (createFile, getFile, updateFile, listFiles, uploadImage)
                       blog/ — helper-e server-side admin pentru blog
                       menus/ — helper-e server-side admin pentru meniuri
                       messages/ — helper-e server-side admin pentru mesaje
                       reviews/ — helper-e server-side admin pentru recenzii
                       ~~supabase.ts~~ — șters: Supabase eliminat complet din proiect
                       ~~supabase.types.ts~~ — șters
                       ~~smtp.ts~~ — șters: trimitere email eliminată
                       ~~analytics.ts~~ — șters: GA4 eliminat
                       ~~imap.ts~~ — șters (2026-03-23)
                       ~~gmail.ts~~ — șters (2026-03-24)
  gallery/             schema.ts — validare și tipuri galerie
  mail/                offerRequestEmail.ts — template email ofertă
  seo/                 menuJsonLd.ts — structured data meniuri
  validation/          offerRequest.ts — validare Zod pentru ofertă
  blog.server.ts       server-only — citire articole blog din `data/blog/*.md` (fs + gray-matter + marked); exportă `getAllPosts`, `getPostBySlug`, `getAllPostsAdmin`, `getRelatedByTags`, `buildMarkdownFile`, `titleToSlug`
                       ~~blogData.ts~~ — înlocuit cu `lib/blog.server.ts`
  config.ts            centrul de adevăr: SITE, CONTACT, THEME, SOCIAL_URLS, BASE_PATH, helpers URL
  gallery.ts / gallery.data.ts / gallery.store.ts   parsing, mapare, store galerie
  menus.ts             logică domeniu meniuri — pur, client-safe (doar getEventTypeAnchorHref)
  menus.server.ts      server-only (fs la build-time + GitHub API la runtime): getAllMenus, getAllMenusAdmin, getMenuBySlug, getAllMenusFromGit, getMenuBySlugFromGit
  menus.public.ts      client-safe — importă data/menus-index.json (generat la prebuild)
  nav.ts               NAV, SERVICII_SUBMENU, SOCIAL — navigație centralizată
  pageMeta.ts          metadata centralizată per pagină
  reviews.ts           logică domeniu recenzii (tip Review, tip Rating)
  url.ts, env.ts, cookies.ts, dates.ts, images.ts

pages/
  index.tsx            Homepage
  servicii.tsx         Pagina servicii
  galerie.tsx          Galerie foto
  contact.tsx          Contact + ofertă
  cort-evenimente-la-locatia-ta.tsx   Landing cort extern
  reviews.tsx          Pagina recenzii (SSR — GitHub API data/reviews/*.json, status: approved, !deleted)
  blog/index.tsx       Blog — lista articole
  blog/[slug].tsx      Articol individual
  meniuri/[slug].tsx   Pagina dinamică meniu
  marca.tsx, cookie-policy.tsx, 404.tsx, 500.tsx, _offline.tsx
  robots.txt.ts, site.webmanifest.ts, sitemap*.ts
  admin/
    login.tsx          Login admin (cookie httpOnly, bypass Layout public, înregistrare admin-sw.js)
    inbox/index.tsx    Lista mesaje (contact + ofertă din data/messages/) + soft delete + paginare
    inbox/[id].tsx     Detaliu mesaj + buton mailto: pentru răspuns extern
    reviews.tsx        Moderare recenzii — approve / reject / delete (soft delete via `deleted: true`)
    menus/index.tsx    Lista meniuri (SSR fs) + butoane Edit/Șterge/Restaurează (soft delete)
    menus/new.tsx      Formular creare meniu nou — POST via GitHub API
    menus/[slug].tsx   Formular editare meniu (SSR fs prefill) — PATCH via GitHub API; upload imagine separat
    blog/index.tsx     Lista articole blog (SSR fs) + butoane Edit/Șterge/Restaurează
    blog/new.tsx       Formular creare articol nou — POST via GitHub API
    blog/[slug].tsx    Formular editare articol (SSR fs prefill) — PATCH via GitHub API
    konceptid.tsx      Dashboard billing KonceptID — contract activ + zile până la factură + istoric facturi PDF
  api/                 (vezi secțiunea 4)

public/
  images/              current/, gallery/, blog/, motivationcards/, profiles/, servicii/
    profiles/          foto profil recenzii — WebP 400×400, generate la submit formular
  videos/              current/, tent/
  icons/, masks/, screenshots/
  admin-manifest.json  PWA manifest dedicat admin (name: ZephiraEvents Admin, scope: /admin/)
  admin-sw.js          Service worker admin izolat — cache minimal /admin/*, network-first
  llms.txt             Index pentru crawlere AI (llms.txt standard) — actualizat manual la schimbări majore de conținut
  llms-full.txt        Versiunea extinsă cu conținut complet — include meniuri detaliate, articole blog, recenzii, FAQ (creat 2026-05-20)
  ~~sw.js~~            generat de next-pwa la build — în .gitignore
  ~~workbox-*.js~~     generat de next-pwa la build — în .gitignore
  ~~fallback-*.js~~    generat de next-pwa la build — în .gitignore

scripts/
  build-gallery.mjs    generează lib/gallery.data.ts + data/gallery.json (rulat la prebuild)
  build-menus-index.mjs generează data/menus-index.json din data/menus/*.json (rulat la prebuild, filtru deleted)
  build-rss.ts         generează public/rss.xml + public/feed.xml (rulat la postbuild)
  generate-og.mjs      generează OG images statice pentru cele 7 pagini fixe (Puppeteer)
  ~~gmail-auth.mjs~~   șters (2026-03-24): nu mai e necesar — sync via IMAP Edge Function
  migrate-menus.mjs    one-time: migrează data/menus.json → data/menus/*.json (RULAT 2026-05-20)
  migrate-reviews.ts   one-time: migrează data/reviews.json → data/reviews/*.json via GitHub API (RULAT 2026-05-19)
  optimise-images.mjs  comprimă JPEG-uri din public/images/ cu sharp (MozJPEG)
  optimise-videos.mjs  recomprimă MP4-uri din public/videos/ cu ffmpeg
  project-tree.ps1     utilitar explorare structură (PowerShell)

styles/
  admin/               blog.css.ts, compose.css.ts, inbox.css.ts, konceptid.css.ts, layout.css.ts,
                       login.css.ts, message.css.ts, menus.css.ts, reviews.css.ts, search.css.ts
                       `layout.css.ts` conține `deleteBtn` centralizat (folosit de toate paginile admin) și token `vars.color.danger`
                       ~~analytics.css.ts~~ — șters: GA4 eliminat
                       ~~sent.css.ts~~ — șters (2026-05-20, PR #150): orfan — `sent.tsx` nu există
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

~~supabase/~~ — directorul a fost eliminat complet; Supabase nu mai este folosit în proiect

types/
  blog.ts, global.d.ts, menu.ts, etc.
  konceptid.ts         ContractJson (incl. billingCycle + 3 paymentLink*) + InvoiceJson — tipuri pentru billing KonceptID
  ~~admin.ts~~ — șters: SentKind/SentItem nu mai sunt necesare (sent/analytics eliminate)
```

---

## 4. Pagini și routing

### Pagini principale

| Pagină                           | Fișier                                    | Rol comercial                                                                     |
| -------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| `/`                              | `pages/index.tsx`                         | Homepage — brand, teaser servicii, galerie arc, recenzii, motivație               |
| `/servicii`                      | `pages/servicii.tsx`                      | Prezentare completă servicii, meniuri (4 tipuri), cort extern, ospătari, catering |
| `/galerie`                       | `pages/galerie.tsx`                       | Galerie foto cu lightbox YARL + Zoom                                              |
| `/contact`                       | `pages/contact.tsx`                       | Contact (tel/email/adresă), hartă cu consent, formular contact, formular ofertă   |
| `/cort-evenimente-la-locatia-ta` | `pages/cort-evenimente-la-locatia-ta.tsx` | Landing serviciu cort extern — video, galerie, motivație                          |
| `/reviews`                       | `pages/reviews.tsx`                       | Recenzii clienți (SSR — GitHub API `data/reviews/*.json`, status approved, !deleted) |
| `/blog`                          | `pages/blog/index.tsx`                    | Lista articole blog (SEO)                                                         |
| `/blog/[slug]`                   | `pages/blog/[slug].tsx`                   | Articol individual cu Hero full-bleed                                             |
| `/meniuri/[slug]`                | `pages/meniuri/[slug].tsx`                | Pagina dinamică meniu — detalii, prețuri, galerie                                 |
| `/marca`                         | `pages/marca.tsx`                         | Pagina identitate brand                                                           |
| `/cookie-policy`                 | `pages/cookie-policy.tsx`                 | Politica cookie                                                                   |

### Pagini admin (protejate — cookie httpOnly HMAC)

| Pagină                  | Fișier                           | Rol                                                            |
| ----------------------- | -------------------------------- | -------------------------------------------------------------- |
| `/admin`                | `pages/admin/index.tsx`          | Dashboard — 4 carduri statistici live (Inbox/Recenzii/Meniuri/Blog); SSR Promise.all dublu-nivelat |
| `/admin/login`          | `pages/admin/login.tsx`          | Autentificare — email + parolă, setează cookie sesiune; redirect spre `/admin`; înregistrează admin-sw.js |
| `/admin/inbox`          | `pages/admin/inbox/index.tsx`    | Lista mesaje (contact/ofertă din `data/messages/`) + soft delete + paginare       |
| `/admin/inbox/[id]`     | `pages/admin/inbox/[id].tsx`     | Detaliu mesaj + buton mailto: pentru răspuns extern                                |
| `/admin/reviews`        | `pages/admin/reviews.tsx`        | Moderare recenzii pending — approve / reject / delete (soft delete)                |
| `/admin/menus`          | `pages/admin/menus/index.tsx`    | Lista meniuri (SSR fs, include deleted) + soft delete / restaurare                 |
| `/admin/menus/new`      | `pages/admin/menus/new.tsx`      | Formular creare meniu nou — POST via GitHub API                                    |
| `/admin/menus/[slug]`   | `pages/admin/menus/[slug].tsx`   | Formular editare (SSR fs prefill) — PATCH câmpuri + upload imagine via GitHub API  |
| `/admin/blog`           | `pages/admin/blog/index.tsx`     | Lista articole blog (SSR fs, include deleted) + soft delete / restaurare           |
| `/admin/blog/new`       | `pages/admin/blog/new.tsx`       | Formular creare articol nou — POST via GitHub API                                  |
| `/admin/blog/[slug]`    | `pages/admin/blog/[slug].tsx`    | Formular editare articol (SSR fs prefill) — PATCH via GitHub API                  |
| `/admin/konceptid`      | `pages/admin/konceptid.tsx`      | Dashboard billing — contract activ, zile până la factură, istoric facturi + PDF    |

### API Routes publice

| Route                     | Fișier                       | Rol                                                                   |
| ------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| `POST /api/contact`       | `pages/api/contact.ts`       | Validare Zod + reCAPTCHA; salvează JSON în `data/messages/` via GitHub API |
| `POST /api/offer-request` | `pages/api/offer-request.ts` | Validare Zod + reCAPTCHA; salvează JSON în `data/messages/` via GitHub API |
| `POST /api/review-submit` | `pages/api/review-submit.ts` | Formular recenzie — procesează foto (sharp → WebP), salvează JSON în `data/reviews/` via GitHub API (status: pending) |
| `GET /api/og`             | `pages/api/og.tsx`           | Unealtă internă pentru `npm run generate:og` — nu e apelat din pagini |
| `POST /api/csp-report`    | `pages/api/csp-report.ts`    | Colectare rapoarte Content-Security-Policy                            |
| `POST /api/konceptid/stripe-webhook` | `pages/api/konceptid/stripe-webhook.ts` | Webhook Stripe — verificare semnătură HMAC, handler `invoice.paid`, salvează `InvoiceJson` în `data/konceptid/invoices/` via GitHub API; `bodyParser: false` |

### API Routes admin (protejate — verifică sesiune la fiecare request)

| Route                                  | Metodă | Rol                                                               |
| -------------------------------------- | ------ | ----------------------------------------------------------------- |
| `/api/admin/login`                     | POST   | Verifică credențiale, setează cookie sesiune; rate limit 5/IP/15min |
| `/api/admin/logout`                    | POST   | Șterge cookie sesiune                                             |
| `/api/admin/search`                    | GET    | Căutare globală în mesaje + recenzii (GitHub API)                 |
| `/api/admin/messages`                  | GET    | Listează mesaje din `data/messages/` via GitHub API, filtrate `!deleted` |
| `/api/admin/messages/[id]`             | GET    | Detaliu mesaj; auto-marchează ca `read` via GitHub API             |
| `/api/admin/messages/[id]`             | PATCH  | `{ action: "delete" }` soft delete — `deleted: true` în JSON via GitHub API |
| `/api/admin/reviews`                   | GET    | Listează recenzii (GitHub API `data/reviews/`) cu filtru opțional `?status=` |
| `/api/admin/reviews/[id]`              | PATCH  | Moderare: `{ action: "approve" \| "reject" \| "delete" }` — scrie JSON via GitHub API |
| `/api/admin/menus`                     | GET    | Listează toate meniurile (fs local, include deleted), sortate slug |
| `/api/admin/menus`                     | POST   | Creează meniu nou — `createFile` via GitHub API                    |
| `/api/admin/menus/[slug]`              | GET    | Detaliu meniu (fs local, include deleted)                          |
| `/api/admin/menus/[slug]`              | PATCH  | Editare câmpuri \| `{ action: "delete" }` soft delete \| `{ action: "uploadImage" }` — toate via GitHub API |
| `/api/admin/blog`                      | GET    | Listează articole (fs local, include deleted)                      |
| `/api/admin/blog`                      | POST   | Creează articol nou — `createFile` via GitHub API                  |
| `/api/admin/blog/[slug]`               | GET    | Detaliu articol (fs local, include deleted)                        |
| `/api/admin/blog/[slug]`               | PATCH  | Editare câmpuri \| `{ action: "delete" }` soft delete via GitHub API |

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
- `lib/admin/` — exclusiv server-side; nu importa din componente client

### Admin — reguli specifice

- `verifyAdminSession(req)` se apelează la **fiecare** API route și `getServerSideProps` admin
- Sesiunile admin sunt HMAC-SHA256 derivate din `ADMIN_EMAIL + ADMIN_PASSWORD + ADMIN_SESSION_SECRET`; schimbarea oricăreia invalidează toate sesiunile active
- **Format răspuns API:** toate API routes admin returnează `{ ok: false, error: string }` via `errorResponse()` — **nu** `{ ok: false, message: string }`; importă din `lib/admin/response.ts`
- **XSS în admin:** orice conținut dinamic randat în admin via `dangerouslySetInnerHTML` **trebuie** trecut prin `sanitizeHtml()` din `lib/admin/sanitize.ts`
- **Butoane Șterge:** folosește `lay.deleteBtn` din `styles/admin/layout.css.ts` — NU adăuga un `deleteBtn` local în fiecare pagină admin
- **Culoare pericol:** folosește `vars.color.danger` din theme (light: `#dc2626`, dark: `#f87171`) — NU hardcoda roșu în stiluri admin

### Reguli speciale descoperite în lucru

- **`Appear` cu `immediate` prop:** orice componentă `<Appear>` pe un grid/container trebuie să aibă `immediate` setat — fără el, `IntersectionObserver` nu declanșează animația pe mobile în producție (fix dovedit în PR #56, #79)
- **Full-bleed pattern:** secțiunile Hero nu se învelesc în `.section > .container` — au `data-full-bleed="true"` și nu au clasa `.section` pe wrapper (aceasta adaugă `paddingBlock: 24px` și creează gap)
- **`Breadcrumbs` după Hero:** întotdeauna sub secțiunea `<Hero>`, nu în interiorul ei
- **`<Appear>` pe container, nu pe fiecare item:** pentru grid-uri cu multe items, `Appear` cu `immediate` se pune pe containerul `Grid`, nu pe fiecare card individual

### SEO

- Metadata centralizată în `lib/pageMeta.ts` (include câmp `description` per pagină)
- JSON-LD **SSR** via prop `structuredData` pe `<Seo>` — nu injecta script tags din componente client
- `buildMenuJsonLd` se apelează exclusiv din `pages/meniuri/[slug].tsx` (SSR/SSG), nu din componente; acceptă `pageUrl` și `toAbsoluteImage` ca parametri opționali
- OG assets dedicate per pagină unde e cazul
- `<Seo structuredData={[...]} />` direct în pagină — `JsonLd.tsx` a fost șters
- `CONTACT.geo` în `lib/config.ts` este sursa de adevăr pentru coordonatele GPS — nu hardcoda lat/lng în pagini
- `og:image:type` se derivă automat din extensia URL în `components/Seo.tsx` — nu îl adăuga manual
- `twitter:creator` se transmite via prop pe `<Seo>` (ex: din `post.author` în `/blog/[slug]`)
- `trailingSlash: false` explicit în `next.config.mjs` — `canonical()` și `absoluteUrl()` sunt aliniate
- `canonical` este omis automat de `<Seo>` când `noindex={true}` — nu adăuga `noindex` și `canonical` simultan
- `public/llms.txt` — actualizează-l la fiecare schimbare majoră de conținut (meniuri noi, pagini noi, prețuri modificate); `public/llms-full.txt` conține meniuri detaliate, blog, recenzii și FAQ — actualizează simultan

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

### Admin dashboard

- `lib/admin/auth.ts` — `verifyAdminSession()`, `verifyCredentials()`, `generateSessionToken()`
- `lib/admin/github.ts` — GitHub Contents API (PAT): `createFile`, `getFile`, `updateFile`, `listFiles`, `uploadImage`; sursa unică pentru TOATE operațiunile de persistență (mesaje, recenzii, meniuri, blog, foto profil)
- `lib/admin/response.ts` — `okResponse()` / `errorResponse()` — format uniform `{ ok: true [, data] }` / `{ ok: false, error }`
- `lib/admin/sanitize.ts` — `sanitizeHtml()` — strip tags + escape entities; folosit cu `dangerouslySetInnerHTML` în toate paginile admin
- `lib/admin/search.ts` — căutare globală în `data/messages/` + `data/reviews/` via GitHub API
- `components/admin/AdminLayout.tsx` — sidebar cu iconițe SVG inline: Inbox / Recenzii / Meniuri / Blog / KonceptID + logout + ThemeSwitcher; manifest PWA admin
- `components/admin/AdminSearch.tsx` — componentă de căutare globală în sidebar
- `components/admin/AdminInstallButton.tsx` — buton PWA install în sidebar
- `public/admin-manifest.json` — PWA manifest dedicat, scope /admin/, start_url /admin/inbox
- `public/admin-sw.js` — service worker izolat scope /admin/, network-first, cache minimal
- **Soft delete mesaje:** câmpul `deleted: true` în JSON-ul mesajului; citirile filtrează `!m.deleted`; PATCH `{ action: "delete" }` scrie JSON actualizat via GitHub API
- **Soft delete recenzii:** câmpul `deleted: true` în JSON-ul recenziei; citirile filtrează `!r.deleted`; PATCH `{ action: "delete" }` scrie JSON actualizat via GitHub API
- **`deleteBtn` centralizat:** `styles/admin/layout.css.ts` exportă `deleteBtn` folosit de toate paginile admin; stilizat cu `vars.color.danger`
- **Sidebar layout:** `position: fixed`, `top: 0`, `left: 0`, `height: 100vh`, `zIndex: 100` — rămâne fix la scroll; `main` compensează cu `marginLeft: 232px` (resetat la 0 pe mobil)
- **`vars.color.danger`:** token Vanilla Extract — light: `#dc2626`, dark: `#f87171` — sursa unică pentru culoarea butoanelor de ștergere
- **Rate limiting login:** in-memory Map per IP, 5 încercări eșuate / 15 minute → 429; reset la autentificare reușită

### Variabile de mediu necesare

**`.env.local` + Vercel env vars:**

```
GITHUB_PAT=...                      # GitHub Personal Access Token (repo scope)
GITHUB_OWNER=BurcsaMatei
GITHUB_REPO=ZephiraEvents
GITHUB_BRANCH=main
ADMIN_EMAIL=...                     # credențiale login admin
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...            # secret HMAC-SHA256 pentru cookie sesiune
RECAPTCHA_SECRET_KEY=...            # Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
STRIPE_SECRET_KEY=...               # Stripe secret key (sk_live_*)
STRIPE_WEBHOOK_SECRET=...           # Stripe webhook signing secret (whsec_*)
STRIPE_PRICE_ID=...                 # Stripe Price ID pentru subscripția KonceptID
```

**Complet eliminate din arhitectură:** Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), SMTP (`SMTP_*`), Gmail (`GMAIL_*`), IMAP (`IMAP_*`, `SYNC_SECRET`), GA4 (`GOOGLE_APPLICATION_CREDENTIALS`, `GA4_PROPERTY_ID`).

### Navigație / Header

- `lib/nav.ts` — NAV, SERVICII_SUBMENU, SOCIAL
- `lib/config.ts` — BASE_PATH, withBase, CONTACT, SITE
- `components/Header.tsx`, `components/HeaderPanel.lazy.tsx`

### Meniuri

- `data/menus/` — 17 fișiere JSON individuale (`{slug}.json`); câmp `deleted?: boolean` pentru soft delete
- `data/menus-index.json` — generat la prebuild; array `[{slug, title, eventType}]` fără deleted; sursă pentru client bundle
- `lib/menus.ts` — pur, client-safe; exportă `getEventTypeAnchorHref(eventType)`
- `lib/menus.server.ts` — server-only (fs + GitHub API); `getAllMenus()` (fără deleted), `getAllMenusAdmin()` (cu deleted), `getMenuBySlug(slug, { includeDeleted? })`, `getAllMenusFromGit()`, `getMenuBySlugFromGit()`
- `lib/menus.public.ts` — client-safe; importă `data/menus-index.json`
- `types/menu.ts` — `Menu` interface include `deleted?: boolean`
- `lib/seo/menuJsonLd.ts` — structured data
- `scripts/build-menus-index.mjs` — generează `data/menus-index.json` la prebuild
- `scripts/migrate-menus.mjs` — one-time migration (RULAT 2026-05-20); NU rula din nou
- `components/sections/menus/ArcMenuGallery.lazy.tsx`
- `pages/meniuri/[slug].tsx` — SSG (getStaticProps + getStaticPaths via fs)
- `pages/servicii.tsx` — SSG (getStaticProps via `getAllMenus()` din `lib/menus.server.ts`)
- `pages/admin/menus/index.tsx`, `new.tsx`, `[slug].tsx` — CRUD admin
- `pages/api/admin/menus/index.ts`, `[slug].ts` — API routes admin (GET = fs; WRITE = GitHub API)
- `styles/admin/menus.css.ts` — stiluri pagini admin meniuri
- `styles/menus/menuDetail.css.ts`
- **Principiu READ/WRITE meniuri admin:** GET citește din fs local (`lib/menus.server.ts`) — rapid, fără GitHub API; WRITE (createFile, updateFile, uploadImage) merge via GitHub API → persistă în `data/menus/` pe `main`

### Galerie

- `data/gallery.json` (generat), `data/galleryCaptions.json`
- `lib/gallery.ts`, `lib/gallery.data.ts`, `lib/gallery.store.ts`, `lib/gallery/schema.ts`
- `pages/galerie.tsx`
- `scripts/build-gallery.mjs` — adaugă imagini în `public/images/gallery/` și regenerează

### Contact

- `components/sections/contact/ContactInfo.tsx`, `FormContact.tsx`, `ContactMapIframeConsent.tsx`
- `pages/contact.tsx` — structură curentă (PR #148): secțiunea Ofertă cu `<IntroSection>` extern + `<OfferRequest hideHeading />`; secțiunea Hartă cu `<IntroSection>` care include adresa + buton „Vezi locația exactă"; `ContactMapAddress` eliminat — adresa e în `lede` al `IntroSection`; `mapsUrl` calculat local din `addressLine` via `https://www.google.com/maps/search/...`
- `components/forms/OfferRequest.tsx` — prop `hideHeading?: boolean`: când `true`, ascunde `<h2>` intern și `<p>` lead, folosind `aria-label` în loc de `aria-labelledby`
- `pages/api/contact.ts` — salvează JSON în `data/messages/` via `createFile()`; fără SMTP
- `pages/api/offer-request.ts` — salvează JSON în `data/messages/` via `createFile()`; fără SMTP
- `.env.local` — reCAPTCHA (`RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`)

### Solicitare ofertă

- `components/forms/OfferRequest.tsx` — prop `hideHeading?: boolean` (default `false`)
- `pages/api/offer-request.ts` — salvează în `data/messages/` via GitHub API
- `lib/validation/offerRequest.ts`
- `styles/forms/offerRequest.css.ts`
- ~~`lib/mail/offerRequestEmail.ts`~~ — șters: trimitere email eliminată

### Blog

- `data/blog/` — articole Markdown cu front-matter gray-matter (`*.md`); creat/editat/șters via admin
- `lib/blog.server.ts` — server-only; `getAllPosts()`, `getPostBySlug()`, `getAllPostsAdmin()`, `getRelatedByTags()`, `buildMarkdownFile()`, `titleToSlug()`; conține `import fs` — **NU importa din client**
- `pages/blog/index.tsx` — lista articole (SSG via `getStaticProps`)
- `pages/blog/[slug].tsx` — articol individual cu Hero full-bleed (SSG)
- `pages/admin/blog/index.tsx`, `new.tsx`, `[slug].tsx` — CRUD admin
- `pages/api/admin/blog/index.ts` (GET fs / POST GitHub API), `[slug].ts` (GET fs / PATCH GitHub API)
- `styles/admin/blog.css.ts` — stiluri pagini admin blog
- **Principiu READ/WRITE blog:** GET citește din fs local (`lib/blog.server.ts`) — rapid; WRITE merge via GitHub API → persistă în `data/blog/` pe `main`

### Recenzii

- `components/sections/reviews/Reviews.tsx`, `ReviewsForm.tsx`
- `pages/reviews.tsx` — **SSR** — citește din `data/reviews/` via GitHub API (`listFiles` + `getFile`), filtrează `status='approved' && !deleted`
- `pages/api/review-submit.ts` — primește recenzia + opțional foto (base64); procesează cu `sharp` → WebP 400×400 q85; uploadează foto via `uploadImage()` în `public/images/profiles/`; salvează JSON în `data/reviews/review-{ts}-{id}.json` via `createFile()` (status: pending)
- `pages/api/admin/reviews/index.ts` — GET: citește toate recenziile din `data/reviews/` via GitHub API; filtru `?status=`; exclude `deleted`
- `pages/api/admin/reviews/[id].ts` — PATCH: `approve` / `reject` → scrie `publishedAt` + status; `delete` → setează `deleted: true`; toate prin `getFile` + `updateFile`
- `pages/admin/reviews.tsx` — SSR + client state; butoane Aprobă/Respinge/Șterge; delete cu `confirm()`
- `lib/reviews.ts` — tipuri `Review`, `Rating`
- `data/reviews.json` — 12 recenzii originale statice; **NU mai e sursa activă** — a servit ca sursă pentru migrarea one-time
- `data/reviews/` — directorul activ: fișiere JSON individuale, unul per recenzie, format `review-{timestamp}-{nanoid8}.json`
- `public/images/profiles/` — foto profil recenzii; `profile-{review-id}.webp`
- `scripts/migrate-reviews.ts` — **RULAT 2026-05-19**: a migrat 12 recenzii din `data/reviews.json` → `data/reviews/*.json` via GitHub API
- **Interface `ReviewJson`:** `{ id, name, rating, text, status, createdAt, publishedAt?, profilePhotoUrl?, deleted? }`
- **Foto profil:** max 2MB, mime must start `image/`; resize 400×400 `inside` withoutEnlargement; WebP q85
- **Rate limit submit:** 3 recenzii / IP / oră (in-memory Map)

### SEO / Metadata

- `components/Seo.tsx` — prop `structuredData` pentru JSON-LD SSR; `og:image:type` auto-derivat; prop `twitterCreator`; canonical omis când `noindex=true`; `max-image-preview:large` pe paginile indexate; `og:image:secure_url` emis alături de `og:image`
- `lib/pageMeta.ts` — metadata + description per pagină (7 rute inclusiv `/reviews`)
- `lib/url.ts`
- `lib/seo/menuJsonLd.ts` — apelat doar din `pages/meniuri/[slug].tsx`; parametri opționali: `pageUrl` (URL absolut pagină) și `toAbsoluteImage` (callback absolutizare imagine)
- `lib/config.ts` — `CONTACT.geo` cu `lat`/`lng` GPS; `absoluteUrl()` aliniată trailing slash cu `canonical()`; `THEME.pwaThemeColor` marcat `@deprecated`; `IS_DEV` constant module-level
- `pages/robots.txt.ts`, `pages/sitemap*.ts`
- `pages/api/og.tsx` — unealtă internă, nu apelată din pagini
- OG images statice pre-generate: `public/images/og.jpg`, `og-servicii.jpg`, `og-galerie.jpg`, `og-contact.jpg`, `og-blog.jpg`, `og-cort.jpg`, `og-reviews.jpg`
- Pentru regenerare OG: `npm run generate:og` (necesită `npm run dev` pe `:3000`) — 7 pagini înregistrate (inclusiv `/reviews`)
- `public/llms.txt` — index AI crawlere; `public/llms-full.txt` — versiunea extinsă cu meniuri detaliate, blog, recenzii, FAQ (creat 2026-05-20 PR #141)
- `public/logo-dedicat.png` — logo PNG dedicat JSON-LD `LocalBusiness`; trackat în git

### KonceptID Billing

- `types/konceptid.ts` — `ContractJson` (plan, prețuri, status, IDs Stripe, `billingCycle`, `paymentLink*`) + `InvoiceJson` (amount, status, PDF URL, timestamps)
- `data/konceptid/contract.json` — contract activ; creat/editat manual; câmpuri: `clientName`, `plan`, `priceMonthly`, `currency`, `startDate`, `nextBillingDate`, `stripeCustomerId`, `stripeSubscriptionId`, `stripeProductId`, `stripePriceId`, `paymentMethod`, `status`, `billingCycle` (`"monthly"|"biannual"|"annual"`), `paymentLinkMonthly`, `paymentLinkBiannual`, `paymentLinkAnnual`
- `data/konceptid/invoices/` — fișiere JSON individuale (`invoice-{ts}.json`); create automat de webhook Stripe la `invoice.paid`; câmpuri: `id`, `stripeInvoiceId`, `amount`, `currency`, `status`, `dueDate`, `paidAt`, `invoicePdfUrl`, `hostedInvoiceUrl`, `createdAt`
- `pages/api/konceptid/stripe-webhook.ts` — **PUBLIC** (fără `verifyAdminSession`); `bodyParser: false`; verificare semnătură via `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`; handler `invoice.paid` → `createFile()` în `data/konceptid/invoices/`; răspunde `200 { received: true }` la orice alt event type
- `pages/admin/konceptid.tsx` — SSR; `getFile("data/konceptid/contract.json")` + `listFiles("data/konceptid/invoices")` în `Promise.all`; empty state când `contract.json` lipsește; afișează contract + link „↓ Descarcă contract" (`contractDownloadRow` în grid, `gridColumn: 1/-1`); calcul zile: countdown spre `startDate` dacă `invoices.length === 0`, spre `nextBillingDate` dacă există facturi; buton „Plătește acum" (paymentLink derivat din `billingCycle`); secțiune „Planuri disponibile" (3 carduri cu badge plan curent + discount); tabel facturi cu link PDF
- `styles/admin/konceptid.css.ts` — stiluri Vanilla Extract: `contractCard` (grid 2col → 1col sub 540px), `contractDownloadRow` (`gridColumn: 1/-1`, `borderTop`), `downloadContractLink`, `billingCard`, `payNowBtn`, `plansGrid` (3col → 1col sub 640px), `planCard`/`planCardActive`, `planCurrentBadge`, `planName`/`planPrice`/`planPer`/`planDiscount`/`planBtn`/`planBtnActive`, `invoiceRow` (grid 4col → 2col sub 540px), `statusBadge`, `invoicePaid`/`invoiceUnpaid`, `downloadLink`
- `data/konceptid/contract_ZE.pdf` — contract PDF trackat în git; accesibil via raw GitHub URL; link afișat în cardul contract din admin
- **`data/konceptid/.gitkeep` și `data/konceptid/invoices/.gitkeep`** trebuie să existe în repo înainte de primul webhook — `createFile()` eșuează dacă directorul nu există în Git
- **Webhook nu are sesiune admin** — securitatea e exclusiv prin semnătura Stripe (`STRIPE_WEBHOOK_SECRET`); nu apela `verifyAdminSession` pe această rută
- **`contract.json` lipsă → empty state elegant** — `getServerSideProps` returnează `{ contract: null, invoices: [] }` la orice eroare GitHub API (inclusiv 404)

### Shell / Theme / Layout

- `components/Layout.tsx`
- `styles/theme.css.ts`, `styles/theme.global.css.ts`, `styles/globals.css`
- `components/ThemeSwitcher.tsx`
- `components/pwa/` — InstallAppButton, PwaInstallCta, ServiceWorkerRegister

---

## 8. Ce este deschis / în lucru

**~~Billing KonceptID — șterge factură CSS, IDs reale, filtru webhook~~ ✓ ÎNCHIS 2026-06-13** (PR #160, branch fix/ZE-160-billing-fix)
- `data/konceptid/invoices/invoice-1781052797383.json` — șters din GitHub (factură FraternitaCSS 150 RON, ruxir24@gmail.com, apărută din cauza că ambele webhook-uri sunt pe același cont Stripe)
- `data/konceptid/contract.json` — actualizat cu IDs Stripe reale: `stripeCustomerId: "cus_UbdBbGgJOEBBIW"`, `stripeSubscriptionId: "sub_1TcPvqCETXWN5MbT4RPLelMQ"`, `stripeProductId: "prod_UYbaRkUWgXiofo"`, `stripePriceId: "price_1TZUN7CETXWN5MbTK6iM6NWb"` (înlocuiesc placeholder-urile `*_test`)
- `pages/api/konceptid/stripe-webhook.ts` — filtru adăugat după `constructEvent()`: dacă `invoice.customer !== STRIPE_CUSTOMER_ID` (env var), returnează `200 { received: true }` fără a salva; previne poluarea cross-client când mai multe site-uri sunt pe același cont Stripe
- `.env.local` — adăugat `STRIPE_CUSTOMER_ID=cus_UbdBbGgJOEBBIW` (de adăugat și în Vercel env vars)
- **Cauza root:** Stripe trimite `invoice.paid` la TOATE endpoint-urile înregistrate pe cont; fără filtru, ZephiraEvents salva și facturile CSS

**~~Admin sidebar fixed + layout fix~~ ✓ ÎNCHIS 2026-05-21** (commit `d87e65b` direct pe `main`)
- `styles/admin/layout.css.ts` — `sidebar`: `position: "relative"` → `position: "fixed"`, `top: 0`, `left: 0`, `zIndex: 100`, `height: "100vh"`, `overflowY: "auto"`; sidebar nu mai scrollează odată cu conținutul, rămâne fix pe tot ecranul
- `styles/admin/layout.css.ts` — `main`: adăugat `marginLeft: "232px"` global + `marginLeft: 0` pe `@media max-width: 767px`; compensează spațiul ocupat de sidebar-ul fixed
- `styles/admin/layout.css.ts` — mobil (`max-width: 767px`): `sidebar` păstrează `zIndex: 300` și `transform: translateX(-100%)` din media query; `overflow: visible` pentru tab-ul de deschidere

**~~KonceptID — contract link în grid + sidebar maxHeight~~ ✓ ÎNCHIS 2026-05-21** (commit `ca71d91` direct pe `main`)
- `pages/admin/konceptid.tsx` — linkul „↓ Descarcă contract" mutat din afara `contractCard` în interiorul grid-ului, învelit în `contractDownloadRow` (ocupă toată lățimea via `gridColumn: 1/-1`)
- `styles/admin/konceptid.css.ts` — export `contractDownloadRow` adăugat
- `styles/admin/layout.css.ts` — `sidebar`: `height: "100vh"` → `maxHeight: "100vh"` (ulterior revenit la `height: "100vh"` și `position: fixed` în `d87e65b`)

**~~KonceptID polish — zile prima factură, contract PDF, test invoice~~ ✓ ÎNCHIS 2026-05-21** (PR #159, branch feat/konceptid-polish)
- `pages/admin/konceptid.tsx` — logică `targetDate`: `startDate` dacă `invoices.length === 0`, `nextBillingDate` dacă există facturi; label dinamic „zile până la prima factură" / „zile rămase până la următoarea factură"; link „↓ Descarcă contract" adăugat (raw GitHub URL)
- `styles/admin/konceptid.css.ts` — export `downloadContractLink` adăugat
- `data/konceptid/invoices/invoice-1779365778075.json` — șters (factură de test Stripe CLI, 20 USD)
- `data/konceptid/contract_ZE.pdf` — trackat în git (`38b4f78`)

**~~KonceptID — planuri multiple + Payment Links~~ ✓ ÎNCHIS 2026-05-21** (PR #158, branch feat/konceptid-payment-links)
- `types/konceptid.ts` — `ContractJson` extins cu `billingCycle: "monthly"|"biannual"|"annual"` + `paymentLinkMonthly`, `paymentLinkBiannual`, `paymentLinkAnnual`
- `data/konceptid/contract.json` — câmpurile noi adăugate cu valori reale (Stripe Payment Links)
- `pages/admin/konceptid.tsx` — buton „Plătește acum" în `billingCard` (paymentLink selectat din `billingCycle`); secțiune „Planuri disponibile" cu 3 carduri (Lunar 200 RON / Bianual 183 RON −8% / Anual 166 RON −17%); badge „Plan curent" pe planul activ; `planBtnActive` pe butonul planului curent
- `styles/admin/konceptid.css.ts` — 11 exporturi noi: `payNowBtn`, `plansGrid`, `planCard`, `planCardActive`, `planCurrentBadge`, `planName`, `planPrice`, `planPer`, `planDiscount`, `planBtn`, `planBtnActive`

**~~KonceptID Billing — Stripe webhook + dashboard~~ ✓ ÎNCHIS 2026-05-21** (PR #156, branch feat/konceptid-billing)
- `types/konceptid.ts` creat — `ContractJson` + `InvoiceJson`
- `pages/api/konceptid/stripe-webhook.ts` creat — `bodyParser: false`, `getRawBody()` helper, verificare semnătură Stripe, handler `invoice.paid` → `createFile()` în `data/konceptid/invoices/invoice-{Date.now()}.json`
- `pages/admin/konceptid.tsx` creat — SSR cu `getFile(contract.json)` + `listFiles(invoices/)` în `Promise.all`; empty state când contract lipsește; calcul `daysLeft` până la `nextBillingDate`; tabel facturi cu `invoicePdfUrl`
- `styles/admin/konceptid.css.ts` creat — `contractCard`, `billingCard`, `billingDays`, `invoiceRow`, `statusBadge`, `invoicePaid`/`invoiceUnpaid`, `downloadLink`
- `components/admin/AdminLayout.tsx` — `IconKonceptID` SVG + intrare `KonceptID` adăugată la finalul `NAV`
- `package.json` — `stripe ^22.1.1` adăugat (era deja în `node_modules`)
- **Fix aplicat:** `createFile()` din `lib/admin/github.ts` acceptă 2 argumente (path + content) — mesajul de commit e generat intern; al treilea argument a fost eliminat

**~~Admin sidebar tab mobil — înlocuiește hamburger~~ ✓ ÎNCHIS 2026-05-21** (PR #154, branch feat/admin-sidebar-tab)
- `components/admin/AdminLayout.tsx`: buton hamburger eliminat; `sidebarTab` adăugat la finalul `<aside>` — toggle open/close cu săgeată SVG direcțională (18×18, viewBox 12×12); `aria-label` dinamic
- `styles/admin/layout.css.ts`: `hamburger` export șters; `sidebarTab` adăugat — `position: absolute`, `right: -28px`, `width: 28px`, `height: 56px`, `backgroundColor: vars.color.primary`, `borderRadius: 0 56px 56px 0`; `sidebar` — `position: sticky` → `position: relative` + `overflow: visible` pe mobil (tab-ul nu e clipped); `main` mobil — `padding-top: 68px` → `24px`

**~~Admin dashboard — pagină de primire cu statistici live~~ ✓ ÎNCHIS 2026-05-21** (PR #153, branch feat/admin-dashboard)
- `pages/admin/index.tsx` creat — dashboard SSR cu 4 carduri (Inbox / Recenzii / Meniuri / Blog); `getServerSideProps` cu `Promise.all` dublu-nivelat: `listFiles("data/messages")` + `listFiles("data/reviews")` în paralel (nivel 1), `getFile` per fișier în paralel per secțiune (nivel 2); meniuri + blog din fs local (zero GitHub API calls)
- `styles/admin/dashboard.css.ts` creat — `grid` (2 col mobil → 4 col ≥640px, carduri aceeași înălțime), `card`, `cardLink`, `cardTitleRow`, `cardIcon`, `statNumber`, `statLabel`, `statSecondary`, `welcome`, `welcomeLogo`, `welcomeGreeting`, `welcomeName`
- `pages/admin/login.tsx` — redirect după autentificare schimbat din `/admin/inbox` în `/admin`
- `components/admin/AdminLayout.tsx` — brand `<div>` înlocuit cu `<Link href="/admin">` (click navighează spre dashboard, închide sidebar pe mobil)
- `styles/admin/layout.css.ts` — `brand`: adăugat `textDecoration: "none"`, `cursor: "pointer"`

**~~Admin fieldRow responsive mobil~~ ✓ ÎNCHIS 2026-05-21** (PR #151, branch fix/admin-fieldrow-mobile)
- `styles/admin/menus.css.ts` și `styles/admin/blog.css.ts`: `fieldRow` extins cu `@media (max-width: 540px) { gridTemplateColumns: "1fr" }` — câmpurile formularelor admin se stivuiesc vertical pe ecrane mici

**~~Admin butoane Șterge uniformizare + iconițe nav~~ ✓ ÎNCHIS 2026-05-20** (PR #150, branch fix/admin-delete-buttons)
- `vars.color.danger` token adăugat în `styles/theme.css.ts` (light: `#dc2626`, dark: `#f87171`)
- `deleteBtn` centralizat în `styles/admin/layout.css.ts`; paginile admin folosesc `lay.deleteBtn` în loc de clase locale
- `styles/admin/menus.css.ts`, `styles/admin/blog.css.ts`: `deleteBtn` local șters
- `styles/admin/sent.css.ts`: șters (fișier orfan — `sent.tsx` nu există)
- `pages/admin/reviews.tsx`: buton Șterge folosea eronat clasa `rejectBtn` — corectat la `s.deleteBtn`
- `styles/admin/inbox.css.ts`: `deleteBtn` mutat la `position: absolute` (top-right în card); `itemWrap` cu `position: relative`
- `components/admin/AdminLayout.tsx`: iconițe SVG inline (currentColor) adăugate în fiecare item din nav; gap uniform pe `navLink`, `marginLeft: auto` pe `navBadge`

**~~Contact page polish~~ ✓ ÎNCHIS 2026-05-20** (PR #148, branch fix/contact-polish)
- Secțiunea Ofertă: `<IntroSection>` extern + `<OfferRequest hideHeading />`; eliminat titlul duplicat din formular
- Secțiunea Hartă: `<IntroSection>` cu adresa completă (incl. cod poștal) + buton „Vezi locația exactă" ca `children`; `ContactMapAddress` eliminat din pagină
- `components/forms/OfferRequest.tsx`: prop `hideHeading?: boolean` adăugat
- `components/sections/contact/FormContact.tsx`: imagine locație adăugată în coloana dreaptă (`locationImg`)
- `pages/contact.tsx`: `mapsUrl` calculat local din `addressLine`; import `ContactMapAddress` eliminat

**~~Admin meniuri CRUD via GitHub API~~ ✓ ÎNCHIS 2026-05-20** (PR #142, branch feature/admin-menus)
- `data/menus.json` migrat → 17 fișiere `data/menus/*.json` individuale (one-shot via `scripts/migrate-menus.mjs`)
- `data/menus-index.json` generat la prebuild (`scripts/build-menus-index.mjs`) — client-safe, fără deleted
- `lib/menus.ts` rescris pur (client-safe); `lib/menus.server.ts` creat (fs + GitHub API, server-only)
- `lib/menus.public.ts` actualizat să importe `menus-index.json` în loc de `menus.json`
- `types/menu.ts`: adăugat `deleted?: boolean` pe `Menu`
- `pages/servicii.tsx`: migrat la `getStaticProps` + `getAllMenus()` din `lib/menus.server.ts`
- `components/sections/MenuOffers.tsx`: eliminat import `getAllMenus` (nu mai apelează fs din componentă)
- Pagini admin noi: `pages/admin/menus/index.tsx`, `new.tsx`, `[slug].tsx`
- API routes admin noi: `pages/api/admin/menus/index.ts` (GET fs / POST GitHub API), `[slug].ts` (GET fs / PATCH GitHub API)
- `styles/admin/menus.css.ts`: stiluri Vanilla Extract pentru toate paginile admin meniuri
- `components/admin/AdminLayout.tsx`: adăugat „Meniuri" în sidebar nav
- **Principiu aplicat:** GET = fs local (rapid, fără GitHub API rate limit); WRITE = GitHub API (persistență în `main`)

**~~Reviews — migrare persistență Supabase → GitHub API~~ ✓ ÎNCHIS 2026-05-19** (PR #131)
- `pages/reviews.tsx`: nu mai citește din Supabase; folosește `listFiles`/`getFile` din `lib/admin/github.ts`
- `pages/api/admin/reviews/index.ts`: citire recenzii via GitHub API
- `pages/api/admin/reviews/[id].ts`: moderare via `getFile`/`updateFile` GitHub API
- Supabase `reviews` table rămâne în schemă dar nu mai e folosit pentru recenzii

**~~Reviews — foto profil, soft delete, migrare date~~ ✓ ÎNCHIS 2026-05-19** (PR #133)
- `lib/admin/github.ts`: adăugat `uploadImage()` pentru upload fișiere binare (imagini) în Git
- `pages/api/admin/reviews/[id].ts`: acțiune nouă `delete` — setează `deleted: true` în JSON via GitHub API
- `pages/admin/reviews.tsx`: buton „🗑 Șterge" pe fiecare recenzie, cu `confirm()`; handleAction acceptă `"delete"`
- `pages/api/review-submit.ts`: procesare foto opțională cu `sharp` (resize 400×400, WebP q85) + upload via `uploadImage()`; câmpuri Zod noi: `photoBase64`, `photoMime`, `photoFilename`
- `components/sections/reviews/ReviewsForm.tsx`: limită foto actualizată 2MB; hint actualizat
- `pages/reviews.tsx`: filtrare `!r.deleted` + mapping `profilePhotoUrl`
- `scripts/migrate-reviews.ts`: RESCRIS — nu mai migrează în Supabase, ci în `data/reviews/*.json` via GitHub API
- **Migrare rulată 2026-05-19**: 12 recenzii din `data/reviews.json` → `data/reviews/` (12 fișiere JSON)
- `ReviewJson` interface: extins cu `profilePhotoUrl?` și `deleted?`

**~~Assets media WebP/MP4 nativ~~ ✓ ÎNCHIS 2026-05-19** (branch feat/webp-webm-native, issue #128)
- 124 fișiere JPG/PNG convertite la WebP cu `sharp` one-shot; originalele șterse
- Toate referințele actualizate în cod, JSON data, `data/reviews/*.json`
- `scripts/build-gallery.mjs`: `IMG_EXT` → doar `.webp`/`.avif`; `lib/gallery.data.ts` regenerat
- `scripts/optimise-images.mjs` rescris: utilitar selectiv WebP→WebP
- `scripts/optimise-videos.mjs` rescris: utilitar selectiv MP4→MP4 (H.264 CRF 28)
- VP9/WebM abandonat: re-encodare pe H.264 CRF 28 pre-comprimat produce fișiere +60% mai mari
- Excepții documentate: `og*.jpg`, `icons/*.png`, favicon, `logo-dedicat.png`

**~~PWA generated files — .gitignore~~ ✓ ÎNCHIS 2026-05-19**
- `.gitignore` actualizat: adăugate `public/sw.js`, `public/workbox-*.js`, `public/fallback-*.js` (generate de next-pwa la build, nu se commitează)

**~~SEO audit complet — robots, sitemaps, config, JSON-LD, llms.txt~~ ✓ ÎNCHIS 2026-03-31** (PR #125, branch fix/robots-sitemap-optimizations)
- `robots.txt`: `Disallow: /admin/` adăugat; `Allow: /` redundant eliminat
- `sitemap-gallery.xml`: `lastmod` = `buildTimestamp`; `changefreq: monthly`
- `sitemap-posts.xml`: `xmlns:image` duplicat eliminat din `imageEntry`
- `sitemap-pages.xml`: `/cookie-policy` adăugat (priority 0.3, yearly)
- `sitemap-menus.xml`: image sitemap extension (`xmlns:image`, `<image:image>` per meniu)
- `next.config.mjs`: `trailingSlash: false` explicit
- `lib/config.ts`: `absoluteUrl()` aliniată trailing slash; `CONTACT.geo` centralizat; `seoDefaults` alias eliminat; `export { SITE_URL }` eliminat; `THEME.pwaThemeColor` `@deprecated`; `IS_DEV` constant; `GALLERY_ATTACH_LIMIT` mutat în sitemap-gallery; JSDoc pe `assetUrl`/`absoluteAssetUrl`
- `components/Seo.tsx`: `og:image:type` auto-derivat; `og:image:secure_url`; `twitter:creator` prop; `max-image-preview:large`; canonical omis când `noindex=true`
- `pages/index.tsx`: `LocalBusiness` + `WebSite` JSON-LD complete (sameAs, geo, ore, logo)
- `pages/reviews.tsx`: `LocalBusiness` completat (`@id`, telephone, image, address)
- `pages/blog/[slug].tsx`: `dateModified` real + `twitterCreator` din `post.author`
- `pages/meniuri/[slug].tsx`: URL absolut + imagine absolutizată în `buildMenuJsonLd`
- `pages/_document.tsx`: favicon declarat explicit (32×32, 16×16, shortcut)
- `public/llms.txt`: creat (llms.txt standard pentru AI crawlere)
- `public/logo-dedicat.png`: trackat în git
- `public/llms-full.txt` creat (2026-05-20, PR #141) — versiunea extinsă cu conținut complet

**~~Gmail sync (înlocuire IMAP)~~ ✓ ÎNCHIS 2026-03-23** (PR #116)
`lib/admin/imap.ts` șters; `lib/admin/gmail.ts` creat — Gmail API OAuth2 (`googleapis`), listează UNREAD in:inbox max 50. **Înlocuit complet cu IMAP via Supabase Edge Function (PR feature/supabase-imap-sync, 2026-03-24).**

**~~Gmail → IMAP via Supabase Edge Function~~ ✓ ÎNCHIS 2026-03-24** (branch feature/supabase-imap-sync)
`lib/admin/gmail.ts` șters; `supabase/functions/sync-imap/index.ts` creat — Edge Function Deno, `npm:imapflow`, IMAP SSL 993, UNSEEN INBOX, deduplicare după `metadata.message_id`, insert `email_inbound`, marchează citit. `supabase/migrations/004_pg_cron_sync.sql` — pg_cron job 10 min. `/api/admin/imap-sync.ts` — apelează Edge Function via fetch. Variabile Gmail eliminate din `.env.local`; adăugate `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`.

**~~Admin hardening-1~~ ✓ ÎNCHIS 2026-03-23** (PR #117)
- XSS: `lib/admin/sanitize.ts` creat; `sanitizeHtml()` aplicat în toate paginile admin via `dangerouslySetInnerHTML`
- `Promise.all` în `reply.ts` → două try/catch independente; returnează `{ ok: true, dbWarning: true }` dacă DB fail după email trimis
- `saveToDb()` în `compose.ts` aruncă la eroare Supabase; gestionat cu try/catch
- Soft delete în inbox: verifică `res.ok` după PATCH; afișează `deleteError` în UI

**~~Admin hardening-2~~ ✓ ÎNCHIS 2026-03-23** (PR #118)
- Paginare inbox: SSR, 50/pagină, buton Anterior/Următor; SELECT coloane specifice (fără `*`)
- GA4 client singleton: `_ga4Client` module-level, creat o singură dată per proces
- `sent.tsx` SSR: 3 query-uri → `Promise.all([emailResult, replyResult, unreadResult])` paralel

**~~Admin hardening-3~~ ✓ ÎNCHIS 2026-03-23** (PR #119)
- Rate limiting `/api/admin/login`: in-memory Map per IP, 5 fail/15min → 429; reset la succes
- `rememberMe`: `Boolean(body.rememberMe) === true` (cast explicit, elimină edge case truthy)
- GA4 timeout: `withTimeout(8000ms)` pe `runRealtimeReport()` și `Promise.all([...runReport])`
- `types/admin.ts`: `SentKind` + `SentItem` centralizate — importate în API route + pagini
- `lib/admin/response.ts`: `okResponse()` / `errorResponse()` uniform în toate API routes admin
- Client pages `inbox/[id]` + `compose`: `data.message` → `data.error`

**~~Dashboard admin /admin cu Supabase~~ ✓ ÎNCHIS 2026-03-23**
Complet: autentificare HMAC cookie-based, inbox cu IMAP sync, reply/compose email, moderare recenzii, analytics GA4 (realtime + raport 30 zile cu Recharts). PR #admin-dashboard.

**~~Admin improvements~~ ✓ ÎNCHIS 2026-03-23** (branch feature/admin-improvements)
- SMTP TLS: `rejectUnauthorized: false` pe toate cele 4 transporturi (smtp.ts, contact, offer-request, review-submit)
- Pagina Trimise `/admin/sent`: union `composed_emails` + `admin_replies` cu badge Reply/Nou, SSR, session check
- Soft delete: migrație 003, buton coș pe inbox + sent, filtru `deleted_at IS NULL`, PATCH `{ action: "delete" }`
- PWA admin: `public/admin-manifest.json` (scope /admin/), `public/admin-sw.js` (network-first), manifest link în login + AdminLayout

**~~Accessibility 93 → 100~~ ✓ ÎNCHIS 2026-03-22**
Complet: ARIA `role="menuitem"` pe copiii direcți ai `role="menu"` în submeniul Servicii desktop (`components/Header.tsx`); `role="region"` pe benzile de recenzii cu `aria-label` (`components/sections/reviews/Reviews.tsx`); HeaderPanel glassmorphism per temă — light: `rgba(255,255,255,0.82)` + `blur(16px) saturate(1.4)`, dark: `rgba(15,15,28,0.85)` + `blur(16px) saturate(1.2)` (`styles/header.css.ts`). PR #110.

**~~Contact — verificare producție~~ ✓ ÎNCHIS 2026-03-22**
Complet: validare Zod (`lib/validation/contact.ts`), câmp telefon opțional, checkbox GDPR explicit, email template include telefonul dacă e completat. SMTP + reCAPTCHA + autoreply confirmate funcționale. PR #109.

**~~Offer Request — business rules finale~~ ✓ ÎNCHIS 2026-03-22**
Complet: validare Zod completă (`lib/validation/offerRequest.ts`), câmpuri condiționale validate server-side (rooms/nights când lodging=oferta), `eventType` non-opțional în `EmailData`, ramura defensivă eliminată, `.env.local` curățat (KV/Blob/Redis șters, `NEXT_PUBLIC_SITE_URL` = `https://zephiraevents.ro`). PR #109.

**~~TBT mobil — recalibrare Lighthouse~~ ✓ ÎNCHIS**
Rezolvat anterior: motion cache module-level, `ReducedMotionProvider` global, `ArcGallery` lazy, cookie batching, lightbox CSS scoped.

**~~SEO fin — structured data, meta descriptions, canonical~~ ✓ ÎNCHIS 2026-03-21**
Complet: `/reviews` (`<Seo>`, H1, JSON-LD LocalBusiness+AggregateRating, `og-reviews.jpg`), `/meniuri/[slug]` (JSON-LD SSR `@type: Menu`, description reală, headings semantice), homepage + galerie (descriptions dedicate), `/blog` (url normalizat), `pageMeta.ts` (câmp `description`, `/reviews` adăugat), `JsonLd.tsx` șters, `buildMenuJsonLd` eliminat din componente client-side. PR #107.

**~~Headings audit și fix complet~~ ✓ ÎNCHIS 2026-03-21**
Complet: H1 lipsă pe `/reviews` adăugat + centrat; coliziuni H1/H2 rezolvate pe `/contact` și `/cort`; `ServiciiComplete` — `<h2>` gol eliminat (condiționat), `aria-labelledby` orfan fixat; duplicate H2 responsive (`MenusIntro`, `WaiterBarSection`, `CateringSection`) — `aria-hidden="true"` pe varianta mobilă; `/meniuri/[slug]` — titluri secțiuni meniu din `<div>` în `<h2>`; `RelatedPosts` — `<h3>` → `<h2>`; `lib/blogData.ts` — heading shift H1–H5 +1 nivel în `sanitizeBasic`; `getRelatedByTags()` activ pe `/blog/[slug]`. PR #107.

**~~Sitemap audit~~ ✓ ÎNCHIS 2026-03-21**
Complet: `sitemap-menus.xml` creat (17 pagini `/meniuri/[slug]`, priority 0.8, changefreq monthly); `robots.txt` — `Disallow: /api/`, `/404`, `/500`, `/_offline` adăugate explicit; `lastmod` înlocuit cu `NEXT_PUBLIC_BUILD_TIMESTAMP` injectat în `next.config.mjs` (fix per build, nu per request); `changefreq` diferențiat: `weekly` (`/`, `/blog`), `monthly` (servicii, contact, cort, reviews), `yearly` (`/marca`); `priority` diferențiat: 1.0 (`/`), 0.8 (servicii, contact, blog), 0.7 (cort, reviews), 0.5 (`/marca`); `/galerie` scos din `STATIC_ROUTES` — acoperită exclusiv de `sitemap-gallery.xml` (cu imagini). PR #108.

## 8a. Scripturi

```
~~scripts/gmail-auth.mjs~~ — șters (2026-03-24): nu mai e necesar; sync via IMAP Edge Function

scripts/build-menus-index.mjs
  Generează data/menus-index.json din data/menus/*.json.
  Filtru: exclude deleted. Output: [{slug, title, eventType}] — 17 intrări.
  Rulat automat la prebuild (npm run build).

scripts/migrate-menus.mjs
  One-time migration: data/menus.json → data/menus/*.json.
  RULAT 2026-05-20 — 17 meniuri migrate. NU rula din nou.
  Standardizează felPrincipal → string[], adaugă deleted: false.

scripts/migrate-reviews.ts
  One-time migration: data/reviews.json → data/reviews/*.json via GitHub API.
  RULAT 2026-05-19 — 12 recenzii migrate cu succes.
  NU mai migra în Supabase (fostul comportament); acum scrie JSON-uri individuale în Git.
  Necesită: GITHUB_PAT, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH în env.

scripts/generate-og.mjs
  Generează OG images statice (Puppeteer, 1200×630 JPEG q95) pentru 7 pagini + 2 PWA screenshots.
  Pagini: /, /servicii, /galerie, /contact, /blog, /cort-evenimente-la-locatia-ta, /reviews
  Rulare: npm run generate:og
  Necesită: npm run dev activ pe portul 3000

scripts/optimise-images.mjs
  Comprimă JPEG-urile din public/images/ cu sharp (MozJPEG).
  Calități: q82 pentru hero/blog, q80 pentru galerie/meniuri/motivationcards.
  Re-run safe: fișierele deja procesate (backup în _originals/) sunt sărite automat.
  Rulare: npm run optimise:images
  Notă: PNG-urile din servicii/servicii/ sunt excluse de la recomprimare.

scripts/optimise-videos.mjs
  Recomprimă MP4-urile din public/videos/ cu ffmpeg.
  Codec: libx264, CRF 28, preset slow, fără audio (-an), faststart.
  Re-run safe: fișierele deja procesate (backup în _originals/) sunt sărite automat.
  Rulare: npm run optimise:videos
  Necesită: ffmpeg instalat și accesibil în PATH.
  VIDEO-URILE AU FOST OPTIMIZATE în sesiunea din 2026-03-20:
  reducere ~64.5% (≈50 MB → ≈17.8 MB) — 10 fișiere procesate.
```

---

## 10. Performance & Optimizări

### Lighthouse scores (ultima măsurătoare)

- Desktop: Performance 99, Accessibility 93, Best Practices 96, SEO 100
- Mobil: în calibrare — optimizările TBT necesită revizie în sesiune viitoare

### Ce s-a optimizat

- OG images → statice pre-generate (zero CPU runtime)
- Reviews → GitHub API SSR (JSON files în git, fără DB round-trip)
- Imagini convertite la **WebP nativ** (2026-05-19, 124 fișiere JPG/PNG → WebP q80/q90 cu sharp); `og*.jpg` rămân JPG; icon/favicon/screenshot rămân PNG; reducere totală ~11% pe imagini convertite (câștig real pe PNG → WebP: ~80%)
- Video-uri comprimate cu ffmpeg H.264 CRF 28 -preset slow (reducere ~64% față de surse raw); MP4 rămân format final — VP9/WebM abandonat (re-encodarea produce fișiere mai mari pe conținut pre-comprimat CRF 28)
- Hero și TentBanner → video responsive (desktop 1920×1080, mobil 854×480)
- LCP fix — preload manual pentru imaginea hero în `pages/index.tsx`
- TBT fix — motion cache module-level, `ReducedMotionProvider` global, `ArcGallery` lazy, cookie batching
- Lightbox CSS scoped la `pages/galerie.tsx` și `pages/cort-evenimente-la-locatia-ta.tsx`

### Assets media WebP/MP4 nativ 2026-05-19 (branch feat/webp-webm-native)

- **Imagini:** 124 fișiere JPG/PNG → WebP one-shot cu `scripts/convert-to-webp.mjs` (șters după conversie); surse noi se adaugă direct ca WebP; `scripts/optimise-images.mjs` rescris ca utilitar selectiv WebP→WebP
- **Video-uri:** rămân MP4 H.264 CRF 28; VP9/WebM abandonat — re-encodarea pe conținut pre-comprimat produce fișiere +60% mai mari; `scripts/optimise-videos.mjs` rescris ca utilitar selectiv MP4→MP4
- **Excepții documentate:** `og*.jpg` (OG social — Facebook/Twitter/WhatsApp incompatibili cu WebP); `public/icons/*.png` + `favicon*.png` + `public/screenshots/*.png` (PWA/iOS); `public/logo-dedicat.png` (JSON-LD logo)
- **`data/reviews/*.json`:** `profilePhotoUrl` actualizat `.jpg` → `.webp`; `data/reviews.json` (legacy) actualizat pentru consistență
- **`scripts/build-gallery.mjs`:** `IMG_EXT` actualizat să accepte doar `.webp` și `.avif`

### Reviews — persistență GitHub API 2026-05-19 (PR #131 + #133)

- Reviews migrate din Supabase la GitHub Contents API — fișiere JSON individuale în `data/reviews/`
- Foto profil: upload via `uploadImage()` în `public/images/profiles/`, WebP 400×400 q85
- Soft delete: câmp `deleted: true` în JSON; toate citirile filtrează `!r.deleted`
- Moderare admin: approve / reject / delete via `getFile` + `updateFile` GitHub API
- Migrare date: 12 recenzii din `data/reviews.json` → `data/reviews/*.json` (rulat 2026-05-19)

### Admin dashboard 2026-03-23 (arhivă — starea curentă diferă semnificativ)

- Auth: HMAC-SHA256 cookie httpOnly, 8h TTL, timing-safe compare (rămas)
- Supabase, GA4, Recharts, SMTP, IMAP — toate eliminate ulterior (PRs #144–#150)

### Admin hardening 2026-03-23 (PR #117–119) — elemente rămase active

- XSS defense-in-depth: `sanitizeHtml()` pe toate datele randate în admin
- Rate limiting login: 5 fail/IP/15min → 429 (in-memory Map, reset la succes)
- Format erori uniform: `errorResponse()` → `{ ok: false, error }` în toate API routes admin

### SEO audit 2026-03-21 (PR #107)

- `JsonLd.tsx` șters — era `strategy="afterInteractive"` (client-side only); JSON-LD se injectează SSR via `<Seo structuredData={[...]} />`
- `buildMenuJsonLd` eliminat din `ArcMenuGallery.lazy.tsx` și `MenuOffers.tsx` — rămâne exclusiv SSR în `pages/meniuri/[slug].tsx`
- `pageMeta.ts`: câmp `description` adăugat la `PageMeta`, `/reviews` înregistrat ca rută
- `generate-og.mjs`: `/reviews` adăugat → 7 pagini acoperite
- `/blog/[slug]`: `getRelatedByTags()` activ (înlocuiește `getAllPosts().filter().slice(0,6)`)
- `lib/blogData.ts`: `sanitizeBasic()` — heading shift H1–H5 +1 nivel (H1→H2, H2→H3 etc.) pentru conținut articole
- Toate paginile principale: canonical corect, descriptions unice, JSON-LD SSR

### Sitemap audit 2026-03-21 (PR #108)

- `sitemap-menus.xml` creat — 17 pagini `/meniuri/[slug]` acoperite (priority 0.8, changefreq monthly)
- `robots.txt` — `Disallow: /api/`, `/404`, `/500`, `/_offline` adăugate explicit
- `lastmod` — `NEXT_PUBLIC_BUILD_TIMESTAMP` injectat în `next.config.mjs` (valoare fixă per build, nu `new Date()` per request)
- `changefreq` diferențiat: `weekly` (`/`, `/blog`), `monthly` (servicii, contact, cort, reviews), `yearly` (`/marca`)
- `priority` diferențiat: 1.0 (`/`), 0.8 (servicii, contact, blog), 0.7 (cort, reviews), 0.5 (`/marca`)
- `/galerie` scos din `STATIC_ROUTES` — acoperită exclusiv de `sitemap-gallery.xml` (cu imagini)

### Forms audit 2026-03-22 (PR #109)

- Contact: validare Zod (`lib/validation/contact.ts`), câmp telefon opțional, checkbox GDPR explicit
- Offer Request: validare Zod completă cu câmpuri condiționale (rooms/nights validate când lodging=oferta), `eventType` non-opțional în `EmailData`, ramura defensivă eliminată
- `.env.local`: KV/Blob/Redis curățat (zero utilizări în cod), `NEXT_PUBLIC_SITE_URL` = `https://zephiraevents.ro`

### Accessibility + UI audit 2026-03-22 (PR #110)

- ARIA: `role="menuitem"` pe copiii direcți ai `role="menu"` (submeniu Servicii desktop)
- ARIA: `role="region"` pe benzile de recenzii (`aria-label` valid pe landmark)
- HeaderPanel: glassmorphism `blur(16px) saturate(1.4/1.2)` per temă light/dark
- Lighthouse Accessibility: 97 mobil, 92 desktop după fix

### SEO audit profund 2026-03-31 (PR #125, branch fix/robots-sitemap-optimizations)

- `robots.txt`: `Disallow: /admin/` adăugat; `Allow: /` eliminat
- Sitemaps: image extension în menus; `buildTimestamp` consistent în gallery; `xmlns:image` deduplificat în posts; `/cookie-policy` în pages sitemap
- `lib/config.ts`: trailing slash aliniat între `absoluteUrl()` și `canonical()`; `CONTACT.geo` centralizat; alias-uri moarte eliminate
- `Seo.tsx`: `og:image:type` auto-derivat; `og:image:secure_url`; `twitter:creator`; `max-image-preview:large`; canonical omis la `noindex=true`
- JSON-LD complet: `LocalBusiness` cu geo/address/telephone/sameAs pe homepage și reviews; `WebSite` + `SearchAction` pe homepage; `dateModified` în BlogPosting; imagini absolute în meniu
- `public/llms.txt` creat și îmbunătățit; `public/logo-dedicat.png` trackat în git
- `public/llms-full.txt` creat (2026-05-20, PR #141) — versiunea extinsă cu toate meniurile, blog, recenzii, FAQ

---

## 9. Ce să nu faci

- Nu transforma proiectul în booking engine sau admin panel suplimentar — dashboard-ul admin e complet
- Nu re-adăuga Supabase, SMTP, Recharts, GA4 sau IMAP — toate au fost eliminate definitiv; persistența e exclusiv via GitHub Contents API
- Nu adăuga un `deleteBtn` local în paginile admin — folosește `lay.deleteBtn` din `styles/admin/layout.css.ts`
- Nu hardcoda culori roșii pentru ștergere (`#dc2626`, `rgba(220,38,38,...)`, etc.) — folosește `vars.color.danger` din theme
- Nu importa `lib/blog.server.ts` din componente client sau pagini fără `getStaticProps`/`getServerSideProps` — conține `import fs` și va cauza eroare în bundle-ul client
- Nu hardcoda conținut care are deja structură data-driven (`data/menus/`, `data/gallery.json`)
- Nu pune inline styling permanent — Vanilla Extract pentru tot
- Nu omite `immediate` pe `<Appear>` când wrappezi grid-uri sau galerii
- Nu înfășura `<Hero>` în `.section` sau `.container` — strică full-bleed
- Nu adăuga scripturi noi în `package.json` fără să stergi cele devenite inutile
- Nu face `git push --force` pe `main`
- Nu sări peste `typecheck + lint + build` înainte de commit
- Nu folosi `JsonLd.tsx` — a fost șters; JSON-LD se adaugă exclusiv via prop `structuredData` pe `<Seo>`
- Nu injecta `buildMenuJsonLd` (sau orice JSON-LD) din componente client-side — doar din `getStaticProps` / `getServerSideProps` în pagini
- Nu returna erori cu `{ ok: false, message }` în API routes admin — folosește `errorResponse()` din `lib/admin/response.ts` care produce `{ ok: false, error }`
- Nu randa conținut din Git/DB în admin fără `sanitizeHtml()` — orice `dangerouslySetInnerHTML` trebuie trecut prin `sanitizeHtml()`
- Nu rula `scripts/migrate-reviews.ts` din nou — a fost rulat 2026-05-19 și `data/reviews/` e deja populat; o a doua rulare ar crea duplicate
- Nu rula `scripts/migrate-menus.mjs` din nou — a fost rulat 2026-05-20 și `data/menus/` e deja populat; o a doua rulare ar suprascrie modificările admin
- Nu importa `lib/menus.server.ts` din componente client sau pagini fără `getStaticProps`/`getServerSideProps` — conține `import fs` la nivel de modul și va cauza `Module not found: Can't resolve 'fs'` în bundle-ul client
- Nu folosi GitHub API pentru READ în paginile admin de meniuri — GET citește din fs local (`lib/menus.server.ts`); GitHub API exclusiv pentru WRITE (createFile, updateFile, uploadImage)
- Nu commita `client_secret_*.json` — e în `.gitignore`; conține credențiale OAuth2 Google
- Nu hardcoda coordonate GPS în pagini — folosește `CONTACT.geo.lat` / `CONTACT.geo.lng` din `lib/config.ts`
- Nu adăuga `export { SITE_URL }` sau alte alias-uri moarte în `lib/config.ts` — `SITE.url` este sursa canonică
- Nu adăuga `og:image:type` manual în pagini — se derivă automat în `components/Seo.tsx`
- Nu pune `canonical` și `noindex` simultan — `<Seo>` omite canonical automat când `noindex=true`
- Nu lăsa `public/llms.txt` desincronizat la schimbări majore (meniuri noi, pagini noi, prețuri modificate)
- Nu scrie recenzii în Supabase — Supabase a fost eliminat complet; persistența e exclusiv în Git (`data/reviews/*.json` via GitHub API)
- Nu committa `public/sw.js`, `public/workbox-*.js`, `public/fallback-*.js` — sunt generate de next-pwa la build și sunt în `.gitignore`
- Nu adăuga assets imagine în `public/images/` ca JPG sau PNG — folosește WebP; excepții: `og*.jpg` (OG social), `public/icons/*.png` (PWA), `favicon*.png`, `public/logo-dedicat.png` (JSON-LD)
- Nu adăuga video-uri în `public/videos/` ca WebM VP9 — rămân MP4 H.264; VP9 re-encodat pe H.264 CRF 28 produce fișiere mai mari (testat și abandonat 2026-05-19)
- Nu modifica `IMG_EXT` din `scripts/build-gallery.mjs` să accepte `.jpg`/`.jpeg`/`.png` — galeria e acum 100% WebP
- Nu adăuga `verifyAdminSession` pe `/api/konceptid/stripe-webhook` — ruta e publică intenționat; securitatea e prin semnătura Stripe (`STRIPE_WEBHOOK_SECRET`)
- Nu activa `bodyParser` pe `/api/konceptid/stripe-webhook` — Stripe necesită raw Buffer pentru `constructEvent()`; `export const config = { api: { bodyParser: false } }` trebuie să rămână
- Nu crea `data/konceptid/contract.json` programatic din cod — se gestionează manual sau via un script dedicat; webhook-ul scrie doar în `data/konceptid/invoices/`
- Nu șterge `data/konceptid/.gitkeep` sau `data/konceptid/invoices/.gitkeep` — `createFile()` din GitHub API eșuează dacă directorul nu există în repo
