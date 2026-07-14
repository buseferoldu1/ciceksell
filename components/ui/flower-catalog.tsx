"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { X } from "lucide-react";

export type CategoryKey = "guller" | "orkideler" | "ortancalar";

interface Product {
  id: string;
  name: string;
  tag: string;
  price: string;
  image: string;
}

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "guller", label: "Güller" },
  { key: "orkideler", label: "Orkideler" },
  { key: "ortancalar", label: "Ortancalar" },
];

// NOT: Gorseller picsum.photos placeholder'laridir — gercek urun
// fotograflarinizla degistirin.
const CATALOG: Record<CategoryKey, Product[]> = {
  guller: [
    { id: "g1", name: "Kadife Gece", tag: "Bordo Gül Buketi", price: "₺549", image: "https://picsum.photos/seed/gul-kadife/600/750" },
    { id: "g2", name: "Beyaz Masal", tag: "Beyaz Gül Aranjmanı", price: "₺449", image: "https://picsum.photos/seed/gul-beyaz/600/750" },
    { id: "g3", name: "Pembe Sabah", tag: "Pembe Gül Buketi", price: "₺479", image: "https://picsum.photos/seed/gul-pembe/600/750" },
    { id: "g4", name: "Kızıl Tutku", tag: "Kırmızı Gül Kutusu", price: "₺599", image: "https://picsum.photos/seed/gul-kizil/600/750" },
    { id: "g5", name: "Şampanya Rüyası", tag: "Krem Gül Aranjmanı", price: "₺649", image: "https://picsum.photos/seed/gul-sampanya/600/750" },
    { id: "g6", name: "Bahçe Romansı", tag: "Karışık Gül Sepeti", price: "₺529", image: "https://picsum.photos/seed/gul-bahce/600/750" },
  ],
  orkideler: [
    { id: "o1", name: "Kristal Beyaz", tag: "Tek Dal Beyaz Orkide", price: "₺749", image: "https://picsum.photos/seed/orkide-kristal/600/750" },
    { id: "o2", name: "Mor Düş", tag: "Çift Dal Mor Orkide", price: "₺799", image: "https://picsum.photos/seed/orkide-mor/600/750" },
    { id: "o3", name: "Fildişi Zarafet", tag: "Seramik Saksıda Orkide", price: "₺829", image: "https://picsum.photos/seed/orkide-fildisi/600/750" },
    { id: "o4", name: "Gün Doğumu", tag: "Sarı Benekli Orkide", price: "₺779", image: "https://picsum.photos/seed/orkide-gun/600/750" },
    { id: "o5", name: "Zümrüt Vadi", tag: "Yeşil Uçlu Orkide", price: "₺859", image: "https://picsum.photos/seed/orkide-zumrut/600/750" },
    { id: "o6", name: "İpek Dokunuş", tag: "Üç Dal Premium Orkide", price: "₺899", image: "https://picsum.photos/seed/orkide-ipek/600/750" },
  ],
  ortancalar: [
    { id: "h1", name: "Mavi Bulut", tag: "Mavi Ortanca Demeti", price: "₺389", image: "https://picsum.photos/seed/ortanca-mavi/600/750" },
    { id: "h2", name: "Lila Bahçe", tag: "Lila Ortanca Aranjmanı", price: "₺419", image: "https://picsum.photos/seed/ortanca-lila/600/750" },
    { id: "h3", name: "Pudra Küre", tag: "Pembe Ortanca Buketi", price: "₺399", image: "https://picsum.photos/seed/ortanca-pudra/600/750" },
    { id: "h4", name: "Okyanus Esintisi", tag: "Mavi-Beyaz Ortanca", price: "₺449", image: "https://picsum.photos/seed/ortanca-okyanus/600/750" },
    { id: "h5", name: "Beyaz Köpük", tag: "Beyaz Ortanca Sepeti", price: "₺429", image: "https://picsum.photos/seed/ortanca-beyaz/600/750" },
    { id: "h6", name: "Gökkuşağı Demeti", tag: "Karışık Ortanca", price: "₺469", image: "https://picsum.photos/seed/ortanca-gokkusagi/600/750" },
  ],
};

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

interface FlowerCatalogProps {
  initialCategory: CategoryKey;
  onClose: () => void;
}

export default function FlowerCatalog({
  initialCategory,
  onClose,
}: FlowerCatalogProps) {
  const [category, setCategory] = useState<CategoryKey>(initialCategory);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 110, damping: 22, mass: 0.9 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#131314] text-[#e5e2e3]"
    >
      {/* Baslik */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6b6be]">
            Çiçek Bankası
          </span>
          <h2 className="mt-1 font-serif text-3xl font-bold lg:text-4xl">
            Katalog
          </h2>
        </motion.div>
        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Kataloğu kapat"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e2e3]/15 text-[#e5e2e3] hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
        >
          <X className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Kategori sekmeleri */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mx-auto mt-8 flex w-full max-w-6xl gap-8 border-b border-[#e5e2e3]/10 px-6 lg:px-10"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              category === c.key
                ? "text-[#f6b6be]"
                : "text-[#e5e2e3]/50 hover:text-[#e5e2e3]"
            }`}
          >
            {c.label}
            {category === c.key && (
              <motion.span
                layoutId="catalog-tab-underline"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[#f6b6be]"
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Urun gridi */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            variants={gridVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-10"
          >
            {CATALOG[category].map((product, i) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{ y: -10, rotate: i % 2 === 0 ? -0.6 : 0.6 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {/* Nefes alma efekti */}
                  <motion.div
                    animate={{ scale: [1, 1.035, 1] }}
                    transition={{
                      duration: 4.5 + (i % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4,
                    }}
                    className="h-full w-full"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </motion.div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#131314]/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="absolute inset-x-4 bottom-4 translate-y-16 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      type="button"
                      className="w-full rounded-full bg-[#f6b6be] py-2.5 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3]"
                    >
                      İncele
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#e5e2e3]">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#e5e2e3]/50">
                      {product.tag}
                    </p>
                  </div>
                  <span className="font-serif text-lg font-bold text-[#f6b6be]">
                    {product.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
