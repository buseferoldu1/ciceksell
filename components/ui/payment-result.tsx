"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import PetalBurst from "@/components/ui/petal-burst";
import FallingPetals from "@/components/ui/falling-petals";
import { useCart } from "@/components/cart/cart-context";

export default function PaymentResult({
  durum,
  siparis,
}: {
  durum: string;
  siparis?: string;
}) {
  const { clear } = useCart();
  const basarili = durum === "basarili";

  // Odeme basariliysa sepeti temizle (musteri geri dondugunde bos olsun)
  useEffect(() => {
    if (basarili) clear();
  }, [basarili, clear]);

  if (basarili) {
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
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-[#f6b6be] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3]"
          >
            Ana Sayfaya Dön
          </Link>
        </motion.div>
      </main>
    );
  }

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
