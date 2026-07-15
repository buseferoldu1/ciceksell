"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Siparis onaylandiginda merkezden disari sacilan cicek yapraklari.
 * Tek seferlik kutlama animasyonu.
 */
export default function PetalBurst({ count = 22 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 140 + Math.random() * 220;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotate: Math.random() * 720 - 360,
          scale: 0.5 + Math.random() * 0.7,
          duration: 1.4 + Math.random() * 1.2,
          color: ["#f6b6be", "#f9cdd3", "#d9594c", "#f3a6b0"][i % 4],
        };
      }),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: [0, p.y * 0.6, p.y + 120],
            opacity: [0, 1, 1, 0],
            scale: p.scale,
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.25, 0.7, 1],
          }}
          className="absolute h-3 w-2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
          style={{ background: p.color }}
        />
      ))}
    </div>
  );
}
