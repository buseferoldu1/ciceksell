"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Flower2,
  Info,
  Loader2,
  Lock,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import {
  formatPrice,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from "@/lib/products";
import PetalBurst from "@/components/ui/petal-burst";
import FallingPetals from "@/components/ui/falling-petals";
import ProgressIndicator from "@/components/ui/progress-indicator";
import GlassCalendar from "@/components/ui/glass-calendar";

const ADIMLAR = ["Sepet", "Teslimat", "Ödeme", "Onay"];

interface FormState {
  name: string;
  phone: string;
  address: string;
  note: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  address: "",
  note: "",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

const formatCardNumber = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function OdemePage() {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"form" | "processing" | "success">("form");
  const [orderNo, setOrderNo] = useState("");
  const [teslimatTarihi, setTeslimatTarihi] = useState<Date>(new Date());

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  // Adim gostergesi: form doldukca ilerler (Sepet dolu -> 1'den baslar)
  const teslimatTamam =
    form.name.trim().length >= 3 &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    form.address.trim().length >= 10;
  const kartTamam =
    form.cardName.trim().length >= 3 &&
    form.cardNumber.replace(/\D/g, "").length === 16 &&
    /^\d{2}\/\d{2}$/.test(form.expiry) &&
    form.cvc.length >= 3;
  const aktifAdim =
    status === "success" ? 3 : teslimatTamam ? (kartTamam ? 2 : 2) : 1;

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (key === "cardNumber") value = formatCardNumber(value);
    if (key === "expiry") value = formatExpiry(value);
    if (key === "cvc") value = value.replace(/\D/g, "").slice(0, 4);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 3) next.name = "Ad soyad girin";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Geçerli telefon girin";
    if (form.address.trim().length < 10) next.address = "Teslimat adresi girin";
    if (form.cardName.trim().length < 3) next.cardName = "Kart üzerindeki isim";
    if (form.cardNumber.replace(/\D/g, "").length !== 16) next.cardNumber = "16 haneli kart numarası";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) next.expiry = "AA/YY";
    if (form.cvc.length < 3) next.cvc = "CVC";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("processing");
    // DEMO: gercek odeme saglayicisi (iyzico/Stripe) buraya baglanir.
    // Siparis, admin panelinde gorunmesi icin API'ye kaydedilir.
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            note: form.note || undefined,
            // Musterinin sectigi teslimat tarihi (admin panelinde gorunur)
            deliveryDate: teslimatTarihi.toISOString().slice(0, 10),
          },
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
        }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order?.error || "Sipariş kaydedilemedi");
      setOrderNo(order.id);
      setStatus("success");
      clear();
    } catch {
      setStatus("form");
      setErrors((prev) => ({
        ...prev,
        cvc: "Sipariş kaydedilemedi, tekrar deneyin",
      }));
    }
  };

  const inputCls = (err?: string) =>
    `w-full rounded-lg border bg-white/[0.04] px-4 py-3 text-sm text-[#e5e2e3] placeholder-[#e5e2e3]/30 outline-none transition-all duration-300 focus:border-[#f6b6be]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(246,182,190,0.12)] ${
      err ? "border-red-400/60" : "border-white/10"
    }`;

  if (status === "success") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131314] px-4 text-[#e5e2e3]">
        {/* Kutlama: yapraklar merkezden sacilir, ardindan usttan yagar */}
        <PetalBurst />
        <FallingPetals count={14} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md text-center"
        >
          {/* Tum adimlar tamamlandi */}
          <div className="mb-10">
            <ProgressIndicator steps={ADIMLAR} current={ADIMLAR.length} />
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15"
          >
            {/* Disari dogru genisleyen halka */}
            <motion.span
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: [0.8, 1.8], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
            />
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </motion.div>
          <h1 className="font-serif text-3xl font-bold">Siparişiniz Alındı!</h1>
          <p className="mt-3 text-[#e5e2e3]/60">
            Sipariş numaranız{" "}
            <span className="font-semibold text-[#f6b6be]">{orderNo}</span>.
            Aranjmanınız özenle hazırlanıp en kısa sürede kapınızda olacak.
          </p>
          <p className="mt-2 text-xs text-[#e5e2e3]/40">
            (Bu bir demo siparişidir — gerçek ödeme alınmamıştır.)
          </p>
          <Link
            href="/vitrin"
            className="mt-8 inline-block rounded-full bg-[#f6b6be] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3]"
          >
            Vitrine Dön
          </Link>
        </motion.div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131314] px-4 text-[#e5e2e3]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flower2 className="mx-auto mb-4 h-12 w-12 text-[#e5e2e3]/20" />
          </motion.div>
          <h1 className="font-serif text-2xl font-bold">Sepetiniz boş</h1>
          <p className="mt-2 text-[#e5e2e3]/60">
            Ödeme yapabilmek için önce sepetinize çiçek ekleyin.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="mt-6 inline-block"
          >
            <Link
              href="/katalog"
              className="inline-block rounded-full border border-[#f6b6be]/50 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-[#f6b6be] transition-colors hover:bg-[#f6b6be] hover:text-[#131314]"
            >
              Kataloğa Git
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#131314] text-[#e5e2e3]">
      {/* Zarif arka plan: seyrek dusen yapraklar */}
      <FallingPetals count={8} />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <Link
          href="/katalog"
          className="group inline-flex items-center gap-2 text-sm text-[#e5e2e3]/60 transition-colors hover:text-[#f6b6be]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Kataloğa dön
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 font-serif text-3xl font-bold lg:text-4xl"
        >
          Ödeme
        </motion.h1>

        {/* Adim gostergesi */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mx-auto mt-8 max-w-lg"
        >
          <ProgressIndicator steps={ADIMLAR} current={aktifAdim} />
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Sol: form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            noValidate
          >
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="mb-5 font-serif text-xl font-bold">
                Teslimat Bilgileri
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input
                    placeholder="Ad Soyad"
                    value={form.name}
                    onChange={set("name")}
                    className={inputCls(errors.name)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    placeholder="Telefon (05xx xxx xx xx)"
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputCls(errors.phone)}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    placeholder="Teslimat adresi"
                    value={form.address}
                    onChange={set("address")}
                    rows={3}
                    className={inputCls(errors.address)}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-400">{errors.address}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    placeholder="Kart notu (isteğe bağlı) — örn. 'Nice senelere!'"
                    value={form.note}
                    onChange={set("note")}
                    className={inputCls()}
                  />
                </div>

                {/* Teslimat tarihi */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-[#e5e2e3]/60">
                    Teslimat Tarihi
                  </label>
                  <GlassCalendar
                    selectedDate={teslimatTarihi}
                    onDateSelect={setTeslimatTarihi}
                  />
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                  <CreditCard className="h-5 w-5 text-[#f6b6be]" />
                  Kart Bilgileri
                </h2>
                <span className="flex items-center gap-1 text-xs text-[#e5e2e3]/40">
                  <Lock className="h-3 w-3" />
                  SSL korumalı
                </span>
              </div>

              <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-200/80">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Bu bir <strong>demo ödeme sayfasıdır</strong> — kart bilgileriniz
                  hiçbir yere gönderilmez ve gerçek tahsilat yapılmaz. Canlıya
                  geçişte iyzico veya Stripe entegrasyonu bu forma bağlanır.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input
                    placeholder="Kart üzerindeki isim"
                    value={form.cardName}
                    onChange={set("cardName")}
                    className={inputCls(errors.cardName)}
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-xs text-red-400">{errors.cardName}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    placeholder="Kart numarası"
                    inputMode="numeric"
                    value={form.cardNumber}
                    onChange={set("cardNumber")}
                    className={inputCls(errors.cardNumber)}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-xs text-red-400">{errors.cardNumber}</p>
                  )}
                </div>
                <div>
                  <input
                    placeholder="SKT (AA/YY)"
                    inputMode="numeric"
                    value={form.expiry}
                    onChange={set("expiry")}
                    className={inputCls(errors.expiry)}
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-xs text-red-400">{errors.expiry}</p>
                  )}
                </div>
                <div>
                  <input
                    placeholder="CVC"
                    inputMode="numeric"
                    value={form.cvc}
                    onChange={set("cvc")}
                    className={inputCls(errors.cvc)}
                  />
                  {errors.cvc && (
                    <p className="mt-1 text-xs text-red-400">{errors.cvc}</p>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={status === "processing"}
                whileHover={status === "form" ? { scale: 1.02 } : undefined}
                whileTap={status === "form" ? { scale: 0.98 } : undefined}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f6b6be] py-4 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3] disabled:opacity-70"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {status === "processing" ? (
                    <motion.span
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      İşleniyor...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {formatPrice(total)} Öde (Demo)
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </section>
          </motion.form>

          {/* Sag: siparis ozeti */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-fit rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          >
            <h2 className="mb-5 font-serif text-xl font-bold">Sipariş Özeti</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-[#e5e2e3]/50">
                      {item.qty} adet
                    </div>
                  </div>
                  <span className="font-serif text-sm font-bold text-[#f6b6be]">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-1 border-t border-white/10 pt-4 text-sm text-[#e5e2e3]/70">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Teslimat</span>
                <span>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-white/10 pt-3 font-serif text-lg font-bold text-[#e5e2e3]">
                <span>Toplam</span>
                <span className="text-[#f6b6be]">{formatPrice(total)}</span>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
