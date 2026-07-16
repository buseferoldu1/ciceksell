"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flower2, Minus, Plus, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";

// 3D sahne yalnizca tarayicida yuklenir (three.js SSR'da calismaz)
const BouquetScene = dynamic(() => import("@/components/ui/bouquet-scene"), {
  ssr: false,
});
import {
  FLOWER_OPTIONS,
  MIN_STEMS,
  WRAP_OPTIONS,
  bouquetDescription,
  bouquetTotals,
  type BouquetSelection,
} from "@/lib/bouquet";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";

/**
 * Kendi Buketini Olustur — Atolye sayfasinda.
 * Musteri cicek turlerini ve adetlerini secer, ambalaj belirler; fiyat
 * canli hesaplanir ve buket sepete ozel urun olarak eklenir.
 */
export default function BouquetBuilder() {
  const { addItem, openCart } = useCart();
  const [stems, setStems] = useState<Record<string, number>>({});
  const [wrapId, setWrapId] = useState(WRAP_OPTIONS[0].id);
  const [eklendi, setEklendi] = useState(false);

  const sel: BouquetSelection = useMemo(() => ({ stems, wrapId }), [stems, wrapId]);
  const t = useMemo(() => bouquetTotals(sel), [sel]);

  const degistir = (id: string, delta: number) => {
    setEklendi(false);
    setStems((p) => {
      const yeni = Math.max(0, Math.min(99, (p[id] ?? 0) + delta));
      const kopya = { ...p };
      if (yeni === 0) delete kopya[id];
      else kopya[id] = yeni;
      return kopya;
    });
  };

  const sifirla = () => {
    setStems({});
    setWrapId(WRAP_OPTIONS[0].id);
    setEklendi(false);
  };

  const sepeteEkle = () => {
    if (!t.yeterli) return;
    const urun: Product = {
      // Her ozel buket ayri satir olsun diye benzersiz id
      id: `ozel-${Date.now().toString(36)}`,
      name: "Özel Buketiniz",
      tag: bouquetDescription(sel),
      price: t.total,
      // Sepette gorunecek temsili gorsel: en cok secilen cicek
      image:
        FLOWER_OPTIONS.find(
          (f) =>
            f.id ===
            Object.entries(stems).sort((a, b) => b[1] - a[1])[0]?.[0]
        )?.image ?? FLOWER_OPTIONS[0].image,
      category: "katalog",
    };
    addItem(urun);
    setEklendi(true);
    openCart();
    // Yeni buket icin formu temizle
    setTimeout(() => {
      setStems({});
      setWrapId(WRAP_OPTIONS[0].id);
    }, 400);
  };

  const bosMu = t.stemCount === 0;

  return (
    <section id="buket-olustur" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f6b6be]/30 bg-[#f6b6be]/10 px-4 py-1.5 text-sm font-medium text-[#f6b6be]">
            <Sparkles className="h-4 w-4" />
            Atölye
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-[#e5e2e3] md:text-4xl">
            Kendi Buketini Oluştur
          </h2>
          <p className="mt-4 text-lg text-[#e5e2e3]/60">
            Çiçekleri siz seçin, ustalarımız hazırlasın. En az {MIN_STEMS} dal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Sol: cicek secimi */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#e5e2e3]/40">
              1. Çiçekleri seçin
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FLOWER_OPTIONS.map((f, i) => {
                const adet = stems[f.id] ?? 0;
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`overflow-hidden rounded-2xl border transition-colors ${
                      adet > 0
                        ? "border-[#f6b6be]/60 bg-[#f6b6be]/[0.07]"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={f.image}
                        alt={f.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {adet > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f6b6be] px-1.5 text-xs font-bold text-[#131314]"
                        >
                          {adet}
                        </motion.span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-semibold text-[#e5e2e3]">
                        {f.name}
                      </div>
                      <div className="text-[11px] text-[#e5e2e3]/40">{f.note}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#f6b6be]">
                          {formatPrice(f.price)}
                          <span className="font-normal text-[#e5e2e3]/40"> /dal</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => degistir(f.id, -1)}
                            disabled={adet === 0}
                            aria-label={`${f.name} azalt`}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-[#e5e2e3] transition-colors hover:border-[#f6b6be]/60 disabled:opacity-25"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => degistir(f.id, 1)}
                            aria-label={`${f.name} ekle`}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-[#e5e2e3] transition-colors hover:border-[#f6b6be]/60"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Ambalaj */}
            <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-widest text-[#e5e2e3]/40">
              2. Sunumu seçin
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WRAP_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setWrapId(w.id);
                    setEklendi(false);
                  }}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    wrapId === w.id
                      ? "border-[#f6b6be]/60 bg-[#f6b6be]/[0.07]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#e5e2e3]">
                      {w.name}
                    </span>
                    {wrapId === w.id && (
                      <Check className="h-3.5 w-3.5 text-[#f6b6be]" />
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#e5e2e3]/40">
                    {w.note}
                  </div>
                  <div className="mt-1.5 text-xs font-bold text-[#f6b6be]">
                    {w.price === 0 ? "Ücretsiz" : `+${formatPrice(w.price)}`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sag: canli ozet */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-serif text-lg font-bold text-[#e5e2e3]">
                Buketiniz
              </h3>

              {/* Canli 3D onizleme */}
              <div className="relative mb-5 h-56 overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.06] to-transparent">
                {bosMu ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[#e5e2e3]/25">
                    <Flower2 className="h-8 w-8" />
                    <span className="text-xs">Çiçek ekleyin, 3D önizleyin</span>
                  </div>
                ) : (
                  <>
                    <BouquetScene
                      stems={stems}
                      wrapId={wrapId}
                      className="absolute inset-0 h-full w-full"
                    />
                    <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/60">
                      Sürükleyip döndürün
                    </span>
                  </>
                )}
              </div>

              {/* Dokum */}
              <div className="space-y-2 text-sm">
                {Object.entries(stems).length === 0 && (
                  <p className="text-xs text-[#e5e2e3]/35">
                    Henüz çiçek seçmediniz.
                  </p>
                )}
                {Object.entries(stems).map(([id, n]) => {
                  const f = FLOWER_OPTIONS.find((x) => x.id === id)!;
                  return (
                    <div key={id} className="flex justify-between text-[#e5e2e3]/70">
                      <span>
                        {n} × {f.name}
                      </span>
                      <span>{formatPrice(f.price * n)}</span>
                    </div>
                  );
                })}
                {t.stemCount > 0 && (
                  <div className="flex justify-between border-t border-white/10 pt-2 text-[#e5e2e3]/70">
                    <span>{t.wrap.name}</span>
                    <span>
                      {t.wrapPrice === 0 ? "Ücretsiz" : formatPrice(t.wrapPrice)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 font-serif text-lg font-bold text-[#e5e2e3]">
                  <span>Toplam</span>
                  <motion.span
                    key={t.total}
                    initial={{ scale: 1.15, color: "#f9cdd3" }}
                    animate={{ scale: 1, color: "#f6b6be" }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatPrice(t.total)}
                  </motion.span>
                </div>
                <div className="text-[11px] text-[#e5e2e3]/35">
                  {t.stemCount} dal
                  {!t.yeterli && t.stemCount > 0 && (
                    <span className="text-[#f6b6be]">
                      {" "}
                      — en az {MIN_STEMS} dal gerekiyor
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                type="button"
                onClick={sepeteEkle}
                disabled={!t.yeterli}
                whileHover={t.yeterli ? { scale: 1.03 } : undefined}
                whileTap={t.yeterli ? { scale: 0.97 } : undefined}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#f6b6be] py-3.5 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {eklendi ? (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Sepete Eklendi
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Sepete Ekle
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {t.stemCount > 0 && (
                <button
                  type="button"
                  onClick={sifirla}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 text-[11px] text-[#e5e2e3]/40 transition-colors hover:text-[#f6b6be]"
                >
                  <RotateCcw className="h-3 w-3" />
                  Sıfırla
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
