"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft, Search, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import ProductCard from "./product-card";

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

// Turkce arama icin: buyuk/kucuk ve aksan farklarini yok say
const normalize = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();

export default function CatalogGrid({
  products,
  initialQuery = "",
}: {
  products: Product[];
  initialQuery?: string;
}) {
  const { addItem, count, openCart } = useCart();
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return products;
    return products.filter(
      (p) => normalize(p.name).includes(q) || normalize(p.tag).includes(q)
    );
  }, [products, query]);

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3]">
      {/* Baslik cubugu */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#131314]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-[#f6b6be]/40 px-4 py-2 text-xs font-medium transition-colors hover:border-[#f6b6be] hover:text-[#f6b6be]"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <div>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-[#f6b6be] sm:block">
                Çiçeksel
              </span>
              <h1 className="font-serif text-2xl font-bold lg:text-3xl">
                Katalog
                <span className="ml-2 text-sm font-normal text-[#e5e2e3]/40">
                  {filtered.length} ürün
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Arama */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e5e2e3]/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Çiçek ara..."
                aria-label="Çiçek ara"
                className="w-44 rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-8 text-sm outline-none transition-all placeholder:text-[#e5e2e3]/30 focus:w-56 focus:border-[#f6b6be]/60 sm:w-56 sm:focus:w-72"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Aramayı temizle"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#e5e2e3]/40 transition-colors hover:text-[#f6b6be]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <motion.button
              type="button"
              onClick={openCart}
              aria-label="Sepeti aç"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e5e2e3]/15 hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f6b6be] px-1 text-[10px] font-bold text-[#131314]">
                  {count}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sonuc yok */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl px-6 py-24 text-center"
        >
          <Search className="mx-auto mb-4 h-10 w-10 text-[#e5e2e3]/20" />
          <p className="text-lg text-[#e5e2e3]/70">
            &ldquo;{query}&rdquo; için sonuç bulunamadı.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-6 rounded-full border border-[#f6b6be]/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#f6b6be] transition-colors hover:bg-[#f6b6be] hover:text-[#131314]"
          >
            Tüm Ürünleri Göster
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-10"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onAdd={addItem}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
