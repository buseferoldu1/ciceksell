"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { CATALOG, CATEGORIES, type CategoryKey } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import ProductCard from "./product-card";

export type { CategoryKey };

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
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
  const { addItem, count, openCart } = useCart();

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
            Çiçeksel
          </span>
          <h2 className="mt-1 font-serif text-3xl font-bold lg:text-4xl">
            Katalog
          </h2>
        </motion.div>
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={openCart}
            aria-label="Sepeti aç"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e2e3]/15 text-[#e5e2e3] hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f6b6be] px-1 text-[10px] font-bold text-[#131314]"
              >
                {count}
              </motion.span>
            )}
          </motion.button>
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
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onAdd={addItem}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
