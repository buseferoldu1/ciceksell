"use client";

import { motion } from "framer-motion";

// Her sayfa gecisinde oynar: yumusak bir "cicek acilimi" perdesi yukari
// kayarak sayfayi acar, icerik hafifce belirir.
// (Icerik sarmalayici yalnizca opacity kullanir; fixed navbar/sepet bozulmaz.)
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
        style={{ transformOrigin: "top" }}
        className="pointer-events-none fixed inset-0 z-[100] bg-gradient-to-b from-[#f6b6be] via-[#f4d4d8] to-[#FAFAFA]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
