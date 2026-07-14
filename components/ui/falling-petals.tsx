"use client";

import { useEffect, useState } from "react";

interface FallingPetalsProps {
  count?: number;
  color?: string;
  className?: string;
}

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

// Hafif, CSS tabanli ambiyans: yumusakca suzulup dusen cicek yapraklari.
// Rastgele degerler yalnizca istemcide uretilir (SSR uyumsuzlugu olmaz).
export default function FallingPetals({
  count = 14,
  color = "#f6b6be",
  className = "",
}: FallingPetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        size: 10 + Math.round(Math.random() * 14),
        duration: 9 + Math.random() * 9,
        delay: -Math.random() * 12,
        drift: (Math.random() * 2 - 1) * 60,
        opacity: 0.25 + Math.random() * 0.4,
      }))
    );
  }, [count]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal-fall absolute top-[-6%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            background: color,
            borderRadius: "0 100% 0 100%",
            // @ts-expect-error CSS ozel degiskenleri
            "--drift": `${p.drift}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
