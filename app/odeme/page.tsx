"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Flower2,
  Loader2,
  Lock,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice, computeOrderTotals } from "@/lib/products";
import { bankActive } from "@/lib/site";
import { useContactSettings } from "@/components/site-settings-context";
import FallingPetals from "@/components/ui/falling-petals";
import ProgressIndicator from "@/components/ui/progress-indicator";
import GlassCalendar from "@/components/ui/glass-calendar";

const ADIMLAR = ["Sepet", "Teslimat", "Ödeme"];

type Yontem = "kart" | "havale" | "kapida";

/** Teslimat yaptigimiz Ankara ilceleri */
const ILCELER = [
  "Gölbaşı",
  "Mamak",
  "Keçiören",
  "Altındağ",
  "Çankaya",
  "Pursaklar",
  "Yenimahalle",
  "Sincan",
  "Etimesgut",
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  /** Cicegin teslim edilecegi kisi (siparisi veren farkli olabilir) */
  recipientName: string;
  district: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  note: "",
  recipientName: "",
  district: "",
};

const gecerliEposta = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function OdemePage() {
  const { items, subtotal } = useCart();
  const contact = useContactSettings();
  const BANKA_AKTIF = bankActive(contact);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [yontem, setYontem] = useState<Yontem>("kart");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"form" | "processing">("form");
  const [genelHata, setGenelHata] = useState("");
  const [teslimatTarihi, setTeslimatTarihi] = useState<Date>(new Date());
  const [kuponGirdi, setKuponGirdi] = useState("");
  const [kuponUygulanan, setKuponUygulanan] = useState<string | undefined>();
  const [kuponHata, setKuponHata] = useState("");

  const { shipping, discount, total } =
    subtotal === 0
      ? { shipping: 0, discount: 0, total: 0 }
      : computeOrderTotals(subtotal, kuponUygulanan);

  const kuponUygula = () => {
    const kod = kuponGirdi.trim();
    if (!kod) return;
    const deneme = computeOrderTotals(subtotal, kod);
    if (deneme.discount <= 0) {
      setKuponHata("Geçersiz kupon kodu");
      setKuponUygulanan(undefined);
      return;
    }
    setKuponHata("");
    setKuponUygulanan(kod);
  };

  // Kart odemesinde e-posta zorunlu (iyzico icin); digerlerinde opsiyonel
  const epostaGerekli = yontem === "kart";
  const teslimatTamam =
    form.name.trim().length >= 3 &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    (!epostaGerekli || gecerliEposta(form.email)) &&
    form.address.trim().length >= 10 &&
    form.recipientName.trim().length >= 3 &&
    !!form.district;
  const aktifAdim = teslimatTamam ? 2 : 1;

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 3) next.name = "Ad soyad girin";
    if (form.phone.replace(/\D/g, "").length < 10)
      next.phone = "Geçerli telefon girin";
    if (epostaGerekli && !gecerliEposta(form.email))
      next.email = "Geçerli e-posta girin";
    if (form.address.trim().length < 10) next.address = "Teslimat adresi girin";
    if (form.recipientName.trim().length < 3) next.recipientName = "Alıcı ismi girin";
    if (!form.district) next.district = "İlçe seçin";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenelHata("");
    if (!validate()) return;
    setStatus("processing");

    const customer = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      address: form.address,
      note: form.note || undefined,
      deliveryDate: teslimatTarihi.toISOString().slice(0, 10),
      recipientName: form.recipientName,
      district: form.district,
    };
    const cartItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      detail: i.id.startsWith("ozel-") ? i.tag : undefined,
    }));

    try {
      if (yontem === "kart") {
        const res = await fetch("/api/payment/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer, items: cartItems, couponCode: kuponUygulanan }),
        });
        const data = await res.json();
        if (!res.ok || !data?.paymentPageUrl) {
          throw new Error(data?.error || "Ödeme başlatılamadı");
        }
        window.location.href = data.paymentPageUrl;
        return;
      }

      // Havale/EFT veya Kapida odeme: siparisi olustur, sonuc sayfasina git
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: cartItems,
          paymentMethod: yontem,
          couponCode: kuponUygulanan,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "Sipariş oluşturulamadı");
      }
      const durum = yontem === "havale" ? "havale" : "kapida";
      window.location.href = `/odeme/sonuc?durum=${durum}&siparis=${data.id}&tutar=${total}`;
    } catch (err) {
      setStatus("form");
      setGenelHata(
        err instanceof Error ? err.message : "İşlem tamamlanamadı, tekrar deneyin"
      );
    }
  };

  const inputCls = (err?: string) =>
    `w-full rounded-lg border bg-white/[0.04] px-4 py-3 text-sm text-[#e5e2e3] placeholder-[#e5e2e3]/30 outline-none transition-all duration-300 focus:border-[#f6b6be]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(246,182,190,0.12)] ${
      err ? "border-red-400/60" : "border-white/10"
    }`;

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

  const yontemler: { id: Yontem; label: string; not: string; Icon: typeof CreditCard }[] = [
    { id: "kart", label: "Kredi / Banka Kartı", not: "iyzico ile güvenli, 3D Secure", Icon: CreditCard },
    ...(BANKA_AKTIF
      ? [{ id: "havale" as Yontem, label: "Havale / EFT", not: "IBAN'a transfer, onay sonrası hazırlanır", Icon: Banknote }]
      : []),
    { id: "kapida", label: "Kapıda Ödeme", not: "Teslimatta nakit veya kart", Icon: Truck },
  ];

  const butonMetni =
    yontem === "kart"
      ? `${formatPrice(total)} · Güvenli Ödemeye Geç`
      : yontem === "havale"
        ? "Siparişi Oluştur · Havale Bilgileri"
        : "Siparişi Tamamla · Kapıda Öde";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#131314] text-[#e5e2e3]">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mx-auto mt-8 max-w-lg"
        >
          <ProgressIndicator steps={ADIMLAR} current={aktifAdim} />
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
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
                    inputMode="tel"
                    className={inputCls(errors.phone)}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    placeholder={
                      epostaGerekli
                        ? "E-posta (ödeme için gerekli)"
                        : "E-posta (isteğe bağlı)"
                    }
                    value={form.email}
                    onChange={set("email")}
                    inputMode="email"
                    className={inputCls(errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
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
                <div>
                  <input
                    placeholder="Alıcı İsmi (çiçeği teslim alacak kişi)"
                    value={form.recipientName}
                    onChange={set("recipientName")}
                    className={inputCls(errors.recipientName)}
                  />
                  {errors.recipientName && (
                    <p className="mt-1 text-xs text-red-400">{errors.recipientName}</p>
                  )}
                </div>
                <div>
                  <select
                    value={form.district}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, district: e.target.value }))
                    }
                    className={inputCls(errors.district)}
                  >
                    <option value="">İlçe seçin (Ankara)</option>
                    {ILCELER.map((ilce) => (
                      <option key={ilce} value={ilce} className="bg-[#1c1c1e]">
                        {ilce}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="mt-1 text-xs text-red-400">{errors.district}</p>
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

            {/* Odeme yontemi secimi */}
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="mb-4 font-serif text-xl font-bold">Ödeme Yöntemi</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {yontemler.map(({ id, label, not, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setYontem(id);
                      setGenelHata("");
                    }}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-colors ${
                      yontem === id
                        ? "border-[#f6b6be]/60 bg-[#f6b6be]/[0.07]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        yontem === id ? "text-[#f6b6be]" : "text-[#e5e2e3]/50"
                      }`}
                    />
                    <span className="text-sm font-semibold text-[#e5e2e3]">
                      {label}
                    </span>
                    <span className="text-[11px] leading-snug text-[#e5e2e3]/45">
                      {not}
                    </span>
                  </button>
                ))}
              </div>

              {/* Yonteme ozel bilgilendirme */}
              <div className="mt-5">
                {yontem === "kart" && (
                  <p className="flex items-start gap-2 rounded-lg border border-[#f6b6be]/15 bg-[#f6b6be]/[0.05] px-4 py-3 text-xs leading-relaxed text-[#e5e2e3]/70">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#f6b6be]" />
                    iyzico’nun güvenli ödeme sayfasına yönlendirilirsiniz. Kart
                    bilgileriniz yalnızca iyzico tarafından işlenir, bizde
                    saklanmaz.
                  </p>
                )}
                {yontem === "havale" && (
                  <p className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-[#e5e2e3]/70">
                    <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-[#f6b6be]" />
                    Siparişi oluşturduğunuzda IBAN bilgilerimiz görüntülenir.
                    Ödemeniz hesabımıza geçtikten sonra siparişiniz hazırlanır.
                  </p>
                )}
                {yontem === "kapida" && (
                  <p className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-[#e5e2e3]/70">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#f6b6be]" />
                    Ödemeyi teslimat sırasında nakit veya kartla
                    yapabilirsiniz. Siparişiniz onaylandıktan sonra hazırlanır.
                  </p>
                )}
              </div>

              {genelHata && (
                <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {genelHata}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={status === "processing"}
                whileHover={status === "form" ? { scale: 1.02 } : undefined}
                whileTap={status === "form" ? { scale: 0.98 } : undefined}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#f6b6be] py-4 text-xs font-semibold uppercase tracking-widest text-[#131314] transition-colors hover:bg-[#f9cdd3] disabled:opacity-70"
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
                      {yontem === "kart" ? "Yönlendiriliyor..." : "İşleniyor..."}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      {butonMetni}
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
            {/* Kupon kodu */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <label className="mb-1.5 block text-xs font-medium text-[#e5e2e3]/60">
                Kupon Kodu
              </label>
              {kuponUygulanan ? (
                <div className="flex items-center justify-between rounded-lg border border-[#f6b6be]/40 bg-[#f6b6be]/10 px-3 py-2 text-sm text-[#f6b6be]">
                  <span>
                    {kuponUygulanan.toUpperCase()} uygulandı (-{formatPrice(discount)})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setKuponUygulanan(undefined);
                      setKuponGirdi("");
                      setKuponHata("");
                    }}
                    className="text-xs text-[#e5e2e3]/50 underline hover:text-[#e5e2e3]"
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={kuponGirdi}
                    onChange={(e) => setKuponGirdi(e.target.value)}
                    placeholder="Örn. ciceksel200"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#e5e2e3] placeholder-[#e5e2e3]/30 outline-none focus:border-[#f6b6be]/60"
                  />
                  <button
                    type="button"
                    onClick={kuponUygula}
                    className="shrink-0 rounded-lg border border-[#f6b6be]/40 px-4 py-2 text-xs font-semibold text-[#f6b6be] transition-colors hover:bg-[#f6b6be]/10"
                  >
                    Uygula
                  </button>
                </div>
              )}
              {kuponHata && (
                <p className="mt-1.5 text-xs text-red-400">{kuponHata}</p>
              )}
            </div>

            <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm text-[#e5e2e3]/70">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Teslimat</span>
                <span>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#f6b6be]">
                  <span>İndirim</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
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
