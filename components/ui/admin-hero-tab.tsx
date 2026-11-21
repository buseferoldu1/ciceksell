"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { gorseliHazirla } from "@/lib/client-image";
import { formatPrice, type Product } from "@/lib/products";
import { DEFAULT_HERO, HERO_MAX_SLIDES, type HeroSettings, type HeroSlide } from "@/lib/hero";

interface Props {
  products: Product[];
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
  onUnauthorized: () => void;
}

/** Ana sayfanin ilk acilistaki buyuk vitrinini (hero slider) admin panelinden yonetir. */
export default function AdminHeroTab({ products, authedFetch, onUnauthorized }: Props) {
  const [form, setForm] = useState<HeroSettings>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hedefSlayt = useRef(0);

  useEffect(() => {
    fetch("/api/settings/hero")
      .then((r) => r.json())
      .then((d) => setForm(d))
      .finally(() => setLoading(false));
  }, []);

  const guncelle = (i: number, patch: Partial<HeroSlide>) => {
    setSaved(false);
    setForm((f) => ({ ...f, slides: f.slides.map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  };
  const tasi = (i: number, yon: -1 | 1) => {
    const j = i + yon;
    setSaved(false);
    setForm((f) => {
      if (j < 0 || j >= f.slides.length) return f;
      const k = [...f.slides];
      [k[i], k[j]] = [k[j], k[i]];
      return { ...f, slides: k };
    });
  };
  const sil = (i: number) => {
    setSaved(false);
    setForm((f) => ({ ...f, slides: f.slides.filter((_, k) => k !== i) }));
  };
  const ekle = () => {
    setSaved(false);
    setForm((f) => ({
      ...f,
      slides: [
        ...f.slides,
        { headlineTop: "Yeni", headlineBottom: "Slayt", productId: products[0]?.id ?? "", heroImage: "" },
      ],
    }));
  };

  const yukle = async (file: File) => {
    const i = hedefSlayt.current;
    setUploading(i);
    setError("");
    try {
      const hazir = await gorseliHazirla(file);
      const fd = new FormData();
      fd.append("file", hazir);
      const res = await authedFetch("/api/upload", { method: "POST", body: fd });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Yüklenemedi");
      guncelle(i, { heroImage: json.path });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setUploading(null);
    }
  };

  const kaydet = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authedFetch("/api/settings/hero", {
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
  const labelCls = "mb-1.5 block text-xs font-medium text-[#33323a]/60";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#d9594c]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <p className="mb-6 text-sm text-[#33323a]/60">
        Sitenin ilk açılışındaki büyük vitrin. Her slaytta iki satırlık başlık, öne çıkan ürün
        (fiyat ve &quot;Sepete Ekle&quot; bu ürüne bağlanır) ve isteğe bağlı özel bir görsel
        bulunur. Görsel yüklemezseniz ürünün fotoğrafı kullanılır.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) yukle(f);
          e.target.value = "";
        }}
      />

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h3 className="mb-1 font-serif text-lg font-bold">Kampanya Rozeti</h3>
        <p className="mb-3 text-xs text-[#33323a]/50">
          Başlığın üstündeki küçük etiket. Boş bırakırsanız gizlenir.
        </p>
        <input
          value={form.badge}
          onChange={(e) => {
            setSaved(false);
            setForm((f) => ({ ...f, badge: e.target.value }));
          }}
          className={inputCls}
        />
      </section>

      <div className="mt-6 space-y-4">
        {form.slides.map((s, i) => {
          const urun = products.find((p) => p.id === s.productId);
          const gorsel = s.heroImage || urun?.image;
          return (
            <section key={i} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-base font-bold">Slayt {i + 1}</h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0} aria-label="Yukarı" className="rounded-full p-1.5 hover:bg-black/5 disabled:opacity-25">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => tasi(i, 1)} disabled={i === form.slides.length - 1} aria-label="Aşağı" className="rounded-full p-1.5 hover:bg-black/5 disabled:opacity-25">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => sil(i)}
                    disabled={form.slides.length <= 1}
                    aria-label="Slaytı sil"
                    className="rounded-full p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-25"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="shrink-0 space-y-2">
                  <div className="h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-[#f4f2ef]">
                    {gorsel && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={gorsel} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={uploading === i}
                    onClick={() => {
                      hedefSlayt.current = i;
                      fileRef.current?.click();
                    }}
                    className="flex w-28 items-center justify-center gap-1.5 rounded-full border border-black/15 py-1.5 text-[11px] font-semibold hover:border-[#d9594c] hover:text-[#d9594c] disabled:opacity-50"
                  >
                    {uploading === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                    Görsel yükle
                  </button>
                  {s.heroImage && (
                    <button
                      type="button"
                      onClick={() => guncelle(i, { heroImage: "" })}
                      className="w-28 text-center text-[11px] text-[#33323a]/50 underline hover:text-red-500"
                    >
                      Ürün fotoğrafına dön
                    </button>
                  )}
                </div>

                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Başlık — 1. satır</label>
                    <input value={s.headlineTop} onChange={(e) => guncelle(i, { headlineTop: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Başlık — 2. satır</label>
                    <input value={s.headlineBottom} onChange={(e) => guncelle(i, { headlineBottom: e.target.value })} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Öne çıkan ürün</label>
                    <select
                      value={s.productId}
                      onChange={(e) => guncelle(i, { productId: e.target.value })}
                      className={inputCls}
                    >
                      {!urun && <option value={s.productId}>(Silinmiş ürün: {s.productId})</option>}
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatPrice(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {form.slides.length < HERO_MAX_SLIDES && (
        <button
          type="button"
          onClick={ekle}
          className="mt-4 flex items-center gap-2 rounded-full border border-dashed border-[#d9594c]/50 px-5 py-2.5 text-sm font-semibold text-[#d9594c] hover:bg-[#d9594c]/5"
        >
          <Plus className="h-4 w-4" /> Slayt ekle
        </button>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={kaydet}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-[#d9594c] px-7 py-3 text-sm font-semibold text-white hover:bg-[#c2493d] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
        {saved && <span className="text-sm text-green-600">Kaydedildi ✓</span>}
      </div>
    </div>
  );
}
