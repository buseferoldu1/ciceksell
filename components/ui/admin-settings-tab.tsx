"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { DEFAULT_CONTACT, type ContactSettings } from "@/lib/site";

interface Props {
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
  onUnauthorized: () => void;
}

const ALANLAR: { key: keyof ContactSettings; label: string; placeholder?: string }[] = [
  { key: "phone", label: "Telefon", placeholder: "+90 5xx xxx xx xx" },
  { key: "email", label: "E-posta", placeholder: "ornek@ciceksel.com" },
  { key: "addressLine1", label: "Adres — 1. satır" },
  { key: "addressLine2", label: "Adres — 2. satır (ilçe/il/posta kodu)" },
  { key: "addressShort", label: "Adres — kısa (footer için)" },
  { key: "instagram", label: "Instagram bağlantısı", placeholder: "https://instagram.com/..." },
  { key: "instagramHandle", label: "Instagram kullanıcı adı", placeholder: "@kullaniciadi" },
  { key: "responseTime", label: "Yanıt süresi metni" },
];

const BANKA_ALANLARI: { key: keyof ContactSettings; label: string; placeholder?: string }[] = [
  { key: "bankHolder", label: "Hesap sahibi" },
  { key: "bankName", label: "Banka adı" },
  { key: "bankIban", label: "IBAN", placeholder: "TR.. .... .... .... .... .... .." },
];

/**
 * Iletisim + banka (havale/EFT) bilgilerini admin panelinden duzenler.
 * Kaydedilen deger tum sitede aninda (bir sonraki sayfa yuklemesinde)
 * gecerli olur — layout.tsx bu ayarlari her istekte okur.
 */
export default function AdminSettingsTab({ authedFetch, onUnauthorized }: Props) {
  const [form, setForm] = useState<ContactSettings>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/contact")
      .then((r) => r.json())
      .then((data) => setForm(data))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof ContactSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const kaydet = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authedFetch("/api/settings/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");
      setForm(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#d9594c]";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#d9594c]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-6 text-sm text-[#33323a]/60">
        Bu bilgiler telefon, e-posta, adres, Instagram ve havale/EFT
        hesap bilgileri olarak sitenin her yerinde (üst menü, footer, iletişim
        bölümü, ödeme sayfası) kullanılır.
      </p>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-lg font-bold">İletişim Bilgileri</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ALANLAR.map(({ key, label, placeholder }) => (
            <div key={key} className={key.startsWith("address") ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 block text-xs font-medium text-[#33323a]/60">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h3 className="mb-1 font-serif text-lg font-bold">Havale / EFT Hesabı</h3>
        <p className="mb-4 text-xs text-[#33323a]/50">
          IBAN boş bırakılırsa ödeme sayfasında Havale/EFT seçeneği otomatik
          gizlenir.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BANKA_ALANLARI.map(({ key, label, placeholder }) => (
            <div key={key} className={key === "bankIban" ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 block text-xs font-medium text-[#33323a]/60">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className={`${inputCls} ${key === "bankIban" ? "font-mono" : ""}`}
              />
            </div>
          ))}
        </div>
      </section>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={kaydet}
        disabled={saving}
        className="mt-6 flex items-center gap-2 rounded-full bg-[#d9594c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c2493d] disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saved ? "Kaydedildi ✓" : "Kaydet"}
      </button>
    </div>
  );
}
