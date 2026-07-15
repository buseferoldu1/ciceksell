"use client";

import { useEffect, useRef, useState } from "react";

// model-viewer bir web bileseni; TS/JSX icin string etiketi kullaniyoruz.
const MV = "model-viewer" as unknown as React.FC<Record<string, unknown>>;

interface ModelViewerProps {
  src: string;
  alt: string;
  /** Model yuklenene kadar gosterilecek gorsel */
  poster?: string;
  className?: string;
}

/**
 * Performans notu: model-viewer three.js'i (~600 KB) ve GLB dosyasini
 * (birkac MB) beraberinde getirir. Bu yuzden:
 *  - Kutuphane ve model YALNIZCA bolum ekrana yaklasinca yuklenir.
 *  - Ekrandan cikinca otomatik donme durur (GPU bosa calismaz).
 * Aksi halde ana sayfa acilir acilmaz iki agir model birden yuklenip
 * surekli render edildigi icin sayfa kasiyordu.
 */
export default function ModelViewer({
  src,
  alt,
  poster,
  className,
}: ModelViewerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  // Ekrana yaklasma / gorunurluk takibi
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // 300px onceden yuklemeye basla
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          preload.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    // Gercekten gorunur mu? (donmeyi durdurmak icin)
    const inView = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    preload.observe(el);
    inView.observe(el);
    return () => {
      preload.disconnect();
      inView.disconnect();
    };
  }, []);

  // Kutuphaneyi sadece gerektiginde indir
  useEffect(() => {
    if (!nearViewport || ready) return;
    let active = true;
    import("@google/model-viewer").then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [nearViewport, ready]);

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      {/* Poster: model gelene kadar aninda bir seyler gorunur */}
      {!ready && poster && (
        <img
          src={poster}
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain opacity-60"
        />
      )}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9594c]/30 border-t-[#d9594c]" />
        </div>
      )}

      {ready && (
        <MV
          src={src}
          alt={alt}
          poster={poster}
          loading="lazy"
          camera-controls=""
          // Ekranda degilken donmesin: bosuna GPU yakmaz
          {...(visible ? { "auto-rotate": "" } : {})}
          auto-rotate-delay="0"
          rotation-per-second="18deg"
          interaction-prompt="none"
          touch-action="pan-y"
          shadow-intensity="1"
          shadow-softness="1"
          exposure="1.1"
          camera-orbit="0deg 78deg 100%"
          min-camera-orbit="auto auto 60%"
          max-camera-orbit="auto auto 160%"
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        />
      )}
    </div>
  );
}
