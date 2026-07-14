"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const STATS = [
  { value: "12.000+", label: "Mutlu Müşteri" },
  { value: "4.9/5", label: "Ortalama Puan" },
  { value: "50+", label: "Şehre Teslimat" },
];

const TESTIMONIALS = [
  {
    quote:
      "Sevgilime gönderdiğim buket tam istediğim gibi geldi, çiçekler günlerce tazeliğini korudu.",
    name: "Elif Y.",
    location: "İstanbul",
  },
  {
    quote:
      "Aynı gün teslimat gerçekten çalışıyor! Annemin doğum gününü kurtardılar.",
    name: "Mert K.",
    location: "Ankara",
  },
  {
    quote:
      "Özenli paketleme ve zarif tasarım, kesinlikle tekrar sipariş vereceğim.",
    name: "Zeynep A.",
    location: "İzmir",
  },
];

export default function SocialProof() {
  return (
    <section id="yorumlar" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-16 grid grid-cols-1 gap-8 rounded-2xl bg-[#33323a] px-8 py-10 text-center sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="font-serif text-4xl font-bold text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center font-serif text-3xl font-bold text-[#33323a] md:text-4xl"
        >
          Müşterilerimiz Ne Diyor?
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="rounded-2xl border border-[#d9594c]/12 bg-[#FAFAFA] p-8"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#d9594c] text-[#d9594c]" />
                ))}
              </div>
              <p className="mb-6 text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="font-semibold text-[#33323a]">
                {testimonial.name}
              </div>
              <div className="text-sm text-slate-500">{testimonial.location}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
