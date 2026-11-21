"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import {
  DEFAULT_TEACHERS_DAY,
  teachersDayActive,
  type TeachersDaySettings,
  type TeachersDayVisibility,
} from "@/lib/teachers-day";

interface Props {
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
  onUnauthorized: () => void;
}

const GORUNURLUK: { value: TeachersDayVisibility; label: string; not: string }[] = [
  { value: "auto", label: "Otomatik", not: "1–25 Kasım arası ana sayfada görünür" },
  { value: "on", label: "Her zaman göster", not: "Tarihe bakmadan hemen yayınla" },
  { value: "off", label: "Gizle", not: "Ana sayfada hiç gösterme" },
];

/** Ogretmenler Gunu bolumunu admin panelinden duzenler / yonetir. */
export default function AdminTeachersDayTab({ authedFetch, onUnauthorized }: Props) {
  const [form, setForm] = useState<TeachersDaySettings>(DEFAULT_TEACHERS_DAY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings/teachers-day")
      .then((r) => r.json())
      .then((d) => setForm(d))
      .finally(() => setLoading(false));
  }, []);

  const set =
    (key: keyof TeachersDaySettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaved(false);
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const yukle = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await authedFetch("/api/upload", { method: "POST", body: fd });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Yüklenemedi");
      setSaved(false);
      setForm((f) => ({ ...f, photo: json.path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const kaydet = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authedFetch("/api/settings/teachers-day", {
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

  const yayinda = teachersDayActive(form);

  return (
    <div className="max-w-2xl">
      <p className="mb-6 text-sm text-[#33323a]/60">
        24 Kasım Öğretmenler Günü bölümü ana sayfada hero&apos;nun hemen altında
        görünür. Yazıları, fotoğrafı ve yayın durumunu buradan yönetebilirsiniz.
      </p>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold">Yayın Durumu</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              yayinda ? "bg-green-100 text-green-700" : "bg-black/5 text-[#33323a]/50"
            }`}
          >
            {yayinda ? "Şu an yayında" : "Şu an gizli"}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {GORUNURLUK.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => {
                setSaved(false);
                setForm((f) => ({ ...f, visibility: g.value }));
              }}
              className={`rounded-xl border p-3 text-left transition-colors ${
                form.visibility === g.value
                  ? "border-[#d9594c] bg-[#d9594c]/5"
                  : "border-black/10 hover:border-black/25"
              }`}
            >
              <div className="text-sm font-semibold">{g.label}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-[#33323a]/50">{g.not}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-lg font-bold">Atatürk Fotoğrafı</h3>
        <div className="flex items-center gap-5">
          <div className="h-32 w-24 shrink-0 overflow-hidden rounded-t-full rounded-b-lg border border-black/10 bg-[#f4f2ef]">
            {form.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photo} alt="" className="h-full w-full object-cover object-top grayscale" />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-[#33323a]/40">
                Yüklenmedi (hilal-yıldız amblemi gösterilir)
              </div>
            )}
          </div>
          <div className="space-y-2">
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
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs font-semibold hover:border-[#d9594c] hover:text-[#d9594c] disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Fotoğraf yükle
            </button>
            {form.photo && (
              <button
                type="button"
                onClick={() => {
                  setSaved(false);
                  setForm((f) => ({ ...f, photo: "" }));
                }}
                className="flex items-center gap-2 text-xs text-[#33323a]/50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" /> Kaldır
              </button>
            )}
            <p className="text-[11px] text-[#33323a]/45">
              Dikey (4:5) bir portre en iyi görünür; siyah-beyaza çevrilir.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-lg font-bold">Yazılar</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Üst başlık</label>
            <input value={form.eyebrow} onChange={set("eyebrow")} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ana başlık</label>
            <input value={form.title} onChange={set("title")} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Mesaj (paragrafları boş satırla ayırın)</label>
            <textarea value={form.message} onChange={set("message")} rows={10} className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Alıntı sözü</label>
              <input value={form.quote} onChange={set("quote")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Söz sahibi</label>
              <input value={form.quoteAuthor} onChange={set("quoteAuthor")} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Kampanya satırı (isteğe bağlı, örn. kupon bilgisi)</label>
            <input
              value={form.promo}
              onChange={set("promo")}
              placeholder="Örn. Öğretmenler Günü'ne özel çiçeklerde ücretsiz teslimat"
              className={inputCls}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Buton yazısı (boşsa buton gizlenir)</label>
              <input value={form.ctaLabel} onChange={set("ctaLabel")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Buton bağlantısı</label>
              <input value={form.ctaHref} onChange={set("ctaHref")} placeholder="/katalog" className={inputCls} />
            </div>
          </div>
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
        <button
          type="button"
          onClick={() => {
            setSaved(false);
            setForm((f) => ({ ...DEFAULT_TEACHERS_DAY, visibility: f.visibility, photo: f.photo }));
          }}
          className="text-xs text-[#33323a]/50 underline hover:text-[#33323a]"
        >
          Yazıları varsayılana döndür
        </button>
        {saved && <span className="text-sm text-green-600">Kaydedildi ✓</span>}
      </div>
    </div>
  );
}
