"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Demo koddaki `@/components/ui/stats-card-1` projede yoktu; sifirdan
 * yazildi. shadcn tokenlari (bg-card, text-muted-foreground) yerine
 * projenin mercan/charcoal paleti kullanildi.
 */
export function StatsCard({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  index = 0,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  index?: number;
}) {
  const renk =
    changeType === "positive"
      ? "text-emerald-600"
      : changeType === "negative"
        ? "text-red-500"
        : "text-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#33323a]/60">{title}</span>
        <span className="text-[#d9594c]">{icon}</span>
      </div>
      <div className="mt-3 font-serif text-2xl font-bold text-[#33323a]">
        {value}
      </div>
      {change && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${renk}`}>
          {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
          {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
          {change}
        </div>
      )}
    </motion.div>
  );
}
