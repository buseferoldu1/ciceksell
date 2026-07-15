"use client";

import { motion, type Variants } from "framer-motion";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";
import { InstagramIcon } from "./icons";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Contact() {
  return (
    <section id="iletisim" className="bg-[#f4f2ef] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="font-serif text-3xl font-bold text-[#33323a] md:text-4xl">
            İletişim
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Sorularınız, özel aranjman talepleriniz ve sipariş desteği için
            bize ulaşın.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {/* Telefon */}
          <motion.a
            variants={cardVariants}
            whileHover={{ y: -6 }}
            href={SITE.phoneHref}
            className="group rounded-2xl border border-[#d9594c]/12 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9594c]/10">
              <Phone className="h-5 w-5 text-[#d9594c]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#33323a]">
              Telefon
            </h3>
            <p className="mt-1 text-sm text-slate-600 transition-colors group-hover:text-[#d9594c]">
              {SITE.phone}
            </p>
          </motion.a>

          {/* E-posta */}
          <motion.a
            variants={cardVariants}
            whileHover={{ y: -6 }}
            href={SITE.emailHref}
            className="group rounded-2xl border border-[#d9594c]/12 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9594c]/10">
              <Mail className="h-5 w-5 text-[#d9594c]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#33323a]">
              E-posta
            </h3>
            <p className="mt-1 text-sm text-slate-600 transition-colors group-hover:text-[#d9594c]">
              {SITE.email}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {SITE.responseTime}
            </p>
          </motion.a>

          {/* Instagram */}
          <motion.a
            variants={cardVariants}
            whileHover={{ y: -6 }}
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-[#d9594c]/12 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9594c]/10">
              <InstagramIcon className="h-5 w-5 text-[#d9594c]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#33323a]">
              Bizi Takip Edin
            </h3>
            <p className="mt-1 text-sm text-slate-600 transition-colors group-hover:text-[#d9594c]">
              {SITE.instagramHandle}
            </p>
          </motion.a>

          {/* Adres */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-[#d9594c]/12 bg-white p-7 shadow-sm md:col-span-2"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9594c]/10">
              <MapPin className="h-5 w-5 text-[#d9594c]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#33323a]">
              Adres
            </h3>
            <p className="mt-2 leading-relaxed text-slate-600">
              {SITE.address.line1}
              <br />
              {SITE.address.line2}
              <br />
              {SITE.address.country}
            </p>
          </motion.div>

          {/* Guvenli odeme */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-[#d9594c]/12 bg-white p-7 shadow-sm"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9594c]/10">
              <ShieldCheck className="h-5 w-5 text-[#d9594c]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#33323a]">
              Güvenli Ödeme
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {SITE.payment.map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-black/5 bg-[#f4f2ef] px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
