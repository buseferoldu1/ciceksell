"use client";

import { Star } from "lucide-react";

/**
 * Kayan (marquee) musteri yorumlari.
 * Demo koddaki `@/components/blocks/testimonials-with-marquee` projede yoktu;
 * sifirdan yazildi ve mercan/charcoal paletine uyarlandi.
 * Kayma CSS animasyonuyla yapilir (JS yok -> ucuz), imlec uzerindeyken durur.
 */

export interface Testimonial {
  author: {
    name: string;
    /** Sehir veya kisa etiket */
    handle: string;
    /** Avatar yoksa bas harflerden rozet uretilir */
    avatar?: string;
  };
  text: string;
  href?: string;
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const basHarfler = t.author.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const Card = (
    <div className="flex h-full w-[22rem] shrink-0 flex-col rounded-2xl border border-[#d9594c]/12 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#d9594c] text-[#d9594c]" />
        ))}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-slate-600">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3">
        {t.author.avatar ? (
          <img
            src={t.author.avatar}
            alt={t.author.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9594c]/10 text-xs font-bold text-[#d9594c]">
            {basHarfler}
          </span>
        )}
        <div>
          <div className="text-sm font-semibold text-[#33323a]">
            {t.author.name}
          </div>
          <div className="text-xs text-slate-400">{t.author.handle}</div>
        </div>
      </div>
    </div>
  );

  return t.href ? (
    <a href={t.href} target="_blank" rel="noopener noreferrer">
      {Card}
    </a>
  ) : (
    Card
  );
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
}: {
  title: string;
  description: string;
  testimonials: Testimonial[];
}) {
  // Kesintisiz dongu icin liste iki kez basilir
  const sira = [...testimonials, ...testimonials];

  return (
    <section id="yorumlar" className="overflow-hidden bg-white py-24">
      <div className="mx-auto mb-14 max-w-2xl px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-[#33323a] md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-lg text-slate-600">{description}</p>
      </div>

      {/* Kayan serit; kenarlarda yumusak silinme */}
      <div className="group relative">
        <div className="marquee-track flex w-max gap-6 group-hover:[animation-play-state:paused]">
          {sira.map((t, i) => (
            <TestimonialCard key={`${t.author.name}-${i}`} t={t} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
