"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles, Leaf } from "lucide-react";

const FEATURES = [
  {
    icon: Clock,
    title: "Aynı Gün Teslimat",
    description:
      "Saat 14:00'a kadar verilen siparişleriniz, şehir içi aynı gün elden teslim edilir.",
  },
  {
    icon: Leaf,
    title: "Taze Aranjmanlar",
    description:
      "Her buket, sipariş gününde mevsimin en taze çiçekleriyle elde hazırlanır.",
  },
  {
    icon: Sparkles,
    title: "Ustalık İşçiliği",
    description:
      "Deneyimli floristlerimizden özenle tasarlanmış, imza niteliğinde aranjmanlar.",
  },
];

export default function Features() {
  return (
    <section id="ozellikler" className="bg-[#FAFAFA] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="mb-4 font-serif text-3xl font-bold text-[#33323a] md:text-4xl">
            Neden Çiçeksel?
          </h2>
          <p className="text-lg text-slate-600">
            Her aranjman, sevdiklerinize doğanın zarafetini taşıması için özenle
            hazırlanır.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-[#d9594c]/12 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#d9594c]/10">
                <feature.icon className="h-6 w-6 text-[#d9594c]" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-[#33323a]">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
