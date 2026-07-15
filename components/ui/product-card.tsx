"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";

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

interface ProductCardProps {
  product: Product;
  index: number;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, index, onAdd }: ProductCardProps) {
  // Her kart imleci ayri takip eder: 3D egilme
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-7, 7]), springConfig);
  // Imleci takip eden parilti (kartin uzerinde gezinen isik)
  const glowX = useTransform(mouseX, (v) => `${v * 100}%`);
  const glowY = useTransform(mouseY, (v) => `${v * 100}%`);

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
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -10 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] [transform-style:preserve-3d]"
    >
      {/* Imleci takip eden yumusak parilti */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([gx, gy]) =>
              `radial-gradient(240px circle at ${gx} ${gy}, rgba(246,182,190,0.16), transparent 70%)`
          ),
        }}
      />
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Nefes alma efekti */}
        <motion.div
          animate={{ scale: [1, 1.035, 1] }}
          transition={{
            duration: 4.5 + (index % 3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.4,
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
            onClick={() => onAdd(product)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f6b6be] py-2.5 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3]"
          >
            <ShoppingBag className="h-4 w-4" />
            Sepete Ekle
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-5">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#e5e2e3]">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-[#e5e2e3]/50">{product.tag}</p>
        </div>
        <span className="font-serif text-lg font-bold text-[#f6b6be]">
          {formatPrice(product.price)}
        </span>
      </div>
    </motion.div>
  );
}
