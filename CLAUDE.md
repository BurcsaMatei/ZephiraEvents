# ZephiraEvents — CLAUDE.md

**Versiune:** v12
**Data:** 2026-03-24
**Status:** activ

---

## 1. Ce este proiectul

ZephiraEvents este un website premium de prezentare și conversie pentru o sală de evenimente din Focșani, județul Vrancea. Scopul principal este să inspire încredere, să clarifice oferta comercială (meniuri, servicii, cort extern) și să capteze lead-uri prin formulare de contact și solicitare ofertă. Proiectul este o platformă editorial-comercială — nu un booking engine sau CRM.

---

## 2. Stack

- **Framework:** Next.js 15 (Pages Router), React 19, TypeScript strict
- **Styling:** Vanilla Extract (`*.css.ts`) — fără inline styling ca standard
- **Animații:** Framer Motion, componenta `Appear` internă, `ReducedMotionProvider` — context global pentru `useReducedMotion()`
- **Mail:** Nodemailer (SMTP `mail.zephiraevents.ro`)
- **Validare:** Zod
- **Lightbox:** yet-another-react-lightbox
- **Grafice:** Recharts (`AreaChart` în dashboard admin)
- **Database:** Supabase (PostgreSQL) — `@supabase/supabase-js` service role key, server-side only
- **Analytics:** GA4 Data API — `@google-analytics/data` + service account JSON
- **Email sync:** IMAP (`imapflow` via npm specifier în Deno) — Supabase Edge Function `sync-imap`, sync UNSEEN inbox → Supabase (`email_inbound`); declanșat manual din `/admin/inbox` sau automat via `pg_cron` (10 min)
- **Deployment:** Vercel
- **PWA:** next-pwa (activ doar în producție cu `NEXT_PUBLIC_ENABLE_PWA=1`)
- **SEO:** metadata centralizată, JSON-LD, OG static pre-generat, sitemap/robots server-side
- **devDependencies notabile:** `sharp` (optimizare imagini), `puppeteer` (generare OG screenshots)

---

## 3. Structura proiectului

