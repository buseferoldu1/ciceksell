"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Save, X } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import {
  DEFAULT_WORLD_GALLERY,
  WORLD_GALLERY_MAX,
  type WorldGallerySettings,
} from "@/lib/world-gallery";

interface Props {
  products: Product[];
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
  onUnauthorized: () => void;
}

/** Ana sayfadaki donen "Çiçeksel Dünyası" galerisini admin panelinden yonetir. */
export default function AdminWorldGalleryTab({ products, authedFetch, onUnauthorized }: Props) {
  const [form, setForm] = useState<WorldGallerySettings>(DEFAULT_WORLD_GALLERY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [arama, setArama] = useState("");

  useEffect(() => {
    fetch("/api/settings/world-gallery")
      .then((r) => r.json())
      .then((d) => setForm(d))
      .finally(() => setLoading(false));
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const secili = form.productIds.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  const dolu = secili.length >= WORLD_GALLERY_MAX;

  const degistir = (fn: (ids: string[]) => string[]) => {
    setSaved(false);
    setForm((f) => ({ ...f, productIds: fn(f.productIds) }));
  };
  const ekleCikar = (id: string) =>
    degistir((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= WORLD_GALLERY_MAX ? ids : [...ids, id]
    );
  const tasi = (i: number, yon: -1 | 1) =>
    degistir((ids) => {
      const j = i + yon;
      if (j < 0 || j >= ids.length) return ids;
      const k = [...ids];
      [k[i], k[j]] = [k[j], k[i]];
      return k;
    });

  const kaydet = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authedFetch("/api/settings/world-gallery", {
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

  const q = arama.trim().toLocaleLowerCase("tr");
  const liste = q
    ? products.filter((p) => p.name.toLocaleLowerCase("tr").includes(q))
    : products;

  return (
    <div className="max-w-3xl">
      <p className="mb-6 text-sm text-[#33323a]/60">
        Ana sayfadaki dönen &quot;Çiçeksel Dünyası&quot; galerisinde hangi ürünlerin, hangi
        sırayla görüneceğini buradan seçin. Hiç ürün seçmezseniz premium (3D modelli)
        ürünler öne alınarak otomatik seçilir.
      </p>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold">Bölüm</h3>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => {
                setSaved(false);
                setForm((f) => ({ ...f, enabled: e.target.checked }));
              }}
              className="h-4 w-4 accent-[#d9594c]"
            />
            Ana sayfada göster
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Başlık</label>
            <input
              value={form.title}
              onChange={(e) => {
                setSaved(false);
                setForm((f) => ({ ...f, title: e.target.value }));
              }}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Alt yazı</label>
            <input
              value={form.subtitle}
              onChange={(e) => {
                setSaved(false);
                setForm((f) => ({ ...f, subtitle: e.target.value }));
              }}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold">Seçili Ürünler</h3>
          <span className="text-xs text-[#33323a]/50">
            {secili.length} / {WORLD_GALLERY_MAX}
          </span>
        </div>
        {secili.length === 0 ? (
          <p className="py-3 text-sm text-[#33323a]/50">
            Seçim yok — premium ürünler otomatik gösteriliyor.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {secili.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-black/5 bg-[#f4f2ef]/60 p-2"
              >
                <span className="w-5 text-center text-xs font-semibold text-[#33323a]/40">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="h-12 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-[#d9594c]">{formatPrice(p.price)}</div>
                </div>
                <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0} aria-label="Yukarı" className="rounded-full p-1.5 hover:bg-black/5 disabled:opacity-25">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => tasi(i, 1)} disabled={i === secili.length - 1} aria-label="Aşağı" className="rounded-full p-1.5 hover:bg-black/5 disabled:opacity-25">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => ekleCikar(p.id)} aria-label="Çıkar" className="rounded-full p-1.5 text-red-500 hover:bg-red-50">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        )}
        {secili.length > 0 && (
          <button
            type="button"
            onClick={() => degistir(() => [])}
            className="mt-3 text-xs text-[#33323a]/50 underline hover:text-[#33323a]"
          >
            Seçimi temizle (otomatiğe dön)
          </button>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-serif text-lg font-bold">Ürün Ekle</h3>
          <input
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Ürün ara..."
            className="w-48 rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-[#d9594c]"
          />
        </div>
        {dolu && (
          <p className="mb-3 text-xs text-amber-600">
            En fazla {WORLD_GALLERY_MAX} ürün seçilebilir; yeni eklemek için birini çıkarın.
          </p>
        )}
        <div className="grid max-h-[28rem] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
          {liste.map((p) => {
            const on = form.productIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => ekleCikar(p.id)}
                disabled={!on && dolu}
                className={`relative overflow-hidden rounded-xl border text-left transition-colors disabled:opacity-40 ${
                  on ? "border-[#d9594c] ring-2 ring-[#d9594c]/30" : "border-black/10 hover:border-black/30"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="aspect-[4/3] w-full object-cover" />
                {on && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#d9594c] text-white">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <div className="p-2">
                  <div className="truncate text-xs font-medium">{p.name}</div>
                  <div className="text-[11px] text-[#d9594c]">{formatPrice(p.price)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

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
