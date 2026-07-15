"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Imlec yaklastikca ogeyi hafifce imlece dogru ceker (manyetik his).
 * Fare cikinca yumusakca yerine doner. Dokunmatik cihazlarda etkisizdir.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  /** 0-1 arasi: 1 = imleci birebir takip eder */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const config = { stiffness: 260, damping: 20, mass: 0.4 };
  const sx = useSpring(x, config);
  const sy = useSpring(y, config);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
