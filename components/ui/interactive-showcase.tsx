"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from "lucide-react";
import FlowerCatalog from "./flower-catalog";
import ModelViewer from "./model-viewer";
import { useCart } from "@/components/cart/cart-context";
import type { CategoryKey } from "@/lib/products";

interface Flower {
  id: number;
  key: CategoryKey;
  category: string;
  name: string;
  description: string;
  origin: string;
  family: string;
  story: string;
  // Gorseller: Wikimedia Commons (bkz. public/flowers/ATTRIBUTION.md)
  image: string;
  thumbnail: string;
  // Imlecle 360 derece dondurulebilen 3D model (public/models/*.glb)
  model: string;
}

const FLOWERS: Flower[] = [
  {
    id: 1,
    key: "katalog",
    category: "Atölye Serisi",
    name: "Gül",
    description:
      "Kadife dokulu yaprakları ve zamansız zarafetiyle, tutkunun en klasik ifadesi.",
    origin: "Anadolu",
    family: "Rosaceae",
    story:
      "Güllerimiz gün doğumundan önce toplanır ve en yoğun kokusunu koruması için soğuk zincirde atölyemize taşınır.",
    image: "/flowers/gul.jpg",
    thumbnail: "/flowers/gul-thumb.jpg",
    model: "/models/gul-3d.glb",
  },
  {
    id: 2,
    key: "katalog",
    category: "Atölye Serisi",
    name: "Orkide",
    description:
      "Zarif kavisleri ve haftalarca süren ömrüyle, sadeliğin en gösterişli yorumu.",
    origin: "Güneydoğu Asya",
    family: "Orchidaceae",
    story:
      "Orkidelerimiz el işçiliğiyle hazırlanan özel serada haftalar süren bir olgunlaşma sürecinden geçer.",
    image: "/flowers/orkide.jpg",
    thumbnail: "/flowers/orkide-thumb.jpg",
    model: "/models/orkide-3d.glb",
  },
  {
    id: 3,
    key: "katalog",
    category: "Atölye Serisi",
    name: "Ortanca",
    description:
      "Bulut gibi kabaran taç yapraklarıyla, bereketin ve içten duyguların çiçeği.",
    origin: "Doğu Asya",
    family: "Hydrangeaceae",
    story:
      "Ortancalarımız toprağın asidine göre renk değiştirir; her demet doğanın o güne özel imzasını taşır.",
    image: "/flowers/ortanca.jpg",
    thumbnail: "/flowers/ortanca-thumb.jpg",
    model: "/models/ortanca-3d.glb",
  },
];

const NAV_LINKS = ["Koleksiyon", "Atölye", "İletişim"];
const SOCIALS = ["IG", "FB", "X"];

const textVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function InteractiveShowcase() {
  const [index, setIndex] = useState(0);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { count, openCart } = useCart();
  const flower = FLOWERS[index];

  const goTo = (i: number) => setIndex((i + FLOWERS.length) % FLOWERS.length);
  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

  // 360 derece dondurme model-viewer'in kendi imlec orbitiyle yapilir;
  // fare konumu yalnizca zemin golgesini kaydirir (derinlik hissi).
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 120, damping: 18 };
  const shadowX = useSpring(useTransform(mouseX, [0, 1], [10, -10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const resetMouse = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden text-[#e5e2e3]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr]">
        {/* Sol Sutun: Bilgi */}
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${flower.id}`}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6b6be]">
                {flower.category}
              </span>
              <h1 className="mt-4 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#e5e2e3] lg:text-6xl">
                {flower.name}
              </h1>
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-[#e5e2e3]/70">
                {flower.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`origin-${flower.id}`}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.05 }}
              className="flex gap-10 text-xs"
            >
              <div>
                <div className="uppercase tracking-widest text-[#e5e2e3]/40">
                  Köken
                </div>
                <div className="mt-1 font-medium text-[#e5e2e3]">
                  {flower.origin}
                </div>
              </div>
              <div>
                <div className="uppercase tracking-widest text-[#e5e2e3]/40">
                  Familya
                </div>
                <div className="mt-1 font-medium italic text-[#e5e2e3]">
                  {flower.family}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Merkez Sutun: Odak Gorsel */}
        <div
          className="relative flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={resetMouse}
        >
          <div className="pointer-events-none absolute h-[70%] w-[70%] rounded-full bg-[#f6b6be]/10 blur-3xl" />

          {/* Zemin golgesi: cicek nefes aldikca buyuyup kuculur, imlecle kayar */}
          <motion.div
            style={{ x: shadowX }}
            className="pointer-events-none absolute bottom-[7%] z-0 h-8 w-[46%]"
          >
            <motion.div
              animate={{ scaleX: [1, 0.88, 1], opacity: [0.55, 0.4, 0.55] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-full rounded-[50%] bg-black blur-xl"
            />
          </motion.div>

          <div className="relative z-10 flex h-[76%] max-h-[600px] w-full items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`model-${flower.id}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full"
              >
                {/* Nefes alma efekti */}
                <motion.div
                  animate={{ scale: [1, 1.045, 1] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-full w-full"
                >
                  {/* Imlecle surukleyerek 360 derece dondurulebilir */}
                  <ModelViewer
                    src={flower.model}
                    alt={flower.name}
                    className="h-full w-full"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Önceki çiçek"
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e2e3]/15 text-[#e5e2e3] transition-colors hover:border-[#f6b6be]/60 hover:text-[#f6b6be] lg:left-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Sonraki çiçek"
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e2e3]/15 text-[#e5e2e3] transition-colors hover:border-[#f6b6be]/60 hover:text-[#f6b6be] lg:right-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Sag Sutun: Detay */}
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-14">
          <nav className="flex items-center justify-end gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-[#e5e2e3]/70 transition-colors hover:text-[#f6b6be]"
              >
                {link}
              </a>
            ))}
            <button
              type="button"
              onClick={openCart}
              aria-label="Sepeti aç"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e2e3]/15 text-[#e5e2e3] transition-colors hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f6b6be] px-1 text-[10px] font-bold text-[#131314]">
                  {count}
                </span>
              )}
            </button>
          </nav>

          <div className="flex flex-col items-end text-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={`story-${flower.id}`}
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-end"
              >
                <img
                  src={flower.thumbnail}
                  alt={`${flower.name} önizleme`}
                  className="mb-6 h-16 w-16 rounded-full object-cover ring-1 ring-[#f6b6be]/40"
                />
                <p className="max-w-xs text-sm leading-relaxed text-[#e5e2e3]/70">
                  {flower.story}
                </p>
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setCatalogOpen(true)}
              className="mt-8 rounded-full border border-[#f6b6be]/50 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-[#f6b6be] transition-colors hover:bg-[#f6b6be] hover:text-[#131314]"
            >
              Detayları İncele
            </button>
          </div>

          <div className="flex justify-end gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social}
                href="#"
                aria-label={social}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e2e3]/15 text-xs font-semibold text-[#e5e2e3]/70 transition-colors hover:border-[#f6b6be]/60 hover:text-[#f6b6be]"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Alt orta: katalog butonu + gecis noktalari */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-4">
        <motion.button
          type="button"
          onClick={() => setCatalogOpen(true)}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="flex items-center gap-2 rounded-full bg-[#f6b6be] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#131314] shadow-lg shadow-[#f6b6be]/20 transition-colors hover:bg-[#f9cdd3]"
        >
          <Sparkles className="h-4 w-4" />
          Kataloğu Keşfet
        </motion.button>

        <div className="flex gap-3">
          {FLOWERS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${f.name} göster`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-[#f6b6be]" : "w-1.5 bg-[#e5e2e3]/25"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Katalog overlay */}
      <AnimatePresence>
        {catalogOpen && (
          <FlowerCatalog
            initialCategory={flower.key}
            onClose={() => setCatalogOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
