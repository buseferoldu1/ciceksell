"use client";

import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * macOS tarzi buyuteцli dock.
 *
 * Demo kodunda `@/components/ui/dock` hazir varsayiliyordu ama projede yoktu;
 * bu yuzden sifirdan yazildi. Buyume, imlecin ikona olan yatay uzakligina
 * gore hesaplanir ve motion value ile yurutulur (React render tetiklemez).
 */

const DEFAULT_SIZE = 44;
const DEFAULT_MAGNIFICATION = 76;
const DEFAULT_DISTANCE = 130;

interface DockContextValue {
  mouseX: MotionValue<number>;
  size: number;
  magnification: number;
  distance: number;
}

const DockContext = createContext<DockContextValue | null>(null);
const useDock = () => {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error("Dock bileşenleri <Dock> içinde kullanılmalı");
  return ctx;
};

const ItemContext = createContext<{ width: MotionValue<number>; hovered: boolean } | null>(
  null
);
const useItem = () => {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("DockIcon/DockLabel <DockItem> içinde kullanılmalı");
  return ctx;
};

export function Dock({
  children,
  className = "",
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
  magnification?: number;
  distance?: number;
}) {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider value={{ mouseX, size, magnification, distance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`mx-auto flex w-fit items-end gap-3 rounded-2xl border border-black/5 bg-white/80 px-3 pb-2 pt-2 shadow-xl backdrop-blur-md ${className}`}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export function DockItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseX, size, magnification, distance } = useDock();
  const [hovered, setHovered] = useState(false);

  // Imlecin bu ikonun merkezine yatay uzakligi
  const mesafe = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - bounds.x - bounds.width / 2;
  });

  const hedefBoyut = useTransform(
    mesafe,
    [-distance, 0, distance],
    [size, magnification, size]
  );
  const width = useSpring(hedefBoyut, {
    stiffness: 220,
    damping: 18,
    mass: 0.2,
  });

  return (
    <ItemContext.Provider value={{ width, hovered }}>
      <motion.div
        ref={ref}
        style={{ width, height: width }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={`relative flex items-center justify-center ${className}`}
      >
        {children}
      </motion.div>
    </ItemContext.Provider>
  );
}

export function DockLabel({ children }: { children: ReactNode }) {
  const { hovered } = useItem();
  return (
    <AnimatePresence>
      {hovered && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          role="tooltip"
          className="pointer-events-none absolute -top-9 left-1/2 w-fit -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#33323a] px-2.5 py-1 text-xs font-medium text-white shadow-md"
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children }: { children: ReactNode }) {
  const { width } = useItem();
  // Ikon, kabin yaklasik yarisi kadar buyusun
  const iconWidth = useTransform(width, (w) => w * 0.45);
  return (
    <motion.div
      style={{ width: iconWidth, height: iconWidth }}
      className="flex items-center justify-center"
    >
      {Children.map(children, (child) =>
        typeof child === "object" && child !== null
          ? cloneElement(child as ReactElement)
          : child
      )}
    </motion.div>
  );
}
