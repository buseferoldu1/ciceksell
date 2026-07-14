"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Klasik",
    price: "₺350",
    period: "buket başı",
    description: "Küçük jestler ve günlük hediyeler için.",
    features: [
      "5-7 çiçek çeşidi",
      "Standart ambalaj",
      "Kart mesajı",
      "2-3 iş günü teslimat",
    ],
    highlighted: false,
    cta: "Seç",
  },
  {
    name: "Premium",
    price: "₺650",
    period: "buket başı",
    description: "Özel günler için imza aranjmanlar.",
    features: [
      "10+ çiçek çeşidi",
      "Özel ambalaj ve kurdele",
      "Kişiselleştirilmiş kart",
      "Aynı gün teslimat",
      "Vazo dahil",
    ],
    highlighted: true,
    cta: "Seç",
  },
  {
    name: "Kurumsal",
    price: "Özel Fiyat",
    period: "aylık anlaşma",
    description: "Ofisler, oteller ve düzenli siparişler için.",
    features: [
      "Toplu sipariş indirimi",
      "Haftalık / aylık abonelik",
      "Özel tasarım danışmanlığı",
      "Öncelikli teslimat",
      "Fatura ve sözleşme desteği",
    ],
    highlighted: false,
    cta: "İletişime Geç",
  },
];

export default function Pricing() {
  return (
    <section
      id="fiyatlandirma"
      className="bg-[#FAFAFA] px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="mb-4 font-serif text-3xl font-bold text-[#33323a] md:text-4xl">
            Fiyatlandırma
          </h2>
          <p className="text-lg text-slate-600">
            İhtiyacınıza uygun paketi seçin, geri kalanını bize bırakın.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-[#d9594c] text-white shadow-xl md:-translate-y-4"
                  : "border border-[#d9594c]/12 bg-white text-slate-700"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-semibold text-[#33323a] shadow-sm">
                  En Popüler
                </span>
              )}

              <h3
                className={`font-serif text-2xl font-bold ${
                  plan.highlighted ? "text-white" : "text-[#33323a]"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-2 text-sm ${
                  plan.highlighted ? "text-white/70" : "text-slate-500"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-6 mb-6">
                <span className="font-serif text-4xl font-bold">
                  {plan.price}
                </span>
                <span
                  className={`ml-2 text-sm ${
                    plan.highlighted ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  / {plan.period}
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.highlighted ? "text-white" : "text-[#d9594c]"
                      }`}
                    />
                    <span className={plan.highlighted ? "text-[#f9e9e6]" : ""}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors duration-300 ${
                  plan.highlighted
                    ? "bg-white text-[#33323a] hover:bg-[#f4e6e3]"
                    : "bg-[#d9594c] text-white hover:bg-[#c2493d]"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
