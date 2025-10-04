# ZephiraEvents

> Website de evenimente construit pe **KonceptID Base Template** (Next.js + TypeScript strict + Vanilla Extract).  
> Repo conectat la **Vercel** – fiecare PR generează automat un **Preview**.

## TL;DR
- Lucrăm **branch-per-issue** + **PR** cu verificări (lint, typecheck, build) și link de **Vercel Preview**.
- README descrie modul nostru de lucru, setup local, personalizare, SEO/JSON-LD, PWA, QA & troubleshooting.
- Proiectul clădește pe _KonceptID Base Template_ fără a schimba arhitectura; pentru ZephiraEvents adaptăm strict conținutul.

---

## Conținut
- [Stack & capabilități](#stack--capabilități)
- [Cum lucrăm (proces)](#cum-lucrăm-proces)
- [Setup local](#setup-local)
- [Scripturi utile](#scripturi-utile)
- [Variabile de mediu (.env)](#variabile-de-mediu-env)
- [Structura proiectului](#structura-proiectului)
- [Personalizare rapidă pentru ZephiraEvents](#personalizare-rapidă-pentru-zephiraevents)
- [SEO & JSON-LD](#seo--json-ld)
- [PWA & Offline](#pwa--offline)
- [Accesibilitate & performanță](#accesibilitate--performanță)
- [Deploy pe Vercel](#deploy-pe-vercel)
- [QA minim (Definition of Done)](#qa-minim-definition-of-done)
- [Troubleshooting](#troubleshooting)
- [Licență & uz intern](#licență--uz-intern)

---

## Stack & capabilități
- **Next.js** (15.x) + **TypeScript strict**  
- **Vanilla Extract** pentru stilizare (fără framework CSS global)  
- **SEO centralizat**: `lib/config.ts` + componentă `<Seo />`  
- **JSON-LD** (BlogPosting, Organization, FAQPage etc., după secțiuni)  
- **PWA**: service worker doar în producție, pagină `_offline`  
- **Galerie** din date (JSON) + imagini optimizate (`next/image`)  
- **Accesibilitate**: Skip-link, focus states vizibile, a11y pe navigație  
- **CI/Preview**: PR → build automat pe **Vercel Preview**

---

## Cum lucrăm (proces)
**Model: branch-per-issue**. Un issue = un branch = un PR.

**Naming branch**
- `feat/ZE-<nr>-scurt-titlu`
- `fix/ZE-<nr>-…`
- `docs/ZE-<nr>-…`
- `chore/ZE-<nr>-…`
- `refactor/ZE-<nr>-…`

**Conventional Commits**
- `feat`, `fix`, `docs`, `refactor`, `chore`, `perf`, `test`, `ci`, `build`.

**Exemple**
- Commit: `docs(readme): actualizează ghidul pentru ZephiraEvents (ZE-11)`
- PR title: `[ZE-11] Update README pentru ZephiraEvents`
- PR body: include `Closes #11`

**Checks PR (minim)**
1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. Link **Vercel Preview** + screenshot dacă e modificare UI

**Merge**
- recomandat **Squash & merge**  
- autoinchidere issue cu `Closes #<nr>`

---

## Setup local
**Cerințe**
- Node **LTS 20+**
- npm (sau pnpm/yarn – dacă echipa standardizează alt manager, îl specificăm în issues)

**Pași**
```bash
npm install
npm run dev
# http://localhost:3000
Scripturi utile
bash
Copiază codul
npm run dev         # dev server
npm run build       # build producție
npm run start       # rulează build-ul
npm run lint        # ESLint
npm run typecheck   # TypeScript - noEmit
npm run format      # Prettier (dacă este definit în package.json)
Variabile de mediu (.env)
Folosește .env.local (nu se comite în git). Exemple comune (opționale – adaptează după nevoie):

env
Copiază codul
NEXT_PUBLIC_SITE_URL=https://zephiraevents.example.com
NEXT_ENABLE_PWA=1
# GA / Tag Manager (dacă se folosește)
NEXT_PUBLIC_GA_ID=
# Hărți, formulare, etc. (dacă există integrare)
NEXT_PUBLIC_MAPS_KEY=
În Vercel, setează aceleași chei în Project Settings → Environment Variables.
NEXT_ENABLE_PWA=1 activează SW doar în producție.

Structura proiectului
(sumar orientativ – poate varia în timp)

bash
Copiază codul
/public
  /images           # branding, og, favicon, icons
/data               # surse pentru galerii/faq/etc.
/lib
  config.ts         # SEO/site config centralizat
  nav.ts            # navigație + social centralizat
  ...               # utilitare, hooks
/components         # componente UI
/sections           # secțiuni de pagină
/pages              # rute Next.js, inclusiv _offline
/styles             # Vanilla Extract theming + CSS modules
Personalizare rapidă pentru ZephiraEvents
Branding & imaginile: /public/images (logo, og-image, favicons, splash)

SEO/site: lib/config.ts (siteName, titleTemplate, description, ogImage)

Navigație & social: lib/nav.ts

Conținut: texte/pagini în /pages, listări/galerii în /data (unde e cazul)

Culori, radius, spacing: tokens în stilurile Vanilla Extract

Scopul este adaptarea conținutului la ZephiraEvents, fără a schimba arhitectura de bază.

SEO & JSON-LD
SEO centralizat în lib/config.ts și componenta <Seo />.

JSON-LD: adăugăm tipurile relevante per pagină/sectțiune (ex. Organization, BreadcrumbList, FAQPage, BlogPosting).

Canonical, robots, sitemap: generate/servite conform setărilor din proiect.

PWA & Offline
PWA activabil cu NEXT_ENABLE_PWA=1.

Service Worker doar în producție.

Pagină fallback: /_offline.

Iconuri PWA (inclusiv maskable) în /public.

Accesibilitate & performanță
Skip-link, aria corect pe nav, focus vizibil, citire corectă pentru screen readers.

LCP controlat (imaginea LCP optimizată, priority doar unde e necesar).

CLS ~0: spații rezervate, imagini cu dimensiuni declarate.

Respectă prefers-reduced-motion.

Țintă: scoruri Lighthouse ~95–100.

Deploy pe Vercel
Repo conectat la Vercel → fiecare PR generează Preview.

main → Production după merge.

Env sincronizat între local și Vercel.

Verifică CSP (dacă sunt iframe/hărți) și domeniile permise în imagini.

QA minim (Definition of Done)
Documentație/feature descris în issue + urmărit pe branch dedicat

Lint/Typecheck/Build OK

Vercel Preview verificat (UI + Console)

Screenshots înainte/după (dacă e UI)

PR include Closes #<nr> + scurt rezumat Problemă/Soluție/Impact/QA

Troubleshooting
Build eșuat: rulează local npm run lint && npm run typecheck && npm run build, verifică mesajele.

Imagini lipsă / OG: confirmă prezența în /public/images și path-urile corecte.

CSP/Maps/Embeds: actualizează directivele (ex. frame-src) dacă integrezi hărți/iframe.

PWA: dacă nu dorești SW, omite NEXT_ENABLE_PWA sau pune 0.

404 pe asset în Preview: verifică withBase/path-urile relative dacă există utilitare de bază similare în proiect.

Licență & uz intern
Acest repository este parte din ecosistemul KonceptID și este utilizat intern pentru proiectul ZephiraEvents.
© 2025 KonceptID. Toate drepturile rezervate.