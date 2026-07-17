"use client";

import { motion, type Variants } from "framer-motion";
import { Flower2 } from "lucide-react";
import { ABOUT_INTRO, ABOUT_SECTIONS, ABOUT_STATS, SITE_BRAND } from "@/lib/site";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function About() {
  return (
    <section id="hakkimizda" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Baslik */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d9594c]/25 bg-[#d9594c]/10 px-4 py-1.5 text-sm font-medium text-[#d9594c]">
            <Flower2 className="h-4 w-4" />
            {SITE_BRAND.tagline}
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-[#33323a] md:text-4xl">
            Hakkımızda
          </h2>
          <p className="mt-4 text-lg text-slate-600">{ABOUT_INTRO}</p>
        </motion.div>

        {/* Istatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-16 grid grid-cols-2 gap-6 rounded-2xl bg-[#33323a] px-8 py-10 text-center md:grid-cols-4"
        >
          {ABOUT_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
            >
              <div className="font-serif text-3xl font-bold text-white md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Hikaye bloklari */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="space-y-10"
        >
          {ABOUT_SECTIONS.map((section) => (
            <motion.article
              key={section.title}
              variants={itemVariants}
              className="border-l-2 border-[#d9594c]/25 pl-6"
            >
              <h3 className="mb-3 font-serif text-2xl font-bold text-[#33323a]">
                {section.title}
              </h3>
              {section.body.split("\n\n").map((para, i) => (
                <p key={i} className="mt-3 leading-relaxed text-slate-600">
                  {para}
                </p>
              ))}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
