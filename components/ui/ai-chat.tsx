"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flower2,
  Gift,
  MessageCircle,
  Send,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import { cevapUret, type AsistanCevabi } from "@/lib/assistant";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import { useContactSettings } from "@/components/site-settings-context";

/**
 * Referans AnimatedAIChat'ten uyarlandi:
 *  - Koyu/mavi tema yerine projenin mercan/charcoal paleti
 *  - Demo komutlari (Clone UI, Import Figma...) yerine gercek cicekci
 *    kisayollari
 *  - Sahte "otomatik yanit" yerine site verisine bakan gercek asistan
 *    (lib/assistant.ts) — urun onerir, fiyat/teslimat bilgisi verir
 *  - Sohbet paneli olarak calisir (sag altta acilir kapanir)
 */

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  urunler?: Product[];
  oneriler?: string[];
};

const KISAYOLLAR = [
  { label: "Ne alsam?", icon: <Gift className="h-3.5 w-3.5" />, soru: "Ne alsam bilmiyorum, öneri ister misin" },
  { label: "Teslimat", icon: <Truck className="h-3.5 w-3.5" />, soru: "Teslimat ne kadar sürer?" },
  { label: "Bakım", icon: <Sparkles className="h-3.5 w-3.5" />, soru: "Çiçek bakımı nasıl olmalı?" },
  { label: "İletişim", icon: <MessageCircle className="h-3.5 w-3.5" />, soru: "İletişim bilgileriniz nedir?" },
];

export default function AiChat({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [yaziyor, setYaziyor] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Merhaba! Ben Çiçeksel asistanıyım 🌸 Size nasıl yardımcı olabilirim? Kimin için çiçek aradığınızı söylerseniz öneri yapabilirim.",
      oneriler: ["Sevgilime ne alsam?", "Aynı gün teslimat var mı?", "1000 TL bütçem var"],
    },
  ]);
  const { addItem } = useCart();
  const contact = useContactSettings();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, yaziyor]);

  const gonder = (text: string) => {
    if (!text.trim() || yaziyor) return;
    setMessages((p) => [
      ...p,
      { id: `${Date.now()}`, role: "user", content: text },
    ]);
    setInput("");
    setYaziyor(true);

    // Kisa bir dusunme gecikmesi (daha dogal his)
    setTimeout(() => {
      const cevap: AsistanCevabi = cevapUret(text, products, contact);
      setMessages((p) => [
        ...p,
        {
          id: `${Date.now() + 1}`,
          role: "ai",
          content: cevap.text,
          urunler: cevap.urunler,
          oneriler: cevap.oneriler,
        },
      ]);
      setYaziyor(false);
    }, 550);
  };

  return (
    <>
      {/* Acma butonu — WhatsApp'in ustunde */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Asistanı kapat" : "Çiçeksel asistanına sor"}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="group fixed bottom-[5.5rem] right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#d9594c] text-white shadow-lg shadow-[#d9594c]/30 transition-colors hover:bg-[#c2493d]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span key="f" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Flower2 className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[#33323a] px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Asistana sorun
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-[9.75rem] right-5 z-[60] flex h-[30rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl"
          >
            {/* Baslik */}
            <div className="flex items-center gap-3 border-b border-black/5 bg-[#f4f2ef] px-5 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9594c]/10">
                <Flower2 className="h-4 w-4 text-[#d9594c]" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-bold text-[#33323a]">
                  Çiçeksel Asistanı
                </div>
                <div className="text-[11px] text-[#33323a]/45">
                  Genelde anında yanıtlar
                </div>
              </div>
            </div>

            {/* Mesajlar */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-start gap-2.5 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        msg.role === "user"
                          ? "bg-[#33323a] text-white"
                          : "bg-[#d9594c]/10 text-[#d9594c]"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Flower2 className="h-3.5 w-3.5" />
                      )}
                    </span>

                    <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                      <div
                        className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? "rounded-tr-sm bg-[#33323a] text-white"
                            : "rounded-tl-sm bg-[#f4f2ef] text-[#33323a]"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Onerilen urunler */}
                      {msg.urunler && msg.urunler.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.urunler.map((u) => (
                            <div
                              key={u.id}
                              className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-white p-2 shadow-sm"
                            >
                              <img
                                src={u.image}
                                alt={u.name}
                                className="h-11 w-11 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-semibold text-[#33323a]">
                                  {u.name}
                                </div>
                                <div className="text-xs font-bold text-[#d9594c]">
                                  {formatPrice(u.price)}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => addItem(u)}
                                className="shrink-0 rounded-full bg-[#d9594c] px-2.5 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#c2493d]"
                              >
                                Ekle
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Takip sorulari */}
                      {msg.oneriler && msg.oneriler.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.oneriler.map((o) => (
                            <button
                              key={o}
                              type="button"
                              onClick={() => gonder(o)}
                              className="rounded-full border border-[#d9594c]/25 bg-white px-2.5 py-1 text-[11px] text-[#d9594c] transition-colors hover:bg-[#d9594c]/10"
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Yaziyor gostergesi */}
              {yaziyor && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9594c]/10">
                    <Flower2 className="h-3.5 w-3.5 text-[#d9594c]" />
                  </span>
                  <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-[#f4f2ef] px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="h-1.5 w-1.5 rounded-full bg-[#33323a]/30"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Kisayollar + giris */}
            <div className="border-t border-black/5 bg-[#f4f2ef]/60 p-3">
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {KISAYOLLAR.map((k) => (
                  <button
                    key={k.label}
                    type="button"
                    onClick={() => gonder(k.soru)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-medium text-[#33323a]/70 transition-colors hover:border-[#d9594c]/40 hover:text-[#d9594c]"
                  >
                    {k.icon}
                    {k.label}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  gonder(input);
                }}
                className="relative flex items-center"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bir şey sorun..."
                  className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-4 pr-11 text-sm text-[#33323a] outline-none transition-colors placeholder:text-[#33323a]/30 focus:border-[#d9594c]/60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || yaziyor}
                  aria-label="Gönder"
                  className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#d9594c] text-white transition-colors hover:bg-[#c2493d] disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
