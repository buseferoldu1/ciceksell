"use client";

import { useEffect, useState } from "react";

// model-viewer bir web bileseni; TS/JSX icin string etiketi any olarak kullaniyoruz.
const MV = "model-viewer" as unknown as React.FC<Record<string, unknown>>;

interface ModelViewerProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ModelViewer({ src, alt, className }: ModelViewerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    import("@google/model-viewer").then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className={`flex items-center justify-center ${className ?? ""}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9594c]/30 border-t-[#d9594c]" />
      </div>
    );
  }

  return (
    <MV
      src={src}
      alt={alt}
      camera-controls=""
      auto-rotate=""
      auto-rotate-delay="0"
      rotation-per-second="24deg"
      interaction-prompt="none"
      touch-action="pan-y"
      shadow-intensity="1"
      shadow-softness="1"
      exposure="1.1"
      camera-orbit="0deg 78deg 100%"
      min-camera-orbit="auto auto 60%"
      max-camera-orbit="auto auto 160%"
      className={className}
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    />
  );
}
