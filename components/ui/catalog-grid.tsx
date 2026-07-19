"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft, Search, ShoppingBag, X } from "lucide-react";
import { CATEGORIES, type CategoryKey, type Product } from "@/lib/products";

type SortKey = "varsayilan" | "fiyat-artan" | "fiyat-azalan";

const SORT_LABELS: Record<SortKey, string> = {
  varsayilan: "Sıralama: Varsayılan",
  "fiyat-artan": "Fiyat: Düşükten Yükseğe",
  "fiyat-azalan": "Fiyat: Yüksekten Düşüğe",
};
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
  const [kategori, setKategori] = useState<CategoryKey | "katalog">("katalog");
  const [sort, setSort] = useState<SortKey>("varsayilan");

  const filtered = useMemo(() => {
    const q = normalize(query);
    let liste = products;
    if (kategori !== "katalog") {
      liste = liste.filter((p) => p.category === kategori);
    }
    if (q) {
      liste = liste.filter(
        (p) => normalize(p.name).includes(q) || normalize(p.tag).includes(q)
      );
    }
    if (sort === "fiyat-artan") {
      liste = [...liste].sort((a, b) => a.price - b.price);
    } else if (sort === "fiyat-azalan") {
      liste = [...liste].sort((a, b) => b.price - a.price);
    }
    return liste;
  }, [products, query, kategori, sort]);

  const kategoriSayaci = useMemo(() => {
    const sayac: Partial<Record<CategoryKey, number>> = {};
    for (const p of products) sayac[p.category] = (sayac[p.category] ?? 0) + 1;
    return sayac;
  }, [products]);

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

            {/* Fiyat sıralama */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sıralama"
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-[#e5e2e3] outline-none focus:border-[#f6b6be]/60"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k} className="bg-[#131314]">
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>

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

        {/* Kategori filtresi */}
        <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-2 px-6 pb-4 lg:px-10">
          {CATEGORIES.map((c) => {
            const sayi = c.key === "katalog" ? products.length : kategoriSayaci[c.key] ?? 0;
            if (c.key !== "katalog" && sayi === 0) return null;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setKategori(c.key)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  kategori === c.key
                    ? "border-[#f6b6be] bg-[#f6b6be]/15 text-[#f6b6be]"
                    : "border-white/15 text-[#e5e2e3]/60 hover:border-white/30"
                }`}
              >
                {c.label} <span className="text-[#e5e2e3]/40">({sayi})</span>
              </button>
            );
          })}
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
