// /pages/api/og.tsx
/* eslint-disable @next/next/no-img-element */
// OG dinamic (Edge) — generează 1200×630 pe baza H1 + hero

// ==============================
// Imports
// ==============================
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { absoluteAssetUrl } from "../../lib/config";
import { getPageMeta } from "../../lib/pageMeta";

// ==============================
// Config (Edge Runtime)
// ==============================
export const config = { runtime: "edge" };

// ==============================
// Constants
// ==============================
const SIZE = { width: 1200, height: 630 } as const;
const SAFE_PAD = 120; // zonă safe ~120px
const BRAND = { accent: "#78B688" } as const;

// ==============================
// Utils
// ==============================
function ensure(value: string, fallback = ""): string {
  const v = (value || "").trim();
  return v ? v : fallback;
}

// ==============================
// Handler
// ==============================
export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const p = searchParams.get("p") || "/";
  const titleOverride = searchParams.get("title") || "";
  const subtitleOverride = searchParams.get("subtitle") || "";

  const meta = getPageMeta(p);
  const title = ensure(titleOverride, meta.title);
  const subtitle = ensure(subtitleOverride, meta.subtitle || "");

  const heroUrl = absoluteAssetUrl(meta.heroSrc);
  const logoUrl = absoluteAssetUrl("/logo.svg");

  // Layout: img de fundal (cover) + overlay semitransparent pentru contrast + conținut
  return new ImageResponse(
    (
      <div
        style={{
          width: `${SIZE.width}px`,
          height: `${SIZE.height}px`,
          position: "relative",
          display: "flex",
          backgroundColor: "#111",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Fundal (hero) */}
        <img
          src={heroUrl}
          width={SIZE.width}
          height={SIZE.height}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "cover",
          }}
        />
        {/* Overlay pentru contrast */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        />
        {/* Conținut */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: SAFE_PAD,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Brand row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 10,
                height: 48,
                backgroundColor: BRAND.accent,
                borderRadius: 6,
              }}
            />
            <img
              src={logoUrl}
              alt=""
              width={200}
              height={48}
              style={{ objectFit: "contain", filter: "brightness(1.05)" }}
            />
          </div>

          {/* Titlu */}
          <div
            style={{
              color: "#fff",
              fontSize: 64,
              lineHeight: 1.1,
              fontWeight: 700,
              textShadow: "0 2px 16px rgba(0,0,0,0.35)",
              maxWidth: SIZE.width - SAFE_PAD * 2,
            }}
          >
            {title}
          </div>

          {/* Subtitlu (opțional) */}
          {subtitle ? (
            <div
              style={{
                marginTop: 18,
                color: "rgba(255,255,255,0.90)",
                fontSize: 28,
                lineHeight: 1.35,
                fontWeight: 500,
                textShadow: "0 2px 10px rgba(0,0,0,0.35)",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: SIZE.width,
      height: SIZE.height,
      // PNG by default — acceptat de toate platformele; dimensiunea tipică <500KB
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, s-maxage=31536000, immutable",
      },
    },
  );
}

