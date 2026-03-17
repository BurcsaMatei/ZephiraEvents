// components/sections/TentAtLocationBanner.tsx

// ==============================
// Imports
// ==============================
import Link from "next/link";
import * as React from "react";

import { withBase } from "../../lib/config";
import * as s from "../../styles/sections/tentAtLocationBanner.css";
import Appear from "../animations/Appear";
import HeroLCPImage from "../HeroLCPImage";

// ==============================
// Constante
// ==============================
const POSTER_SRC = "/images/current/hero-services.jpg";
const VIDEO_SRC = "/videos/current/your-location-tent-video.mp4";

// ==============================
// Component
// ==============================
export default function TentAtLocationBanner(): JSX.Element {
  const [isVideoReady, setIsVideoReady] = React.useState(false);

  // Anti-CLS & full-bleed — rămân inline (ca la HeroIndex)
  const fullBleedStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    width: "100vw",
    maxWidth: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    isolation: "isolate",
  };

  const stageStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    width: "100%",
    margin: 0,
    overflow: "hidden",
    minHeight: "62vh",
    maxHeight: "80vh",
    backgroundColor: "transparent",
  };

  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  };

  return (
    <div style={fullBleedStyle} aria-label="Cort de evenimente la locația ta">
      <figure className={s.maskStage} style={stageStyle} aria-hidden>
        <div style={mediaStyle}>
          <HeroLCPImage
            src={POSTER_SRC}
            alt=""
            priority={false}
            sizes="100vw"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <video
            className={`${s.mediaVideo} ${isVideoReady ? s.mediaVideoReady : ""}`}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            poster={POSTER_SRC}
            onCanPlay={() => setIsVideoReady(true)}
            aria-hidden
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        </div>

        <div className={s.gradient} />
        <div className={s.dots} />
        <div className={s.arcGradient} aria-hidden="true" />
      </figure>

      <div className={s.contentLayer} style={mediaStyle} aria-live="polite">
        <div className={s.contentWrap}>
          <Appear>
            <>
              <p className={s.eyebrow}>Serviciu nou</p>

              <h2 className={s.title}>Cort de evenimente la locația ta</h2>

              <p className={s.lede}>
                Amplasăm un cort premium la locația aleasă de tine și ne ocupăm de tot
              </p>

              <div className={s.ctaRow}>
                <Link className={s.ctaPrimary} href={withBase("/cort-evenimente-la-locatia-ta")}>
                  Vezi detalii
                </Link>
                <Link className={s.ctaSecondary} href={withBase("/contact")}>
                  Solicită ofertă
                </Link>
              </div>
            </>
          </Appear>
        </div>
      </div>
    </div>
  );
}
