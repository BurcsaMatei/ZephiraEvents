// components/Seo.tsx

// ==============================
// Imports
// ==============================
import Head from "next/head";
import type { ReactNode } from "react";

import type { Json } from "../interfaces";
import { absoluteOgImage, absoluteUrl, canonical as canonicalFor, SITE } from "../lib/config";

// ==============================
// Types
// ==============================
type OgType = "website" | "article";

type SeoAlternates = Record<string, string>; // ex: { "en-US": "/en", "ro-RO": "/ro", "x-default": "/" }

type Props = {
  title?: string;
  description?: string;
  image?: string; // relativ sau absolut
  imageAlt?: string; // alt text pt. og/twitter
  imageWidth?: number; // px
  imageHeight?: number; // px
  url?: string; // relativ sau absolut
  noindex?: boolean;
  canonical?: string; // poți forța un canonical diferit
  type?: OgType;

  /** Date specifice tipului "article" */
  publishedTime?: string | Date;
  modifiedTime?: string | Date;
  authors?: string[]; // URL-uri (recomandat) sau nume
  tags?: string[];
  section?: string;

  /** alternate hreflang links */
  alternates?: SeoAlternates;

  // ✅ acceptăm și readonly arrays
  structuredData?: Json | Json[] | readonly Json[];
  children?: ReactNode;
};

// ==============================
// Utils
// ==============================

// Normalizează într-un Json[] mutabil
function toJsonArray(input?: Json | Json[] | readonly Json[]): Json[] {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return [...arr] as Json[];
}

function toIso(input?: string | Date): string | undefined {
  if (!input) return undefined;
  if (input instanceof Date) return input.toISOString();
  return input;
}

/** Construiește <title> pe baza template-ului din SITE */
function buildTitleLocal(title?: string): string {
  const tpl = SITE.titleTemplate || "%s";
  if (title && tpl.includes("%s")) return tpl.replace("%s", title);
  if (title) return `${title} — ${SITE.name || ""}`.trim();
  return SITE.defaultTitle || SITE.name || "";
}

/** Normalizează trailing slash conform preferinței (derivată din SITE.url) */
const preferTrailingSlash = SITE.url.endsWith("/");
function alignTrailingSlash(u?: string | null): string | undefined {
  if (!u) return undefined;
  if (preferTrailingSlash) return u.endsWith("/") ? u : `${u}/`;
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

/** Întoarce URL absolut și aliniat ca trailing-slash */
function absoluteAligned(input?: string): string | undefined {
  if (!input) return undefined;
  const abs = absoluteUrl(input);
  return alignTrailingSlash(abs ?? input);
}

/** Cheie deterministă pentru schema JSON-LD (stabilă între render-uri) */
function schemaKey(schema: Json, fallbackIndex: number): string {
  const s = (schema ?? {}) as Record<string, unknown>;
  const byId = (s["@id"] ?? s.id ?? s.url) as string | undefined;
  const byType = (s["@type"] ?? s.type) as string | undefined;
  if (byId && byType) return `${byType}:${byId}`;
  if (byId) return String(byId);
  if (byType) return `${byType}:${fallbackIndex}`;

  const str = JSON.stringify(schema);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return `schema:${(h >>> 0).toString(16)}:${fallbackIndex}`;
}

// ==============================
// Component
// ==============================
export default function Seo({
  title,
  description = SITE.description,
  image = SITE.ogImage,
  imageAlt,
  imageWidth,
  imageHeight,
  url,
  noindex,
  canonical,
  type = "website",

  // article
  publishedTime,
  modifiedTime,
  authors,
  tags,
  section,

  // hreflang
  alternates,

  structuredData,
  children,
}: Props) {
  const pageUrl = absoluteAligned(url) ?? alignTrailingSlash(SITE.url || "/")!;
  const canonicalHref = canonical ? canonicalFor(canonical) : pageUrl;
  const ogImage = absoluteOgImage(image) || undefined; // OG absolut (respectă CDN)
  const fullTitle = buildTitleLocal(title);

  const schemas: Json[] = toJsonArray(structuredData);

  // date article (ISO)
  const publishedISO = toIso(publishedTime);
  const modifiedISO = toIso(modifiedTime);
  const updatedForOg = modifiedISO ?? publishedISO;

  return (
    <Head>
      {/* Title + description */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}

      {/* Indexare */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonicalHref} />

      {/* Hreflang alternates */}
      {alternates &&
        Object.entries(alternates).map(([lang, href]) => {
          const hrefAbs = absoluteAligned(href);
          return hrefAbs ? (
            <link key={`alt:${lang}`} rel="alternate" hrefLang={lang} href={hrefAbs} />
          ) : null;
        })}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={pageUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      {typeof imageWidth === "number" && (
        <meta property="og:image:width" content={String(imageWidth)} />
      )}
      {typeof imageHeight === "number" && (
        <meta property="og:image:height" content={String(imageHeight)} />
      )}
      {SITE.locale && <meta property="og:locale" content={SITE.locale} />}
      {updatedForOg && <meta property="og:updated_time" content={updatedForOg} />}

      {/* Meta specifice articolului */}
      {type === "article" && (
        <>
          {publishedISO && <meta property="article:published_time" content={publishedISO} />}
          {modifiedISO && <meta property="article:modified_time" content={modifiedISO} />}
          {section && <meta property="article:section" content={section} />}
          {Array.isArray(tags) &&
            tags.map((tag) => (
              <meta key={`article:tag:${tag}`} property="article:tag" content={tag} />
            ))}
          {Array.isArray(authors) &&
            authors.map((a) => (
              <meta key={`article:author:${a}`} property="article:author" content={a} />
            ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
      {SITE.twitterHandle && <meta name="twitter:site" content={SITE.twitterHandle} />}

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script
          key={schemaKey(schema, i)}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {children}
    </Head>
  );
}
