// components/sections/TentGallery.tsx

// ==============================
// Imports
// ==============================
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Plugin, Slide } from "yet-another-react-lightbox";

import * as s from "../../styles/sections/tentGallery.css";
import Appear from "../animations/Appear";

// ==============================
// Constante
// ==============================
const IMAGES = Array.from({ length: 20 }, (_, i) => ({
  src: `/images/gallery/tent/g-${String(i + 1).padStart(3, "0")}.jpg`,
  alt: `Cort evenimente la locația ta — ${i + 1}`,
}));

const slides: Slide[] = IMAGES.map((img) => ({
  src: img.src,
  alt: img.alt,
  title: img.alt,
}));

// ==============================
// Dynamic import
// ==============================
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

// ==============================
// Component
// ==============================
export default function TentGallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = useCallback((i: number) => setOpenIndex(i), []);
  const close = useCallback(() => setOpenIndex(null), []);

  const pluginsRef = useRef<Plugin[] | null>(null);
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);

  const loadPlugins = useCallback(async () => {
    if (pluginsRef.current) return;
    const mZoom = await import("yet-another-react-lightbox/plugins/zoom");
    const arr = [mZoom.default] as Plugin[];
    pluginsRef.current = arr;
    setPlugins(arr);
  }, []);

  // Prefetch on-idle
  useEffect(() => {
    if (typeof window === "undefined") return;
    let t: number | undefined;

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(
        () => {
          void loadPlugins();
        },
        { timeout: 1500 },
      );
    } else {
      t = window.setTimeout(() => {
        void loadPlugins();
      }, 800);
    }
    return () => {
      if (t !== undefined) window.clearTimeout(t);
    };
  }, [loadPlugins]);

  // Încarcă imediat dacă userul deschide lightbox-ul înainte de idle
  useEffect(() => {
    if (openIndex !== null && !pluginsRef.current) {
      void loadPlugins();
    }
  }, [openIndex, loadPlugins]);

  return (
    <>
      <Appear kind="fade">
        <div className={s.grid}>
          {IMAGES.map((img, i) => (
            <div
              key={img.src}
              role="button"
              tabIndex={0}
              className={s.imageWrap}
              onClick={() => open(i)}
              onKeyDown={(e) => e.key === "Enter" && open(i)}
              aria-label={img.alt}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={600}
                height={450}
                className={s.image}
                priority={i < 4}
              />
            </div>
          ))}
        </div>
      </Appear>

      {openIndex !== null && plugins && (
        <Lightbox open index={openIndex} close={close} slides={slides} plugins={plugins} />
      )}
    </>
  );
}
