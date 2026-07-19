"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { gorseliHazirla } from "@/lib/client-image";
import { DEFAULT_FLOWER_STORIES, type FlowerStory } from "@/lib/flower-stories";
import { DEFAULT_FLOWER_OPTIONS, FLOWER_CATEGORIES, type FlowerOption } from "@/lib/bouquet";
import { formatPrice } from "@/lib/products";

interface Props {
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
  onUnauthorized: () => void;
}

/**
 * Atolye (/vitrin) sayfasinin duzenlenebilir icerigi:
 *  - Cicek hikayeleri (Gul/Orkide/Ortanca kartlari — acilis)
 *  - Kendi Buketini Olustur cicek listesi (isim/fiyat/not/fotograf)
 * 3D model dosyalari (GLB) admin panelinden yuklenmez; yalnizca mevcut
 * model yolu metin olarak gosterilir/duzenlenebilir (ileri seviye).
 */
export default function AdminWorkshopTab({ authedFetch, onUnauthorized }: Props) {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<FlowerStory[]>(DEFAULT_FLOWER_STORIES);
  const [flowers, setFlowers] = useState<FlowerOption[]>(DEFAULT_FLOWER_OPTIONS);
  const [savingStories, setSavingStories] = useState(false);
  const [savingFlowers, setSavingFlowers] = useState(false);
  const [storiesError, setStoriesError] = useState("");
  const [flowersError, setFlowersError] = useState("");
  const [storiesSaved, setStoriesSaved] = useState(false);
  const [flowersSaved, setFlowersSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings/flower-stories").then((r) => r.json()),
      fetch("/api/settings/bouquet-flowers").then((r) => r.json()),
    ])
      .then(([s, f]) => {
        setStories(s);
        setFlowers(f);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveStories = async (next: FlowerStory[]) => {
    setSavingStories(true);
    setStoriesError("");
    try {
      const res = await authedFetch("/api/settings/flower-stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");
      setStories(data);
      setStoriesSaved(true);
      setTimeout(() => setStoriesSaved(false), 2500);
    } catch (err) {
      setStoriesError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSavingStories(false);
    }
  };

  const saveFlowers = async (next: FlowerOption[]) => {
    setSavingFlowers(true);
    setFlowersError("");
    try {
      const res = await authedFetch("/api/settings/bouquet-flowers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");
      setFlowers(data);
      setFlowersSaved(true);
      setTimeout(() => setFlowersSaved(false), 2500);
    } catch (err) {
      setFlowersError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSavingFlowers(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#d9594c]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <StoryEditor
        stories={stories}
        setStories={setStories}
        onSave={() => saveStories(stories)}
        saving={savingStories}
        error={storiesError}
        saved={storiesSaved}
        authedFetch={authedFetch}
      />
      <FlowerEditor
        flowers={flowers}
        setFlowers={setFlowers}
        onSave={() => saveFlowers(flowers)}
        saving={savingFlowers}
        error={flowersError}
        saved={flowersSaved}
        authedFetch={authedFetch}
      />
    </div>
  );
}

/* -------------------------- Cicek hikayeleri -------------------------- */

function StoryEditor({
  stories,
  setStories,
  onSave,
  saving,
  error,
  saved,
  authedFetch,
}: {
  stories: FlowerStory[];
  setStories: (fn: (prev: FlowerStory[]) => FlowerStory[]) => void;
  onSave: () => void;
  saving: boolean;
  error: string;
  saved: boolean;
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
}) {
  const update = (i: number, patch: Partial<FlowerStory>) =>
    setStories((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const remove = (i: number) => {
    if (!window.confirm("Bu çiçek hikayesi silinsin mi?")) return;
    setStories((prev) => prev.filter((_, idx) => idx !== i));
  };

  const add = () =>
    setStories((prev) => [
      ...prev,
      {
        id: Date.now(),
        category: "Atölye Serisi",
        name: "",
        description: "",
        origin: "",
        family: "",
        story: "",
        image: "",
        thumbnail: "",
        model: "",
      },
    ]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold">
            Atölye Çiçek Hikayeleri
          </h3>
          <p className="text-xs text-[#33323a]/50">
            /vitrin sayfasının açılışındaki Gül/Orkide/Ortanca kartları.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs font-medium hover:border-[#d9594c] hover:text-[#d9594c]"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Çiçek
        </button>
      </div>

      <div className="space-y-4">
        {stories.map((s, i) => (
          <div
            key={s.id}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div className="flex gap-4">
              <PhotoField
                image={s.image}
                onChange={(url) => update(i, { image: url, thumbnail: url })}
                authedFetch={authedFetch}
              />
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <LabeledInput
                  label="Ad"
                  value={s.name}
                  onChange={(v) => update(i, { name: v })}
                />
                <LabeledInput
                  label="Kategori etiketi"
                  value={s.category}
                  onChange={(v) => update(i, { category: v })}
                />
                <LabeledInput
                  label="Köken"
                  value={s.origin}
                  onChange={(v) => update(i, { origin: v })}
                />
                <LabeledInput
                  label="Familya"
                  value={s.family}
                  onChange={(v) => update(i, { family: v })}
                />
                <div className="sm:col-span-2">
                  <LabeledTextarea
                    label="Kısa açıklama"
                    value={s.description}
                    onChange={(v) => update(i, { description: v })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <LabeledTextarea
                    label="Hikaye"
                    value={s.story}
                    onChange={(v) => update(i, { story: v })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <LabeledInput
                    label="3D model dosya yolu (public/models/*.glb)"
                    value={s.model}
                    onChange={(v) => update(i, { model: v })}
                    mono
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              Bu çiçeği sil
            </button>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-full bg-[#d9594c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c2493d] disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saved ? "Kaydedildi ✓" : "Çiçek Hikayelerini Kaydet"}
      </button>
    </section>
  );
}

/* --------------------------- Buket cicekleri --------------------------- */

function FlowerEditor({
  flowers,
  setFlowers,
  onSave,
  saving,
  error,
  saved,
  authedFetch,
}: {
  flowers: FlowerOption[];
  setFlowers: (fn: (prev: FlowerOption[]) => FlowerOption[]) => void;
  onSave: () => void;
  saving: boolean;
  error: string;
  saved: boolean;
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
}) {
  const update = (i: number, patch: Partial<FlowerOption>) =>
    setFlowers((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const remove = (i: number) => {
    if (!window.confirm("Bu çiçek buket listesinden silinsin mi?")) return;
    setFlowers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const add = () =>
    setFlowers((prev) => [
      ...prev,
      {
        id: `cicek-${Date.now().toString(36)}`,
        name: "",
        price: 0,
        image: "",
        note: "",
        color: "#d9594c",
        model: "",
        category: "kesme",
      },
    ]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold">
            Kendi Buketini Oluştur — Çiçekler
          </h3>
          <p className="text-xs text-[#33323a]/50">
            Dal başı fiyat ve seçenekler. 3D önizleme modeli yalnızca mevcut
            çiçeklerde korunur; yeni eklenen çiçeğin 3D önizlemesi olmaz.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs font-medium hover:border-[#d9594c] hover:text-[#d9594c]"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Çiçek
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {flowers.map((f, i) => (
          <div
            key={f.id}
            className="flex gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
          >
            <PhotoField
              image={f.image}
              onChange={(url) => update(i, { image: url })}
              authedFetch={authedFetch}
              small
            />
            <div className="flex-1 space-y-2">
              <LabeledInput
                label="Ad"
                value={f.name}
                onChange={(v) => update(i, { name: v })}
              />
              <div className="grid grid-cols-2 gap-2">
                <LabeledInput
                  label="Fiyat (₺/dal)"
                  value={String(f.price)}
                  onChange={(v) =>
                    update(i, { price: Number(v.replace(/[^\d]/g, "")) || 0 })
                  }
                />
                <LabeledInput
                  label="Renk"
                  value={f.color}
                  onChange={(v) => update(i, { color: v })}
                  type="color"
                />
              </div>
              <LabeledInput
                label="Kısa not"
                value={f.note}
                onChange={(v) => update(i, { note: v })}
              />
              <div>
                <span className="mb-1 block text-[11px] font-medium text-[#33323a]/60">
                  Kategori
                </span>
                <select
                  value={f.category}
                  onChange={(e) =>
                    update(i, { category: e.target.value as FlowerOption["category"] })
                  }
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#d9594c]"
                >
                  {FLOWER_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#33323a]/40">
                  {f.model ? "3D model: mevcut" : "3D model yok"} ·{" "}
                  {formatPrice(f.price)}/dal
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-full bg-[#d9594c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c2493d] disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saved ? "Kaydedildi ✓" : "Buket Çiçeklerini Kaydet"}
      </button>
    </section>
  );
}

/* ------------------------------ Ortak parcalar ------------------------------ */

function LabeledInput({
  label,
  value,
  onChange,
  mono,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[#33323a]/60">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#d9594c] ${
          mono ? "font-mono text-xs" : ""
        } ${type === "color" ? "h-9 px-1 py-1" : ""}`}
      />
    </div>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[#33323a]/60">
        {label}
      </label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#d9594c]"
      />
    </div>
  );
}

function PhotoField({
  image,
  onChange,
  authedFetch,
  small,
}: {
  image: string;
  onChange: (url: string) => void;
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
  small?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const hazir = await gorseliHazirla(file);
      const fd = new FormData();
      fd.append("file", hazir);
      const res = await authedFetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) onChange(json.path);
    } finally {
      setBusy(false);
    }
  };

  const boyut = small ? "h-20 w-16" : "h-28 w-24";

  return (
    <div className="shrink-0">
      <div
        className={`relative ${boyut} overflow-hidden rounded-xl border border-black/10 bg-[#f4f2ef]`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-[#33323a]/40">
            Yok
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-4 w-4 animate-spin text-[#d9594c]" />
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-full border border-black/10 px-2 py-1 text-[10px] font-medium hover:border-[#d9594c] hover:text-[#d9594c] disabled:opacity-50"
      >
        <ImagePlus className="h-3 w-3" />
        Değiştir
      </button>
    </div>
  );
}
