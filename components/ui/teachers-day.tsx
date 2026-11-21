"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { TeachersDaySettings } from "@/lib/teachers-day";

/** Hilal ve yildiz — Ataturk portresi yuklenmemisse zarif bir amblem olarak gosterilir */
function HilalYildiz({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <mask id="hilal-mask">
          <rect width="100" height="100" fill="white" />
          <circle cx="42" cy="50" r="27" fill="black" />
        </mask>
      </defs>
      <circle cx="35" cy="50" r="31" fill="currentColor" mask="url(#hilal-mask)" />
      <path
        d="m70 50 4.7 9.6 10.6 1.5-7.7 7.5 1.8 10.5L70 73.9l-9.4 5 1.8-10.5-7.7-7.5 10.6-1.5Z"
        fill="currentColor"
        transform="translate(0 -9)"
      />
    </svg>
  );
}

/**
 * 24 Kasim Ogretmenler Gunu bolumu. Icerik admin panelinden
 * ("Öğretmenler Günü" sekmesi) duzenlenir; gorunurluk de oradan
 * (otomatik / her zaman / gizli) yonetilir.
 */
export default function TeachersDay({ settings }: { settings: TeachersDaySettings }) {
  const paragraflar = settings.message
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="ogretmenler-gunu"
      className="relative overflow-hidden bg-[#0a1630] px-6 py-24 text-[#f4efe6] lg:px-10 lg:py-32"
    >
      {/* Arka plan: kirmizi isik + ince yildizlar */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[#e30a17]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#c9a24b]/10 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #fff8 50%, transparent 51%), radial-gradient(1px 1px at 70% 20%, #fff6 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 65%, #fff7 50%, transparent 51%), radial-gradient(1px 1px at 35% 80%, #fff5 50%, transparent 51%), radial-gradient(1px 1px at 55% 55%, #fff4 50%, transparent 51%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Portre / amblem */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="relative">
            <div className="absolute -inset-3 rounded-t-[999px] rounded-b-3xl border border-[#c9a24b]/40" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-2xl border border-[#c9a24b]/60 bg-gradient-to-b from-[#13264d] to-[#0a1630] shadow-2xl shadow-black/40">
              {settings.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.photo}
                  alt="Mustafa Kemal Atatürk"
                  className="h-full w-full object-cover object-top [filter:grayscale(1)_contrast(1.05)]"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-6 pb-8">
                  <HilalYildiz className="h-28 w-28 text-[#e30a17] drop-shadow-[0_0_24px_rgba(227,10,23,0.45)]" />
                  <div className="text-center">
                    <div className="font-serif text-2xl font-bold tracking-[0.3em] text-[#f4efe6]">
                      ATATÜRK
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.35em] text-[#c9a24b]">
                      Başöğretmen
                    </div>
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1630]/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#c9a24b]/60 bg-[#0a1630] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c9a24b]">
              <GraduationCap className="h-4 w-4" />
              Başöğretmenimiz
            </div>
          </div>
        </motion.div>

        {/* Metin */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#e8b4b8]">
            <span className="h-px w-10 bg-[#c9a24b]" />
            {settings.eyebrow}
          </div>

          <h2 className="mt-5 font-serif text-4xl font-bold leading-tight lg:text-5xl">
            {settings.title}
          </h2>

          <div className="mt-8 space-y-5 text-[15px] leading-[1.85] text-[#f4efe6]/80">
            {paragraflar.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {settings.quote && (
            <blockquote className="mt-9 border-l-2 border-[#e30a17] pl-5">
              <p className="font-serif text-2xl italic leading-snug text-[#f4efe6]">
                &ldquo;{settings.quote}&rdquo;
              </p>
              {settings.quoteAuthor && (
                <footer className="mt-2 text-xs uppercase tracking-[0.25em] text-[#c9a24b]">
                  — {settings.quoteAuthor}
                </footer>
              )}
            </blockquote>
          )}

          {settings.promo && (
            <p className="mt-8 inline-block rounded-full border border-[#c9a24b]/50 bg-[#c9a24b]/10 px-5 py-2 text-sm text-[#f0d9a0]">
              {settings.promo}
            </p>
          )}

          {settings.ctaLabel && (
            <div className="mt-9">
              <Link
                href={settings.ctaHref || "/katalog"}
                className="group inline-flex items-center gap-3 rounded-full bg-[#e30a17] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#e30a17]/30 transition-colors hover:bg-[#c8091a]"
              >
                {settings.ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
