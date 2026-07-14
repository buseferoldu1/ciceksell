"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-context";
import {
  formatPrice,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from "@/lib/products";

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, removeItem, setQty } = useCart();
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 160, damping: 24 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-[#1a1a1c] text-[#e5e2e3] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#f6b6be]" />
                <h2 className="font-serif text-xl font-bold">Sepetim</h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Sepeti kapat"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-[#e5e2e3]/20" />
                <p className="text-[#e5e2e3]/60">Sepetiniz henüz boş.</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-full border border-[#f6b6be]/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#f6b6be] transition-colors hover:bg-[#f6b6be] hover:text-[#131314]"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4 flex gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-16 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-serif font-bold">
                                {item.name}
                              </div>
                              <div className="text-xs text-[#e5e2e3]/50">
                                {item.tag}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`${item.name} ürününü kaldır`}
                              className="text-[#e5e2e3]/40 transition-colors hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setQty(item.id, item.qty - 1)}
                                aria-label="Adedi azalt"
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-[#f6b6be]/60"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(item.id, item.qty + 1)}
                                aria-label="Adedi artır"
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-[#f6b6be]/60"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-serif font-bold text-[#f6b6be]">
                              {formatPrice(item.price * item.qty)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-white/10 px-6 py-5">
                  <div className="mb-1 flex justify-between text-sm text-[#e5e2e3]/70">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="mb-3 flex justify-between text-sm text-[#e5e2e3]/70">
                    <span>Teslimat</span>
                    <span>
                      {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="mb-5 flex justify-between font-serif text-lg font-bold">
                    <span>Toplam</span>
                    <span className="text-[#f6b6be]">
                      {formatPrice(subtotal + shipping)}
                    </span>
                  </div>
                  <Link
                    href="/odeme"
                    onClick={closeCart}
                    className="block w-full rounded-full bg-[#f6b6be] py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3]"
                  >
                    Ödemeye Geç
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
