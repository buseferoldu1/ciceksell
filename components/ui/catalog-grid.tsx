"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import ProductCard from "./product-card";

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

export default function CatalogGrid({ products }: { products: Product[] }) {
  const { addItem, count, openCart } = useCart();

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3]">
      {/* Baslik cubugu */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#131314]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
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
                  {products.length} ürün
                </span>
              </h1>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={openCart}
            aria-label="Sepeti aç"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e2e3]/15 hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
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

      {/* Urun gridi */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-10"
      >
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} onAdd={addItem} />
        ))}
      </motion.div>
    </div>
  );
}
