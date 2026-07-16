"use client";

import { useEffect, useRef, useState } from "react";
import { Rotate3d } from "lucide-react";

// model-viewer bir web bileseni; TS/JSX icin string etiketi kullaniyoruz.
const MV = "model-viewer" as unknown as React.FC<Record<string, unknown>>;

interface ModelViewerProps {
  src: string;
  alt: string;
  /** Model yuklenene kadar (ve hata halinde kalici olarak) gosterilecek gorsel */
  poster?: string;
  className?: string;
}

/** Tarayici WebGL destekliyor mu? Desteklemiyorsa 3D hic denenmez. */
function webglDesteginiKontrolEt(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/**
 * Performans:
 *  - Kutuphane (three.js ~600KB) ve GLB yalnizca bolum ekrana yaklasinca iner.
 *  - Ekrandan cikinca otomatik donme durur.
 *
 * Saglamlik (onceki surumdeki sorun):
 *  - Onceden hata hic ele alinmiyordu: kutuphane inemezse, WebGL yoksa veya
 *    GLB bozuksa ekranda SONSUZA KADAR donen bir cember kaliyordu; kullanici
 *    acisindan "3D acilmiyor" gibi gorunuyordu.
 *  - Artik her basarisizlikta urun fotografina dusuluyor ve durum aciklaniyor.
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
  const [failed, setFailed] = useState(false);

  // Ekrana yaklasma / gorunurluk takibi
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          preload.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
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

  // Kutuphaneyi sadece gerektiginde indir; her hata yakalanir
  useEffect(() => {
    if (!nearViewport || ready || failed) return;
    let active = true;

    if (!webglDesteginiKontrolEt()) {
      setFailed(true);
      return;
    }

    // Cok yavas baglantida sonsuz bekleme olmasin
    const zamanAsimi = setTimeout(() => {
      if (active && !ready) setFailed(true);
    }, 20000);

    import("@google/model-viewer")
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => clearTimeout(zamanAsimi));

    return () => {
      active = false;
      clearTimeout(zamanAsimi);
    };
  }, [nearViewport, ready, failed]);

  // Hata: fotografa dus, kullaniciya durumu soyle
  if (failed) {
    return (
      <div className={`relative ${className ?? ""}`}>
        {poster && (
          <img
            src={poster}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
        <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <Rotate3d className="h-3 w-3" />
          3D görünüm bu cihazda desteklenmiyor
        </span>
      </div>
    );
  }

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
      {!ready && nearViewport && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9594c]/30 border-t-[#d9594c]" />
        </div>
      )}

      {ready && (
        <MV
          src={src}
          alt={alt}
          poster={poster}
          loading="eager"
          camera-controls=""
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
          // GLB inemez/bozuksa da fotografa dus
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        />
      )}
    </div>
  );
}
