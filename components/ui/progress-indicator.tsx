"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * Adim gostergesi (Sepet -> Teslimat -> Odeme -> Onay).
 * Demo koddaki `@/components/ui/progress-indicator` projede yoktu;
 * sifirdan yazildi ve odeme akisina baglandi.
 */
export default function ProgressIndicator({
  steps,
  current,
  className = "",
}: {
  /** Adim etiketleri */
  steps: string[];
  /** 0 tabanli aktif adim; steps.length ise tamami bitmis demektir */
  current: number;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center">
        {steps.map((label, i) => {
          const tamamlandi = i < current;
          const aktif = i === current;
          const sonuncu = i === steps.length - 1;

          return (
            <li
              key={label}
              className={`flex items-center ${sonuncu ? "" : "flex-1"}`}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.span
                  initial={false}
                  animate={{
                    scale: aktif ? 1.1 : 1,
                    backgroundColor: tamamlandi
                      ? "#d9594c"
                      : aktif
                        ? "#d9594c"
                        : "rgba(255,255,255,0.06)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold ${
                    tamamlandi || aktif
                      ? "border-[#d9594c] text-white"
                      : "border-white/15 text-[#e5e2e3]/40"
                  }`}
                >
                  {tamamlandi ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    i + 1
                  )}
                </motion.span>
                <span
                  className={`whitespace-nowrap text-[11px] font-medium ${
                    aktif
                      ? "text-[#f6b6be]"
                      : tamamlandi
                        ? "text-[#e5e2e3]/70"
                        : "text-[#e5e2e3]/35"
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Adimlar arasi cizgi: tamamlandikca dolar */}
              {!sonuncu && (
                <div className="relative mx-2 -mt-6 h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: tamamlandi ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-[#d9594c]"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
