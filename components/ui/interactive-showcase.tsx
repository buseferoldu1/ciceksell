"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Flower {
  id: number;
  category: string;
  name: string;
  description: string;
  origin: string;
  family: string;
  story: string;
  // NOT: Bunlar yer tutucu (placeholder) gorsellerdir. Gercek urun
  // fotograflarinizi (tercihen alfa kanalli / seffaf arka planli PNG)
  // buraya koyun.
  image: string;
  thumbnail: string;
}

const FLOWERS: Flower[] = [
  {
    id: 1,
    category: "Atölye Serisi",
    name: "Gece Gülü",
    description:
      "Kadife dokulu yaprakları ve derin bordo tonlarıyla, tutkunun en zarif hâli.",
    origin: "Anadolu",
    family: "Rosaceae",
    story:
      "Her Gece Gülü, gün batımından sonra toplanır ve en yoğun rengini koruması için soğuk zincirde saklanır.",
    image: "https://picsum.photos/seed/gece-gulu/900/1200",
    thumbnail: "https://picsum.photos/seed/gece-gulu-thumb/200/200",
  },
  {
    id: 2,
    category: "Atölye Serisi",
    name: "Kristal Orkide",
    description:
      "Saf beyazın mora karışan gölgeleriyle, sadeliğin en gösterişli yorumu.",
    origin: "Güneydoğu Asya",
    family: "Orchidaceae",
    story:
      "Kristal Orkide, el işçiliğiyle hazırlanan özel serada haftalar süren bir olgunlaşma sürecinden geçer.",
    image: "https://picsum.photos/seed/kristal-orkide/900/1200",
    thumbnail: "https://picsum.photos/seed/kristal-orkide-thumb/200/200",
  },
  {
    id: 3,
    category: "Atölye Serisi",
    name: "Sürreal Zambak",
    description:
      "Gül kurusu tonların zambak siluetiyle buluştuğu, rüya gibi bir kompozisyon.",
    origin: "Akdeniz",
    family: "Liliaceae",
    story:
      "Sürreal Zambak, atölyemizin imza rengini yakalamak için özel olarak yetiştirilen bir melez türdür.",
    image: "https://picsum.photos/seed/surreal-zambak/900/1200",
    thumbnail: "https://picsum.photos/seed/surreal-zambak-thumb/200/200",
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
  const flower = FLOWERS[index];

  const goTo = (i: number) => setIndex((i + FLOWERS.length) % FLOWERS.length);
  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#131314] text-[#e5e2e3]">
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
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute h-[70%] w-[70%] rounded-full bg-[#f6b6be]/10 blur-3xl" />

          <AnimatePresence mode="wait">
            <motion.img
              key={`image-${flower.id}`}
              src={flower.image}
              alt={flower.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 h-[80%] max-h-[640px] w-auto object-cover"
              style={{
                maskImage:
                  "radial-gradient(ellipse at center, black 55%, transparent 88%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, black 55%, transparent 88%)",
              }}
            />
          </AnimatePresence>

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
          <nav className="flex justify-end gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-[#e5e2e3]/70 transition-colors hover:text-[#f6b6be]"
              >
                {link}
              </a>
            ))}
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

      {/* Alt orta: gecis noktalari */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
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
    </section>
  );
}