```
components/
  admin/               AdminLayout.tsx — sidebar nav (Inbox/Trimise/Recenzii/Compune/Analytics), logout, manifest PWA admin
                       AnalyticsChart.tsx — Recharts AreaChart (dynamic, ssr:false)
  animations/          Appear, AppearGroup — animații pe scroll/viewport; ReducedMotionProvider — context global useReducedMotion()
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
  Layout.tsx, Header.tsx, Footer.tsx, Seo.tsx, Breadcrumbs.tsx, Button.tsx, etc.
  ~~JsonLd.tsx~~ — șters (2026-03-21): era client-side only; folosește prop `structuredData` pe `<Seo>`

data/
  gallery.json         catalog imagini galerie (generat de scripts/build-gallery.mjs)
  galleryCaptions.json capțiuni galerie
  menus.json           catalog meniuri
  reviews.json         12 recenzii statice (fallback dacă Supabase nu e disponibil)

lib/
  admin/               auth.ts, supabase.ts, supabase.types.ts, smtp.ts,
                       analytics.ts, response.ts, sanitize.ts
                       ~~imap.ts~~ — șters (2026-03-23): înlocuit cu gmail.ts
                       ~~gmail.ts~~ — șters (2026-03-24): înlocuit cu supabase/functions/sync-imap/
supabase/
  functions/
    sync-imap/index.ts   Edge Function Deno — sync UNSEEN IMAP inbox → Supabase; npm:imapflow
  migrations/            001–004 (004: pg_cron job sync-imap la 10 min)
  gallery/             schema.ts — validare și tipuri galerie
  mail/                offerRequestEmail.ts — template email ofertă
  seo/                 menuJsonLd.ts — structured data meniuri
  validation/          offerRequest.ts — validare Zod pentru ofertă
  blogData.ts          helper citire articole blog (MDX/fișiere)
  config.ts            centrul de adevăr: SITE, CONTACT, THEME, SOCIAL_URLS, BASE_PATH, helpers URL
  gallery.ts / gallery.data.ts / gallery.store.ts   parsing, mapare, store galerie
  menus.ts / menus.public.ts   logică domeniu meniuri
  nav.ts               NAV, SERVICII_SUBMENU, SOCIAL — navigație centralizată
  pageMeta.ts          metadata centralizată per pagină
  reviews.ts           logică domeniu recenzii (fallback JSON static)
  url.ts, env.ts, cookies.ts, dates.ts, images.ts

pages/
  index.tsx            Homepage
  servicii.tsx         Pagina servicii
  galerie.tsx          Galerie foto
  contact.tsx          Contact + ofertă
  cort-evenimente-la-locatia-ta.tsx   Landing cort extern
  reviews.tsx          Pagina recenzii (SSR — Supabase approved, fallback JSON)
  blog/index.tsx       Blog — lista articole
  blog/[slug].tsx      Articol individual
  meniuri/[slug].tsx   Pagina dinamică meniu
  marca.tsx, cookie-policy.tsx, 404.tsx, 500.tsx, _offline.tsx
  robots.txt.ts, site.webmanifest.ts, sitemap*.ts
  admin/
    login.tsx          Login admin (cookie httpOnly, bypass Layout public, înregistrare admin-sw.js)
    inbox/index.tsx    Lista mesaje (contact + ofertă + email_inbound) + buton Gmail sync + soft delete + paginare
    inbox/[id].tsx     Detaliu mesaj + reply form
    sent.tsx           Mesaje trimise — union composed_emails + admin_replies, badge Reply/Nou, soft delete
    compose.tsx        Compune email standalone
    reviews.tsx        Moderare recenzii (approve/reject)
    analytics.tsx      Dashboard GA4 — realtime + grafic 30 zile + surse/device/țări
  api/                 (vezi secțiunea 4)

public/
  images/              current/, gallery/, blog/, motivationcards/, profiles/, servicii/
  videos/              current/, tent/
  icons/, masks/, screenshots/
  admin-manifest.json  PWA manifest dedicat admin (name: ZephiraEvents Admin, scope: /admin/)
  admin-sw.js          Service worker admin izolat — cache minimal /admin/*, network-first

scripts/
  build-gallery.mjs    generează lib/gallery.data.ts + data/gallery.json (rulat la prebuild)
  build-rss.ts         generează public/rss.xml + public/feed.xml (rulat la postbuild)
  generate-og.mjs      generează OG images statice pentru cele 6 pagini fixe (Puppeteer)
  ~~gmail-auth.mjs~~   șters (2026-03-24): nu mai e necesar — sync via IMAP Edge Function
  migrate-reviews.ts   one-time: migrează data/reviews.json → Supabase reviews table
  optimise-images.mjs  comprimă JPEG-uri din public/images/ cu sharp (MozJPEG)
  optimise-videos.mjs  recomprimă MP4-uri din public/videos/ cu ffmpeg
  project-tree.ps1     utilitar explorare structură (PowerShell)

styles/
  admin/               analytics.css.ts, compose.css.ts, inbox.css.ts, layout.css.ts,
                       login.css.ts, message.css.ts, reviews.css.ts, sent.css.ts
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

supabase/
  migrations/
    001_initial_schema.sql        messages, admin_replies, composed_emails, reviews
    002_add_email_inbound_type.sql extinde CHECK constraint type cu 'email_inbound'
    003_soft_delete.sql           adaugă deleted_at timestamptz pe messages și composed_emails

types/
  admin.ts             SentKind, SentItem — tipuri comune pentru API routes + pagini admin
  blog.ts, menu.ts, etc.
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
| `/reviews`                       | `pages/reviews.tsx`                       | Recenzii clienți (SSR — Supabase `approved`, fallback JSON static)                |
| `/blog`                          | `pages/blog/index.tsx`                    | Lista articole blog (SEO)                                                         |
| `/blog/[slug]`                   | `pages/blog/[slug].tsx`                   | Articol individual cu Hero full-bleed                                             |
| `/meniuri/[slug]`                | `pages/meniuri/[slug].tsx`                | Pagina dinamică meniu — detalii, prețuri, galerie                                 |
| `/marca`                         | `pages/marca.tsx`                         | Pagina identitate brand                                                           |
| `/cookie-policy`                 | `pages/cookie-policy.tsx`                 | Politica cookie                                                                   |

### Pagini admin (protejate — cookie httpOnly HMAC)

| Pagină                  | Fișier                           | Rol                                                            |
| ----------------------- | -------------------------------- | -------------------------------------------------------------- |
| `/admin/login`          | `pages/admin/login.tsx`          | Autentificare — email + parolă, setează cookie sesiune; înregistrează admin-sw.js |
| `/admin/inbox`          | `pages/admin/inbox/index.tsx`    | Lista mesaje (contact/ofertă/email_inbound) + Gmail sync + soft delete + paginare (50/pagină) |
| `/admin/inbox/[id]`     | `pages/admin/inbox/[id].tsx`     | Detaliu mesaj + istoricul reply-urilor + formular reply                            |
| `/admin/sent`           | `pages/admin/sent.tsx`           | Mesaje trimise — union composed_emails + admin_replies, badge Reply/Nou            |
| `/admin/compose`        | `pages/admin/compose.tsx`        | Compune email standalone (salvat în `composed_emails`)                             |
| `/admin/reviews`        | `pages/admin/reviews.tsx`        | Moderare recenzii pending — approve / reject                                       |
| `/admin/analytics`      | `pages/admin/analytics.tsx`      | Dashboard GA4: live acum + grafic 30 zile + surse/device/țări                     |

### API Routes publice

| Route                     | Fișier                       | Rol                                                                   |
| ------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| `POST /api/contact`       | `pages/api/contact.ts`       | Trimite email contact via SMTP + autoreply + salvează în Supabase     |
| `POST /api/offer-request` | `pages/api/offer-request.ts` | Procesează solicitare ofertă, trimite email + salvează în Supabase    |
| `POST /api/review-submit` | `pages/api/review-submit.ts` | Formular recenzie — trimite email + salvează în Supabase (pending)    |
| `GET /api/og`             | `pages/api/og.tsx`           | Unealtă internă pentru `npm run generate:og` — nu e apelat din pagini |
| `POST /api/csp-report`    | `pages/api/csp-report.ts`    | Colectare rapoarte Content-Security-Policy                            |

### API Routes admin (protejate — verifică sesiune la fiecare request)

| Route                                  | Metodă | Rol                                                               |
| -------------------------------------- | ------ | ----------------------------------------------------------------- |
| `/api/admin/login`                     | POST   | Verifică credențiale, setează cookie sesiune; rate limit 5/IP/15min |
| `/api/admin/logout`                    | POST   | Șterge cookie sesiune                                             |
| `/api/admin/messages`                  | GET    | Listează mesaje paginate (`?page=N`, 50/pagină), `deleted_at IS NULL` |
| `/api/admin/messages/[id]`             | GET    | Detaliu mesaj + reply-uri; auto-marchează ca `read`               |
| `/api/admin/messages/[id]`             | PATCH  | Actualizează status sau `{ action: "delete" }` (soft delete)      |
| `/api/admin/reply`                     | POST   | Trimite email reply + salvează în `admin_replies`; `dbWarning` dacă DB fail |
| `/api/admin/compose`                   | POST   | Trimite email standalone + salvează în `composed_emails`          |
| `/api/admin/sent`                      | GET    | Union composed_emails + admin_replies ordonate sent_at DESC       |
| `/api/admin/sent/[id]`                 | PATCH  | `{ action: "delete" }` soft delete pe composed_emails             |
| `/api/admin/reviews`                   | GET    | Listează recenzii cu filtru opțional `?status=pending/...`        |
| `/api/admin/reviews/[id]`              | PATCH  | Moderare: `{ action: "approve" \| "reject" }`                     |
| `/api/admin/imap-sync`                 | POST   | Declanșează sync Gmail → Supabase; returnează `{synced, skipped}` |
| `/api/admin/analytics/realtime`        | GET    | Date GA4 Realtime — vizitatori activi + pagini; cache 15s         |
| `/api/admin/analytics/report`          | GET    | Date GA4 Report 30 zile — daily/surse/device/țări; cache 10min   |

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

- `lib/admin/supabase.ts` aruncă la inițializare dacă env vars lipsesc — nu importa la nivel de modul din pagini publice; folosește `createClient` direct în `getServerSideProps` (vezi `pages/reviews.tsx`)
- `verifyAdminSession(req)` se apelează la **fiecare** API route și `getServerSideProps` admin
- `supabaseAdmin` (service role key) — bypass RLS — folosit exclusiv server-side
- Sesiunile admin sunt HMAC-SHA256 derivate din `ADMIN_EMAIL + ADMIN_PASSWORD + ADMIN_SESSION_SECRET`; schimbarea oricăreia invalidează toate sesiunile active
- `MessageType` în `supabase.types.ts` include `"email_inbound"` pentru mesajele sincronizate Gmail
- **Format răspuns API:** toate API routes admin returnează `{ ok: false, error: string }` via `errorResponse()` — **nu** `{ ok: false, message: string }`; importă din `lib/admin/response.ts`
- **XSS în admin:** orice conținut dinamic din DB randat în admin via `dangerouslySetInnerHTML` **trebuie** trecut prin `sanitizeHtml()` din `lib/admin/sanitize.ts`

### Reguli speciale descoperite în lucru

- **`Appear` cu `immediate` prop:** orice componentă `<Appear>` pe un grid/container trebuie să aibă `immediate` setat — fără el, `IntersectionObserver` nu declanșează animația pe mobile în producție (fix dovedit în PR #56, #79)
- **Full-bleed pattern:** secțiunile Hero nu se învelesc în `.section > .container` — au `data-full-bleed="true"` și nu au clasa `.section` pe wrapper (aceasta adaugă `paddingBlock: 24px` și creează gap)
- **`Breadcrumbs` după Hero:** întotdeauna sub secțiunea `<Hero>`, nu în interiorul ei
- **`<Appear>` pe container, nu pe fiecare item:** pentru grid-uri cu multe items, `Appear` cu `immediate` se pune pe containerul `Grid`, nu pe fiecare card individual

### SEO

- Metadata centralizată în `lib/pageMeta.ts` (include câmp `description` per pagină)
- JSON-LD **SSR** via prop `structuredData` pe `<Seo>` — nu injecta script tags din componente client
- `buildMenuJsonLd` se apelează exclusiv din `pages/meniuri/[slug].tsx` (SSR/SSG), nu din componente
- OG assets dedicate per pagină unde e cazul
- `<Seo structuredData={[...]} />` direct în pagină — `JsonLd.tsx` a fost șters

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
- `lib/admin/supabase.ts` — `supabaseAdmin` (service role, bypass RLS) — server-side only
- `lib/admin/supabase.types.ts` — tipuri pentru toate tabelele Supabase
- `lib/admin/smtp.ts` — `sendAdminMail()` helper pentru reply/compose; TLS `rejectUnauthorized: false` (hostico.ro)
- `supabase/functions/sync-imap/index.ts` — Edge Function Deno — `npm:imapflow`, host hardcodat `glc47.hostico.ro` (cert TLS valid), port 993 SSL, UNSEEN INBOX, deduplicare `metadata.message_id`, insert `email_inbound`, marchează citit; autentificare via `SYNC_SECRET` (Bearer token), deploy `--no-verify-jwt`; apelată din `/api/admin/imap-sync` (manual) și via `pg_cron` (automat 10 min)
- `supabase/migrations/004_pg_cron_sync.sql` — activează `pg_cron` + `pg_net`; job `*/10 * * * *` POST la Edge Function sync-imap
- `lib/admin/analytics.ts` — `getRealtimeData()` + `getReportData()` — GA4 Data API; singleton client; `withTimeout(8000ms)` pe toate apelurile API
- `lib/admin/response.ts` — `okResponse()` / `errorResponse()` — format uniform `{ ok: true [, data] }` / `{ ok: false, error }`
- `lib/admin/sanitize.ts` — `sanitizeHtml()` — strip tags + escape entities; folosit cu `dangerouslySetInnerHTML` în toate paginile admin
- `components/admin/AdminLayout.tsx` — sidebar: Inbox/Trimise/Recenzii/Compune/Analytics + manifest PWA admin
- `components/admin/AnalyticsChart.tsx` — Recharts AreaChart (dynamic import, ssr:false)
- `public/admin-manifest.json` — PWA manifest dedicat, scope /admin/, start_url /admin/inbox
- `public/admin-sw.js` — service worker izolat scope /admin/, network-first, cache minimal
- `types/admin.ts` — `SentKind`, `SentItem` — tipuri comune importate în `pages/api/admin/sent.ts` și `pages/admin/sent.tsx`
- `supabase/migrations/001_initial_schema.sql` — schema completă (4 tabele)
- `supabase/migrations/002_add_email_inbound_type.sql` — extinde CHECK tip mesaj
- `supabase/migrations/003_soft_delete.sql` — adaugă deleted_at pe messages și composed_emails
- **Soft delete:** inbox filtrează `deleted_at IS NULL`; PATCH `{ action: "delete" }` setează timestamp
- **SMTP TLS:** `rejectUnauthorized: false` pe toate cele 4 transporturi (smtp.ts, contact, offer-request, review-submit) — hostico.ro nu are cert valid pe hostname
- **Rate limiting login:** in-memory Map per IP, 5 încercări eșuate / 15 minute → 429; reset la autentificare reușită

### IMAP sync via Supabase Edge Function — variabile de mediu necesare

**Supabase Dashboard → Edge Functions → sync-imap → Secrets:**

```
SYNC_SECRET=<secret_32_bytes_hex>   # autentificare Bearer între Next.js și Edge Function
IMAP_HOST=mail.zephiraevents.ro     # referință; host real hardcodat în cod: glc47.hostico.ro
IMAP_PORT=993
IMAP_USER=info@zephiraevents.ro
IMAP_PASSWORD=...                   # parola cutiei IMAP
```

`SUPABASE_URL` și `SUPABASE_SERVICE_ROLE_KEY` sunt injectate automat de Supabase în Edge Functions.

**`.env.local` + Vercel env vars (pentru Next.js API route `/api/admin/imap-sync`):**

```
SYNC_SECRET=<același secret_32_bytes_hex>   # trimis ca Bearer token către Edge Function
NEXT_PUBLIC_SUPABASE_URL                    # deja prezent
```

**Gmail eliminat complet din arhitectură** — `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER` nu mai există în proiect.

**Flux email inbound:** emailurile sosite la `info@zephiraevents.ro` (IMAP `glc47.hostico.ro:993`) → butonul „Sincronizează email" din `/admin/inbox` (apelează `POST /api/admin/imap-sync` → Edge Function cu `Authorization: Bearer <SYNC_SECRET>`) sau automat via `pg_cron` la fiecare 10 minute.

**pg_cron setup:** după aplicarea migrației 004, setează în Supabase SQL Editor:
```sql
ALTER DATABASE postgres SET app.supabase_url = 'https://edgxqqkafezdcnnpsjqm.supabase.co';
ALTER DATABASE postgres SET app.service_role_key = '<SUPABASE_SERVICE_ROLE_KEY>';
```

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
- `pages/reviews.tsx` — **SSR** — citește din Supabase `WHERE status='approved'`, fallback `data/reviews.json`
- `pages/api/review-submit.ts` — primește recenzia, trimite email + salvează în Supabase (status: pending)
- `lib/reviews.ts` — fallback: citește `data/reviews.json`, transformă `date` → `createdAt` epoch ms
- `data/reviews.json` — 12 recenzii statice (fallback și sursă migrare one-time)
- `scripts/migrate-reviews.ts` — one-time: `npm run migrate:reviews` migrează JSON → Supabase

### SEO / Metadata

- `components/Seo.tsx` — prop `structuredData` pentru JSON-LD SSR
- `lib/pageMeta.ts` — metadata + description per pagină (7 rute inclusiv `/reviews`)
- `lib/url.ts`
- `lib/seo/menuJsonLd.ts` — apelat doar din `pages/meniuri/[slug].tsx`
- `pages/robots.txt.ts`, `pages/sitemap*.ts`
- `pages/api/og.tsx` — unealtă internă, nu apelată din pagini
- OG images statice pre-generate: `public/images/og.jpg`, `og-servicii.jpg`, `og-galerie.jpg`, `og-contact.jpg`, `og-blog.jpg`, `og-cort.jpg`, `og-reviews.jpg`
- Pentru regenerare OG: `npm run generate:og` (necesită `npm run dev` pe `:3000`) — 7 pagini înregistrate (inclusiv `/reviews`)

### Shell / Theme / Layout

- `components/Layout.tsx`
- `styles/theme.css.ts`, `styles/theme.global.css.ts`, `styles/globals.css`
- `components/ThemeSwitcher.tsx`
- `components/pwa/` — InstallAppButton, PwaInstallCta, ServiceWorkerRegister

---

## 8. Ce este deschis / în lucru

**~~Gmail sync (înlocuire IMAP)~~ ✓ ÎNCHIS 2026-03-23** (PR #116)
`lib/admin/imap.ts` șters; `lib/admin/gmail.ts` creat — Gmail API OAuth2 (`googleapis`), listează UNREAD in:inbox max 50. **Înlocuit complet cu IMAP via Supabase Edge Function (PR feature/supabase-imap-sync, 2026-03-24).**

**~~Gmail → IMAP via Supabase Edge Function~~ ✓ ÎNCHIS 2026-03-24** (branch feature/supabase-imap-sync)
`lib/admin/gmail.ts` șters; `supabase/functions/sync-imap/index.ts` creat — Edge Function Deno, `npm:imapflow`, IMAP SSL 993, UNSEEN INBOX, deduplicare după `metadata.message_id`, insert `email_inbound`, marchează citit. `supabase/migrations/004_pg_cron_sync.sql` — pg_cron job 10 min. `/api/admin/imap-sync.ts` — apelează Edge Function via fetch. Variabile Gmail eliminate din `.env.local`; adăugate `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`.

**~~Admin hardening-1~~ ✓ ÎNCHIS 2026-03-23** (PR #117)
- XSS: `lib/admin/sanitize.ts` creat; `sanitizeHtml()` aplicat în toate paginile admin via `dangerouslySetInnerHTML`
- `Promise.all` în `reply.ts` → două try/catch independente; returnează `{ ok: true, dbWarning: true }` dacă DB fail după email trimis
- `saveToDb()` în `compose.ts` aruncă la eroare Supabase; gestionat cu try/catch
- `decodeBase64Url()` din `gmail.ts` (șters 2026-03-24) era învelit în try/catch — Edge Function Deno folosește `TextDecoder` direct
- Soft delete în inbox: verifică `res.ok` după PATCH; afișează `deleteError` în UI

**~~Admin hardening-2~~ ✓ ÎNCHIS 2026-03-23** (PR #118)
- Paginare inbox: SSR, 50/pagină, buton Anterior/Următor; SELECT coloane specifice (fără `*`)
- GA4 client singleton: `_ga4Client` module-level, creat o singură dată per proces
- Gmail `messages.modify()` învelit în try/catch cu `console.warn` — acum înlocuit cu IMAP `messageFlagsAdd` în Edge Function (try/catch similar)
- `sent.tsx` SSR: 3 query-uri → `Promise.all([emailResult, replyResult, unreadResult])` paralel

**~~Admin hardening-3~~ ✓ ÎNCHIS 2026-03-23** (PR #119)
- Rate limiting `/api/admin/login`: in-memory Map per IP, 5 fail/15min → 429; reset la succes
- `rememberMe`: `Boolean(body.rememberMe) === true` (cast explicit, elimină edge case truthy)
- GA4 timeout: `withTimeout(8000ms)` pe `runRealtimeReport()` și `Promise.all([...runReport])`
- `types/admin.ts`: `SentKind` + `SentItem` centralizate — importate în API route + pagini
- `lib/admin/response.ts`: `okResponse()` / `errorResponse()` uniform în toate API routes admin
- Client pages `inbox/[id]` + `compose`: `data.message` → `data.error`

**~~Dashboard admin /admin cu Supabase~~ ✓ ÎNCHIS 2026-03-23**
Complet: autentificare HMAC cookie-based, inbox cu Gmail sync, reply/compose email, moderare recenzii, analytics GA4 (realtime + raport 30 zile cu Recharts). PR #admin-dashboard.

**~~Admin improvements~~ ✓ ÎNCHIS 2026-03-23** (branch feature/admin-improvements)
- SMTP TLS: `rejectUnauthorized: false` pe toate cele 4 transporturi (smtp.ts, contact, offer-request, review-submit)
- Pagina Trimise `/admin/sent`: union `composed_emails` + `admin_replies` cu badge Reply/Nou, SSR, session check
- Soft delete: migrație 003, buton coș pe inbox + sent, filtru `deleted_at IS NULL`, PATCH `{ action: "delete" }`
- PWA admin: `public/admin-manifest.json` (scope /admin/), `public/admin-sw.js` (network-first), manifest link în login + AdminLayout

**Reviews — sistem Supabase ✓ ACTIV**
Recenziile noi trimise prin formular se salvează în Supabase (`status: pending`). Moderare din `/admin/reviews`. Recenziile aprobate sunt citite SSR în `pages/reviews.tsx`. `data/reviews.json` rămâne ca fallback. Migrarea inițială (12 recenzii) s-a rulat cu `npm run migrate:reviews`.

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

scripts/migrate-reviews.ts
  One-time migration: data/reviews.json → Supabase reviews table.
  Idempotent — skip dacă recenzia există (name + rating + text[:50]).
  Rulare: npm run migrate:reviews
  Necesită: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY în .env.local

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
  Notă: PNG-urile din servicii/servicii/ sunt excluse de la recomprimare (compresia lossless
        le-ar mări față de originalele deja optimizate cu pngquant).

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
- Reviews → Supabase SSR (fallback JSON static)
- Imagini comprimate cu sharp (MozJPEG q70) — reducere ~34%
- Video-uri comprimate cu ffmpeg (CRF 26-32) — reducere ~64%
- Hero și TentBanner → video responsive (desktop 1920×1080, mobil 854×480)
- LCP fix — preload manual pentru imaginea hero în `pages/index.tsx`
- TBT fix — motion cache module-level, `ReducedMotionProvider` global, `ArcGallery` lazy, cookie batching
- Lightbox CSS scoped la `pages/galerie.tsx` și `pages/cort-evenimente-la-locatia-ta.tsx`

### Admin dashboard 2026-03-23

- Supabase: 4 tabele (messages, admin_replies, composed_emails, reviews), RLS activat
- Auth: HMAC-SHA256 cookie httpOnly, 8h TTL, timing-safe compare
- Gmail sync: `googleapis` OAuth2 refresh token, UNREAD inbox max 50, deduplicare gmail_id
- GA4: BetaAnalyticsDataClient singleton per proces, realtime + report 30 zile, timeout 8s
- Recharts: AreaChart cu gradient fill, dynamic import (ssr:false)
- `pages/reviews.tsx`: SSG → SSR, citește din Supabase approved, fallback JSON

### Admin hardening 2026-03-23 (PR #117–119)

- XSS defense-in-depth: `sanitizeHtml()` pe toate datele din DB randate în admin
- Error handling: reply/compose separă email send de DB write; `dbWarning` flag la eșec DB
- Rate limiting login: 5 fail/IP/15min → 429 (in-memory Map, reset la succes)
- GA4 timeout: `withTimeout(8000ms)` — previne blocare infinită la API call
- Paginare inbox: SSR 50/pagină, SELECT coloane specifice (nu `SELECT *`)
- Format erori uniform: `errorResponse()` → `{ ok: false, error }` în toate API routes admin
- Tipuri centralizate: `types/admin.ts` — sursă unică pentru `SentKind`, `SentItem`

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

---

## 9. Ce să nu faci

- Nu transforma proiectul în booking engine sau admin panel suplimentar — dashboard-ul admin e complet
- Nu hardcoda conținut care are deja structură data-driven (`data/menus.json`, `data/gallery.json`)
- Nu pune inline styling permanent — Vanilla Extract pentru tot
- Nu omite `immediate` pe `<Appear>` când wrappezi grid-uri sau galerii
- Nu înfășura `<Hero>` în `.section` sau `.container` — strică full-bleed
- Nu adăuga scripturi noi în `package.json` fără să stergi cele devenite inutile
- Nu face `git push --force` pe `main`
- Nu sări peste `typecheck + lint + build` înainte de commit
- Nu folosi `JsonLd.tsx` — a fost șters; JSON-LD se adaugă exclusiv via prop `structuredData` pe `<Seo>`
- Nu injecta `buildMenuJsonLd` (sau orice JSON-LD) din componente client-side — doar din `getStaticProps` / `getServerSideProps` în pagini
- Nu importa `lib/admin/supabase.ts` la nivel de modul din pagini publice — aruncă dacă env vars lipsesc; folosește `createClient` direct în `getServerSideProps`
- Nu apela funcțiile GA4 din client-side — sunt exclusiv server-side
- Nu re-adăuga Gmail API (`googleapis`) — înlocuit definitiv cu IMAP via Supabase Edge Function (2026-03-24); `lib/admin/gmail.ts` a fost șters
- Nu apela Edge Function `sync-imap` direct din client-side — trece prin `/api/admin/imap-sync` (sesiune verificată)
- Nu returna erori cu `{ ok: false, message }` în API routes admin — folosește `errorResponse()` din `lib/admin/response.ts` care produce `{ ok: false, error }`
- Nu randa conținut din DB în admin fără `sanitizeHtml()` — chiar dacă React JSX auto-escapes, orice `dangerouslySetInnerHTML` trebuie trecut prin `sanitizeHtml()`
- Nu rula `npm run migrate:reviews` de mai multe ori fără să verifici că tabela e goală — scriptul e idempotent dar verifică înainte
- Nu commita `client_secret_*.json` — e în `.gitignore`; conține credențiale OAuth2 Google
