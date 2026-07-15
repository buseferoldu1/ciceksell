"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";

/**
 * Kaydirdikca donen 3D urun galerisi.
 *
 * Performans notlari (orijinal referans bilesenden ayrildigimiz yerler):
 *  - Donus React state'i yerine motion value ile tutulur. Aksi halde her
 *    karede setState calisip saniyede ~60 kez tum kartlar yeniden render
 *    edilirdi.
 *  - Bolum ekranda degilken otomatik donus tamamen durur.
 *  - Donus, tum sayfanin degil YALNIZCA bu bolumun kaydirma ilerlemesine
 *    baglidir (useScroll + target), boylece sayfaya gomulunce dogru calisir.
 */

interface CircularGalleryProps {
  items: Product[];
  onAdd: (product: Product) => void;
  /** Kartlarin merkezden uzakligi (px) */
  radius?: number;
  /** Bosta bekleme donus hizi (derece/kare) */
  autoRotateSpeed?: number;
}

function GalleryCard({
  product,
  index,
  total,
  radius,
  rotation,
  cardW,
  cardH,
  onAdd,
}: {
  product: Product;
  index: number;
  total: number;
  radius: number;
  rotation: MotionValue<number>;
  cardW: number;
  cardH: number;
  onAdd: (p: Product) => void;
}) {
  const itemAngle = index * (360 / total);

  // Kartin one bakma orani (1 = tam onde, 0 = tam arkada)
  const facing = useTransform(rotation, (r) => {
    const rel = (itemAngle + (r % 360) + 360) % 360;
    const norm = Math.abs(rel > 180 ? 360 - rel : rel);
    return 1 - norm / 180;
  });

  const opacity = useTransform(facing, (f) => Math.max(0.25, f));
  // Arkadaki kartlar tiklanamasin
  const pointerEvents = useTransform(facing, (f) =>
    f > 0.55 ? "auto" : "none"
  );

  return (
    <motion.div
      role="group"
      aria-label={product.name}
      className="absolute"
      style={{
        width: cardW,
        height: cardH,
        left: "50%",
        top: "50%",
        marginLeft: -cardW / 2,
        marginTop: -cardH / 2,
        transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
        opacity,
        pointerEvents,
      }}
    >
      <div className="group relative h-full w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl">
        <div className="relative h-[74%] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Imlec uzerine gelince: Sepete Ekle */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#33323a]/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <motion.button
              type="button"
              onClick={() => onAdd(product)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex translate-y-3 items-center gap-2 rounded-full bg-[#d9594c] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-lg transition-transform duration-300 group-hover:translate-y-0"
            >
              <ShoppingBag className="h-4 w-4" />
              Sepete Ekle
            </motion.button>
          </div>
        </div>

        {/* Altta: isim + fiyat */}
        <div className="flex h-[26%] flex-col justify-center px-4">
          <h3 className="truncate font-serif text-base font-bold text-[#33323a]">
            {product.name}
          </h3>
          <span className="mt-0.5 font-serif text-lg font-bold text-[#d9594c]">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CircularGallery({
  items,
  onAdd,
  radius,
  autoRotateSpeed = 0.03,
}: CircularGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Kucuk ekranlarda cember ve kartlar kuculur
  const [dims, setDims] = useState({ radius: radius ?? 620, w: 260, h: 340 });

  useEffect(() => {
    const apply = () => {
      const vw = window.innerWidth;
      if (vw < 640) setDims({ radius: radius ?? 300, w: 170, h: 230 });
      else if (vw < 1024) setDims({ radius: radius ?? 440, w: 210, h: 280 });
      else setDims({ radius: radius ?? 620, w: 260, h: 340 });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [radius]);

  // Yalnizca bu bolumun kaydirma ilerlemesi (0 -> 1)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const scrollRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

  // Bosta yavas donus (React render tetiklemeden)
  const drift = useMotionValue(0);
  const rotation = useTransform(
    [scrollRotation, drift],
    ([s, d]: number[]) => s + d
  );

  // Gorunurluk: ekran disinda animasyon tamamen dursun
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const tick = () => {
      drift.set(drift.get() + autoRotateSpeed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, autoRotateSpeed, drift]);

  return (
    <div ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#f4f2ef]">
        {/* Yumusak dekoratif lekeler */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d9594c]/5 blur-3xl" />

        {/* Sabit navbar'in altinda kalmamasi icin ustten bosluk */}
        <div className="absolute inset-x-0 top-24 z-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl font-bold text-[#33323a] md:text-4xl"
          >
            Aranjman Çemberi
          </motion.h2>
          <p className="mt-2 text-sm text-slate-500">
            Kaydırarak çevirin • Üzerine gelip sepete ekleyin
          </p>
        </div>

        <div
          ref={stageRef}
          role="region"
          aria-label="Dönen ürün galerisi"
          className="flex h-full w-full items-center justify-center"
          style={{ perspective: "2000px" }}
        >
          <motion.div
            className="relative h-full w-full"
            style={{ rotateY: rotation, transformStyle: "preserve-3d" }}
          >
            {items.map((product, i) => (
              <GalleryCard
                key={product.id}
                product={product}
                index={i}
                total={items.length}
                radius={dims.radius}
                cardW={dims.w}
                cardH={dims.h}
                rotation={rotation}
                onAdd={onAdd}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
