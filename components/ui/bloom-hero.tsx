"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { CATALOG, formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import FallingPetals from "./falling-petals";

interface Slide {
  script: string;
  headlineTop: string;
  headlineBottom: string;
  productId: string;
  // Vitrin gorseli urun fotografindan farkli olabilir (editoryel/sanatsal)
  heroImage?: string;
}

const SLIDE_DEFS: Slide[] = [
  {
    script: "Düğün",
    headlineTop: "Beyazın",
    headlineBottom: "Zarafeti",
    productId: "k30", // 21li Beyaz Lale Lüx
    heroImage: "/flowers/beyaz-zarafet.jpg",
  },
  {
    script: "Romantizm",
    headlineTop: "Zamansız",
    headlineBottom: "Aşk",
    productId: "k8", // Kutulu 101 Gül
  },
  {
    script: "Başsağlığı",
    headlineTop: "Sükûnet",
    headlineBottom: "Bahçesi",
    productId: "k21", // Kazablanka Mix Lüks
    heroImage: "/flowers/sukunet.jpg",
  },
];

export default function BloomHero({ products }: { products?: Product[] }) {
  const [index, setIndex] = useState(0);
  const { addItem } = useCart();

  // Admin panelinden urunler degisebilir: id ile bul, yoksa siradan sec
  const source = products && products.length > 0 ? products : CATALOG.katalog;
  const slides = SLIDE_DEFS.map((def, i) => ({
    ...def,
    product:
      source.find((p) => p.id === def.productId) ??
      source[Math.min(i, source.length - 1)],
  })).filter((s) => s.product);
  const slide = slides[index % slides.length];

  const go = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f4f2ef]">
      {/* Dekoratif yumusak lekeler */}
      <div className="pointer-events-none absolute -right-20 top-10 h-[36rem] w-[36rem] rounded-full bg-[#d9594c]/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-[#d9594c]/5 blur-3xl" />

      {/* Dusen cicek yapraklari */}
      <FallingPetals count={12} color="#d9594c" />

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-40 pt-28 lg:grid-cols-2 lg:px-10 lg:pb-24">
        {/* Sol: metin */}
        <div className="relative z-10 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <p className="font-serif text-3xl italic text-[#d9594c] lg:text-4xl">
                {slide.script}
              </p>
              <h1 className="mt-3 font-serif text-6xl font-bold leading-[0.95] tracking-tight text-[#33323a] lg:text-8xl">
                {slide.headlineTop}
                <br />
                {slide.headlineBottom}
              </h1>
              <p className="mt-6 max-w-md text-[#33323a]/60">
                {slide.product.tag} — sevdiklerinize doğanın en zarif hâlini,
                aynı gün teslimatla ulaştırın.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <span className="font-serif text-3xl font-bold text-[#d9594c]">
                  {formatPrice(slide.product.price)}
                </span>
                <motion.button
                  type="button"
                  onClick={() => addItem(slide.product)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 rounded-full bg-[#d9594c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#d9594c]/25 transition-colors hover:bg-[#c2493d]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Sepete Ekle
                </motion.button>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/katalog"
                    className="flex items-center gap-2 rounded-full border-2 border-[#33323a]/15 px-7 py-3 text-sm font-semibold text-[#33323a] transition-colors hover:border-[#d9594c] hover:text-[#d9594c]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Kataloğu Keşfet
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sag: dev cicek gorseli */}
        <div className="relative order-1 flex items-center justify-center lg:order-2">
          <div className="relative aspect-square w-full max-w-md lg:max-w-lg">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-[#efe9e4] shadow-[0_40px_80px_-20px_rgba(217,89,76,0.25)]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.product.id}
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 4 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-3"
              >
                <motion.img
                  src={slide.heroImage ?? slide.product.image}
                  alt={slide.product.name}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full w-full rounded-full object-cover ring-1 ring-black/5"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Alt: one cikan urun thumbnaillari + oklar */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 pb-8 lg:px-10">
          <div className="flex flex-1 gap-3 overflow-x-auto">
            {slides.map((s, i) => (
              <button
                key={s.product.id}
                type="button"
                onClick={() => go(i)}
                className={`flex min-w-[15rem] items-center gap-3 rounded-xl border bg-white/70 p-3 text-left backdrop-blur-sm transition-all ${
                  i === index
                    ? "border-[#d9594c]/40 shadow-md"
                    : "border-black/5 hover:border-[#d9594c]/20"
                }`}
              >
                <img
                  src={s.heroImage ?? s.product.image}
                  alt={s.product.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#d9594c]">
                    {s.script}
                  </div>
                  <div className="text-sm font-medium text-[#33323a]">
                    {s.product.name}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Önceki"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[#33323a] transition-colors hover:border-[#d9594c] hover:text-[#d9594c]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Sonraki"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[#33323a] transition-colors hover:border-[#d9594c] hover:text-[#d9594c]"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
