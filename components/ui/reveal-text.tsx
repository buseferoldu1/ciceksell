"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RevealTextProps {
  text?: string;
  textColor?: string;
  overlayColor?: string;
  fontSize?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  letterImages?: string[];
}

// Unsplash — ucretsiz kullanim (bahce, orman, sera, taze cicek)
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80", // cicek tarlasi
  "https://images.unsplash.com/photo-1460500062491-49fa531b2eb0?auto=format&fit=crop&w=1200&q=80", // bahce yolu
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=80", // sera
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=1200&q=80", // kiraz cicegi
  "https://images.unsplash.com/photo-1456086272160-b2234084cea4?auto=format&fit=crop&w=1200&q=80", // papatya
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80", // laleler
];

export default function RevealText({
  text = "ÇİÇEKSEL",
  textColor = "text-emerald-900",
  overlayColor = "text-rose-400",
  fontSize = "text-[64px] sm:text-[110px] md:text-[170px]",
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.4,
  springDuration = 600,
  letterImages = DEFAULT_IMAGES,
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showSweep, setShowSweep] = useState(false);

  useEffect(() => {
    const lastLetterDelay = (text.length - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;
    const timer = setTimeout(() => setShowSweep(true), totalDelay);
    return () => clearTimeout(timer);
  }, [text.length, letterDelay, springDuration]);

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-[#FAFAFA] py-24">
      <div className="flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900/50"
        >
          Harflerin üzerine gelin
        </motion.span>

        <div className="flex flex-wrap justify-center">
          {text.split("").map((letter, index) => (
            <motion.span
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`${fontSize} relative mx-0.5 cursor-pointer overflow-hidden font-serif font-black tracking-tight md:mx-1.5`}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * letterDelay,
                type: "spring",
                damping: 8,
                stiffness: 200,
                mass: 0.8,
              }}
            >
              {/* Temel metin katmani */}
              <motion.span
                className={`absolute inset-0 ${textColor}`}
                animate={{ opacity: hoveredIndex === index ? 0 : 1 }}
                transition={{ duration: 0.1 }}
              >
                {letter}
              </motion.span>

              {/* Gorsel metin katmani (hover) */}
              <motion.span
                className="bg-cover bg-no-repeat text-transparent"
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  backgroundPosition:
                    hoveredIndex === index ? "10% center" : "0% center",
                }}
                transition={{
                  opacity: { duration: 0.1 },
                  backgroundPosition: { duration: 3, ease: "easeInOut" },
                }}
                style={{
                  backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {letter}
              </motion.span>

              {/* Isik/renk sweep katmani */}
              {showSweep && (
                <motion.span
                  className={`absolute inset-0 ${overlayColor} pointer-events-none`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    delay: index * overlayDelay,
                    duration: overlayDuration,
                    times: [0, 0.1, 0.7, 1],
                    ease: "easeInOut",
                  }}
                >
                  {letter}
                </motion.span>
              )}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
