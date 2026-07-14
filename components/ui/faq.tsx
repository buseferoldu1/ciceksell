"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Aynı gün teslimat için son sipariş saati nedir?",
    answer:
      "Şehir içi aynı gün teslimat için siparişlerinizi saat 14:00'a kadar vermeniz yeterli. Bu saatten sonraki siparişler ertesi gün teslim edilir.",
  },
  {
    question: "Çiçekler ne kadar süre taze kalır?",
    answer:
      "Doğru bakımla aranjmanlarımız ortalama 5-7 gün tazeliğini korur. Her siparişle birlikte bakım önerilerini içeren bir kart gönderiyoruz.",
  },
  {
    question: "Siparişimi iptal edebilir veya değiştirebilir miyim?",
    answer:
      "Teslimat saatinden en az 4 saat öncesine kadar siparişinizi ücretsiz olarak iptal edebilir veya değiştirebilirsiniz.",
  },
  {
    question: "Hangi şehirlere teslimat yapıyorsunuz?",
    answer:
      "Türkiye genelinde 50'den fazla şehre teslimat yapıyoruz. Teslimat süresi bulunduğunuz bölgeye göre değişebilir.",
  },
  {
    question: "İade politikanız nedir?",
    answer:
      "Aranjmanınızda bir sorun olması durumunda 24 saat içinde bizimle iletişime geçin; ücretsiz yenileme veya iade sağlıyoruz.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="sss" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 font-serif text-3xl font-bold text-emerald-900 md:text-4xl">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-lg text-slate-600">
            Aklınıza takılan bir şey mi var? Cevabı burada olabilir.
          </p>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="overflow-hidden rounded-xl border border-emerald-900/10 bg-[#FAFAFA]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-emerald-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-emerald-900 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-slate-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
