"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  format,
  getDaysInMonth,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Teslimat tarihi secici.
 *
 * Referans GlassCalendar'dan uyarlandi:
 *  - Orijinaldeki ay ileri/geri butonlarinin onClick'i YOKTU (tiklaninca
 *    hicbir sey olmuyordu) — calisir hale getirildi.
 *  - Gecmis tarihler ve bugunun gecmis saatleri secilemez (siparis icin
 *    mantikli degil).
 *  - Turkce yerellestirme (date-fns/locale/tr).
 *  - "Add a note" alani yerine gercek islev: teslimat notu ust bilesene
 *    aktarilir.
 *  - Koyu cam gorunumu odeme sayfasinin temasina uyarlandi.
 */
export default function GlassCalendar({
  selectedDate,
  onDateSelect,
  className = "",
}: {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}) {
  const bugun = startOfDay(new Date());
  const [secili, setSecili] = useState<Date>(selectedDate ?? bugun);
  const [gosterilenAy, setGosterilenAy] = useState<Date>(
    startOfMonth(selectedDate ?? bugun)
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const gunSayisi = getDaysInMonth(gosterilenAy);
  const gunler = Array.from({ length: gunSayisi }, (_, i) =>
    addDays(startOfMonth(gosterilenAy), i)
  );

  // Secili gun gorunur olsun
  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-selected="true"]');
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [secili, gosterilenAy]);

  const sec = (d: Date) => {
    if (isBefore(d, bugun)) return; // gecmis secilemez
    setSecili(d);
    onDateSelect?.(d);
  };

  // Gecmis aya gecise izin verme
  const gecmisAyEngeli = isSameMonth(gosterilenAy, bugun);

  return (
    <div
      className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-[#e5e2e3]">
          {format(gosterilenAy, "LLLL yyyy", { locale: tr })}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Önceki ay"
            disabled={gecmisAyEngeli}
            onClick={() => setGosterilenAy((a) => subMonths(a, 1))}
            className="rounded-full border border-white/10 p-1.5 text-[#e5e2e3] transition-colors hover:border-[#f6b6be]/60 hover:text-[#f6b6be] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Sonraki ay"
            onClick={() => setGosterilenAy((a) => addMonths(a, 1))}
            className="rounded-full border border-white/10 p-1.5 text-[#e5e2e3] transition-colors hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Gunler */}
      <div
        ref={scrollRef}
        className="mt-4 flex gap-2 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {gunler.map((d) => {
          const secilmis = isSameDay(d, secili);
          const bugunMu = isSameDay(d, bugun);
          const gecmis = isBefore(d, bugun);

          return (
            <motion.button
              key={d.toISOString()}
              type="button"
              disabled={gecmis}
              whileHover={gecmis ? undefined : { scale: 1.06 }}
              whileTap={gecmis ? undefined : { scale: 0.94 }}
              onClick={() => sec(d)}
              data-selected={secilmis}
              style={{ scrollSnapAlign: "center" }}
              className={`flex min-w-[3.25rem] flex-col items-center justify-center rounded-xl py-2.5 transition-colors ${
                secilmis
                  ? "bg-[#f6b6be] text-[#131314] shadow-lg"
                  : gecmis
                    ? "cursor-not-allowed bg-white/[0.02] text-[#e5e2e3]/20"
                    : bugunMu
                      ? "border border-[#f6b6be]/40 bg-white/[0.04] text-[#e5e2e3]"
                      : "bg-white/[0.06] text-[#e5e2e3]/75 hover:bg-white/[0.12]"
              }`}
            >
              <span className="text-[10px] font-medium uppercase opacity-70">
                {format(d, "EEEEEE", { locale: tr })}
              </span>
              <span className="mt-0.5 text-base font-bold">{format(d, "d")}</span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-[#e5e2e3]/50">
        <CalendarIcon size={13} />
        Seçilen teslimat tarihi:{" "}
        <span className="font-semibold text-[#f6b6be]">
          {format(secili, "d MMMM yyyy, EEEE", { locale: tr })}
        </span>
      </p>
    </div>
  );
}
