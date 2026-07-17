"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Truck,
  Copy,
  Check,
} from "lucide-react";
import PetalBurst from "@/components/ui/petal-burst";
import FallingPetals from "@/components/ui/falling-petals";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/products";
import { useContactSettings } from "@/components/site-settings-context";

export default function PaymentResult({
  durum,
  siparis,
  tutar,
}: {
  durum: string;
  siparis?: string;
  tutar?: number;
}) {
  const { clear } = useCart();
  const contact = useContactSettings();
  const [kopyalandi, setKopyalandi] = useState(false);

  // Siparis olustuysa (kart basarili / havale / kapida) sepeti temizle
  const siparisOlustu =
    durum === "basarili" || durum === "havale" || durum === "kapida";
  useEffect(() => {
    if (siparisOlustu) clear();
  }, [siparisOlustu, clear]);

  const kopyala = (metin: string) => {
    navigator.clipboard?.writeText(metin).then(() => {
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    });
  };

  // --- Kart odemesi basarili ---
  if (durum === "basarili") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131314] px-4 text-[#e5e2e3]">
        <PetalBurst />
        <FallingPetals count={14} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md text-center"
        >
          <BasariHalkasi />
          <h1 className="font-serif text-3xl font-bold">Ödemeniz Alındı!</h1>
          <p className="mt-3 text-[#e5e2e3]/60">
            {siparis && (
              <>
                Sipariş numaranız{" "}
                <span className="font-semibold text-[#f6b6be]">{siparis}</span>.{" "}
              </>
            )}
            Aranjmanınız özenle hazırlanıp en kısa sürede kapınızda olacak.
          </p>
          <AnaSayfaButonu />
        </motion.div>
      </main>
    );
  }

  // --- Havale / EFT: IBAN bilgileri ---
  if (durum === "havale") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131314] px-4 py-12 text-[#e5e2e3]">
        <FallingPetals count={8} />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f6b6be]/15">
            <Banknote className="h-10 w-10 text-[#f6b6be]" />
          </div>
          <h1 className="font-serif text-3xl font-bold">Siparişiniz Alındı</h1>
          <p className="mt-3 text-[#e5e2e3]/60">
            Ödemeyi aşağıdaki hesaba yaptığınızda siparişiniz hazırlanmaya
            başlar. Açıklama kısmına <strong>sipariş numaranızı</strong> yazmayı
            unutmayın.
          </p>

          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left text-sm">
            <Satir etiket="Alıcı" deger={contact.bankHolder} />
            <Satir etiket="Banka" deger={contact.bankName} />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-[#e5e2e3]/40">
                  IBAN
                </div>
                <div className="truncate font-mono text-base font-semibold text-[#e5e2e3]">
                  {contact.bankIban}
                </div>
              </div>
              <button
                type="button"
                onClick={() => kopyala(contact.bankIban)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#f6b6be]/40 px-3 py-1.5 text-xs font-semibold text-[#f6b6be] transition-colors hover:bg-[#f6b6be] hover:text-[#131314]"
              >
                {kopyalandi ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {kopyalandi ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
            {siparis && (
              <Satir etiket="Açıklama (sipariş no)" deger={siparis} vurgu />
            )}
            {typeof tutar === "number" && tutar > 0 && (
              <Satir etiket="Tutar" deger={formatPrice(tutar)} vurgu />
            )}
          </div>

          <p className="mt-4 text-xs text-[#e5e2e3]/40">
            Sorularınız için {contact.phone} numaralı hattımızdan bize
            ulaşabilirsiniz.
          </p>
          <AnaSayfaButonu />
        </motion.div>
      </main>
    );
  }

  // --- Kapida odeme ---
  if (durum === "kapida") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131314] px-4 text-[#e5e2e3]">
        <FallingPetals count={10} />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
            <Truck className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold">Siparişiniz Alındı!</h1>
          <p className="mt-3 text-[#e5e2e3]/60">
            {siparis && (
              <>
                Sipariş numaranız{" "}
                <span className="font-semibold text-[#f6b6be]">{siparis}</span>.{" "}
              </>
            )}
            Ödemeyi teslimat sırasında yapacaksınız. Ekibimiz en kısa sürede
            sizinle iletişime geçecek.
          </p>
          <AnaSayfaButonu />
        </motion.div>
      </main>
    );
  }

  // --- Bekliyor / Basarisiz ---
  const bekliyor = durum === "beklemede";
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#131314] px-4 text-[#e5e2e3]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center"
      >
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            bekliyor ? "bg-amber-500/15" : "bg-red-500/15"
          }`}
        >
          {bekliyor ? (
            <Clock className="h-10 w-10 text-amber-400" />
          ) : (
            <XCircle className="h-10 w-10 text-red-400" />
          )}
        </div>
        <h1 className="font-serif text-3xl font-bold">
          {bekliyor ? "Ödeme Bekleniyor" : "Ödeme Tamamlanamadı"}
        </h1>
        <p className="mt-3 text-[#e5e2e3]/60">
          {bekliyor
            ? "Ödemeniz henüz onaylanmadı. Tutar hesabınızdan çekildiyse birkaç dakika içinde onaylanır; sorun yaşarsanız bizimle iletişime geçin."
            : "Ödeme sırasında bir sorun oluştu ve tahsilat yapılamadı. Sepetiniz korundu — dilerseniz tekrar deneyebilirsiniz."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/odeme"
            className="inline-block rounded-full bg-[#f6b6be] px-7 py-3 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3]"
          >
            Tekrar Dene
          </Link>
          <Link
            href="/katalog"
            className="inline-block rounded-full border border-[#f6b6be]/50 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-[#f6b6be] transition-colors hover:bg-[#f6b6be] hover:text-[#131314]"
          >
            Kataloğa Dön
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

function Satir({ etiket, deger, vurgu }: { etiket: string; deger: string; vurgu?: boolean }) {
  if (!deger) return null;
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[#e5e2e3]/40">
        {etiket}
      </div>
      <div className={`font-semibold ${vurgu ? "text-[#f6b6be]" : "text-[#e5e2e3]"}`}>
        {deger}
      </div>
    </div>
  );
}

function BasariHalkasi() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
      className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15"
    >
      <motion.span
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ scale: [0.8, 1.8], opacity: [0.7, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
      />
      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
    </motion.div>
  );
}

function AnaSayfaButonu() {
  return (
    <Link
      href="/"
      className="mt-8 inline-block rounded-full bg-[#f6b6be] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3]"
    >
      Ana Sayfaya Dön
    </Link>
  );
}
