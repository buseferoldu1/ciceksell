"use client";

import { motion } from "framer-motion";
import { Rotate3d, ShoppingBag } from "lucide-react";
import { MODELS_3D, formatPrice } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import ModelViewer from "./model-viewer";

export default function ModelShowcase() {
  const { addItem } = useCart();

  return (
    <section id="uc-boyut" className="bg-[#f4f2ef] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d9594c]/25 bg-[#d9594c]/10 px-4 py-1.5 text-sm font-medium text-[#d9594c]">
            <Rotate3d className="h-4 w-4" />
            3D Koleksiyon
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-[#33323a] md:text-4xl">
            Çiçeği Her Açıdan Keşfedin
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Aranjmanı imlecinizle sürükleyerek 360° döndürün, en ince
            detayına kadar inceleyin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {MODELS_3D.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
            >
              <div className="relative h-[26rem] bg-gradient-to-b from-[#faf9f7] to-[#efe9e4]">
                {product.model && (
                  <ModelViewer
                    src={product.model}
                    alt={product.name}
                    className="h-full w-full"
                  />
                )}
                <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                  <Rotate3d className="h-3.5 w-3.5" />
                  Sürükleyerek döndür
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#33323a]">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">{product.tag}</p>
                  <div className="mt-2 font-serif text-lg font-bold text-[#d9594c]">
                    {formatPrice(product.price)}
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={() => addItem(product)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-[#d9594c] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#d9594c]/25 transition-colors hover:bg-[#c2493d]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Sepete Ekle
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
