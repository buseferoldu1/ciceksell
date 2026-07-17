"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Flower2,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import AdminLogin from "@/components/ui/admin-login";
import { StatsCard } from "@/components/ui/stats-card-1";
import { gorseliHazirla } from "@/lib/client-image";
import AdminSettingsTab from "@/components/ui/admin-settings-tab";
import AdminWorkshopTab from "@/components/ui/admin-workshop-tab";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/lib/store";

const STATUS_LABELS: Record<OrderStatus, string> = {
  yeni: "Yeni",
  hazirlaniyor: "Hazırlanıyor",
  yolda: "Yolda",
  "teslim-edildi": "Teslim Edildi",
  iptal: "İptal",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  yeni: "bg-blue-100 text-blue-700",
  hazirlaniyor: "bg-amber-100 text-amber-700",
  yolda: "bg-purple-100 text-purple-700",
  "teslim-edildi": "bg-emerald-100 text-emerald-700",
  iptal: "bg-red-100 text-red-700",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  odendi: "Ödendi",
  beklemede: "Ödeme Bekliyor",
  basarisiz: "Ödeme Başarısız",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  odendi: "bg-emerald-100 text-emerald-700",
  beklemede: "bg-amber-100 text-amber-700",
  basarisiz: "bg-red-100 text-red-700",
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  kart: "Kart",
  havale: "Havale/EFT",
  kapida: "Kapıda",
};

interface ProductForm {
  name: string;
  tag: string;
  price: string;
  image: string;
}

const EMPTY_PRODUCT: ProductForm = { name: "", tag: "", price: "", image: "" };

export default function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  // Durum/silme gibi islemlerde olusan hatalar (onceden sessizce yutuluyordu)
  const [actionError, setActionError] = useState("");
  const [tab, setTab] = useState<
    "siparisler" | "urunler" | "atolye" | "ayarlar"
  >("siparisler");

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Product | "yeni" | null>(null);
  const [pform, setPform] = useState<ProductForm>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const authedFetch = useCallback(
    (url: string, init: RequestInit = {}, k?: string) =>
      fetch(url, {
        ...init,
        headers: {
          ...(init.headers || {}),
          "x-admin-key": k ?? key ?? "",
        },
      }),
    [key]
  );

  const loadAll = useCallback(
    async (k: string) => {
      setLoading(true);
      try {
        const [oRes, pRes] = await Promise.all([
          authedFetch("/api/orders", {}, k),
          fetch("/api/products"),
        ]);
        if (oRes.status === 401) throw new Error("unauthorized");
        setOrders(await oRes.json());
        setProducts(await pRes.json());
        return true;
      } catch {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [authedFetch]
  );

  // Oturum anahtarini hatirla
  useEffect(() => {
    const saved = sessionStorage.getItem("ciceksel-admin-key");
    if (saved) {
      setKey(saved);
      loadAll(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const ok = await loadAll(password);
    if (ok) {
      setKey(password);
      sessionStorage.setItem("ciceksel-admin-key", password);
    } else {
      setLoginError("Şifre hatalı");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("ciceksel-admin-key");
    setKey(null);
    setPassword("");
  };

  const setOrderStatus = async (id: string, status: OrderStatus) => {
    const previous = orders.find((o) => o.id === id)?.status;
    setActionError("");
    // Iyimser guncelleme: ekran aninda tepki verir
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      const res = await authedFetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        // Onceden hata sessizce yutuluyordu: istek basarisiz olunca ekran
        // eski degere donuyor, kullanici NEDEN oldugunu goremiyordu.
        if (res.status === 401) {
          sessionStorage.removeItem("ciceksel-admin-key");
          setKey(null);
          // Panel kapandigi icin mesaji giris ekraninda goster
          setLoginError("Oturum süresi doldu, tekrar giriş yapın");
          throw new Error("Oturum süresi doldu, tekrar giriş yapın");
        }
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Durum güncellenemedi (${res.status})`);
      }
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      // Basarisizsa eski duruma geri al
      if (previous) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: previous } : o))
        );
      }
      setActionError(
        err instanceof Error ? err.message : "Durum güncellenemedi"
      );
    }
  };

  // Havale/kapida siparislerinde odeme durumunu degistirir (orn. onaylama)
  const setPaymentStatus = async (id: string, paymentStatus: PaymentStatus) => {
    const previous = orders.find((o) => o.id === id)?.paymentStatus;
    setActionError("");
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, paymentStatus } : o))
    );
    try {
      const res = await authedFetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem("ciceksel-admin-key");
          setKey(null);
          setLoginError("Oturum süresi doldu, tekrar giriş yapın");
          throw new Error("Oturum süresi doldu, tekrar giriş yapın");
        }
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Ödeme güncellenemedi (${res.status})`);
      }
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      if (previous) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, paymentStatus: previous } : o))
        );
      }
      setActionError(
        err instanceof Error ? err.message : "Ödeme güncellenemedi"
      );
    }
  };

  const openEditor = (p: Product | "yeni") => {
    setEditing(p);
    setFormError("");
    setPform(
      p === "yeni"
        ? EMPTY_PRODUCT
        : { name: p.name, tag: p.tag, price: String(p.price), image: p.image }
    );
  };

  const handleUpload = async (file: File) => {
    setUploadBusy(true);
    setFormError("");
    try {
      const yuklenecekDosya = await gorseliHazirla(file);
      const fd = new FormData();
      fd.append("file", yuklenecekDosya);
      const res = await authedFetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Yükleme başarısız");
      setPform((f) => ({ ...f, image: json.path }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setUploadBusy(false);
    }
  };

  const saveProduct = async () => {
    const price = Number(pform.price);
    if (pform.name.trim().length < 2) return setFormError("Ürün adı girin");
    if (!Number.isFinite(price) || price <= 0)
      return setFormError("Geçerli bir fiyat girin");
    if (!pform.image) return setFormError("Bir fotoğraf yükleyin");
    setSaving(true);
    setFormError("");
    try {
      const body = JSON.stringify({
        name: pform.name.trim(),
        tag: pform.tag.trim(),
        price,
        image: pform.image,
      });
      const res =
        editing === "yeni"
          ? await authedFetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
            })
          : await authedFetch(`/api/products/${(editing as Product).id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body,
            });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Kaydedilemedi");
      setProducts((prev) =>
        editing === "yeni"
          ? [...prev, json]
          : prev.map((p) => (p.id === json.id ? json : p))
      );
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (p: Product) => {
    if (!window.confirm(`"${p.name}" ürünü silinsin mi?`)) return;
    setActionError("");
    const res = await authedFetch(`/api/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      return;
    }
    // Hata artik sessizce yutulmuyor
    if (res.status === 401) {
      sessionStorage.removeItem("ciceksel-admin-key");
      setKey(null);
      setLoginError("Oturum süresi doldu, tekrar giriş yapın");
      return;
    }
    const data = await res.json().catch(() => null);
    setActionError(data?.error ?? `Ürün silinemedi (${res.status})`);
  };

  // ---------- Giris ekrani (/giris ile ayni duzen) ----------
  if (!key) {
    return (
      <AdminLogin
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
        error={loginError}
      />
    );
  }

  // ---------- Panel ----------
  return (
    <main className="min-h-screen bg-[#f4f2ef] text-[#33323a]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Flower2 className="h-6 w-6 text-[#d9594c]" />
            <h1 className="font-serif text-xl font-bold">Çiçeksel Yönetim</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-[#33323a]/60 hover:text-[#d9594c]"
            >
              Siteyi Gör
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs font-medium hover:border-[#d9594c] hover:text-[#d9594c]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Çıkış
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-6 px-6">
          {(
            [
              ["siparisler", "Siparişler", ShoppingBag, orders.length],
              ["urunler", "Ürünler", Package, products.length],
              ["atolye", "Atölye", Sparkles, null],
              ["ayarlar", "Site Ayarları", Settings, null],
            ] as const
          ).map(([k, label, Icon, count]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`relative flex items-center gap-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                tab === k ? "text-[#d9594c]" : "text-[#33323a]/50 hover:text-[#33323a]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {count !== null && (
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">
                  {count}
                </span>
              )}
              {tab === k && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-[#d9594c]"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Islem hatalari artik gorunur (onceden sessizce yutuluyordu) */}
        <AnimatePresence>
          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <span className="text-sm text-red-700">{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError("")}
                aria-label="Hatayı kapat"
                className="text-red-400 transition-colors hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#d9594c]" />
          </div>
        )}

        {/* ---------- Siparisler ---------- */}
        {/* Istatistikler: gercek siparis/urun verisinden hesaplanir */}
        {!loading && tab === "siparisler" && orders.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              index={0}
              title="Toplam Ciro"
              value={formatPrice(
                orders
                  .filter((o) => o.status !== "iptal")
                  .reduce((s, o) => s + o.total, 0)
              )}
              icon={<Wallet className="h-4 w-4" />}
              change={`${orders.filter((o) => o.status === "iptal").length} iptal hariç`}
            />
            <StatsCard
              index={1}
              title="Sipariş"
              value={String(orders.length)}
              icon={<ShoppingBag className="h-4 w-4" />}
              change={`${orders.filter((o) => o.status === "teslim-edildi").length} teslim edildi`}
              changeType="positive"
            />
            <StatsCard
              index={2}
              title="Bekleyen"
              value={String(
                orders.filter((o) => o.status === "yeni" || o.status === "hazirlaniyor")
                  .length
              )}
              icon={<Clock className="h-4 w-4" />}
              change="ilgilenilmeyi bekliyor"
              changeType={
                orders.filter((o) => o.status === "yeni").length > 0
                  ? "negative"
                  : "neutral"
              }
            />
            <StatsCard
              index={3}
              title="Ortalama Sepet"
              value={formatPrice(
                Math.round(
                  orders.filter((o) => o.status !== "iptal").reduce((s, o) => s + o.total, 0) /
                    Math.max(1, orders.filter((o) => o.status !== "iptal").length)
                )
              )}
              icon={<Package className="h-4 w-4" />}
              change={`${products.length} ürün katalogda`}
            />
          </div>
        )}

        {!loading && tab === "siparisler" && (
          <div className="space-y-4">
            {orders.length === 0 && (
              <p className="py-16 text-center text-[#33323a]/50">
                Henüz sipariş yok. Sitede sepete ürün ekleyip ödeme yaparak
                deneyebilirsiniz.
              </p>
            )}
            {orders.map((o) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-lg font-bold">{o.id}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}
                      >
                        {STATUS_LABELS[o.status]}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_COLORS[o.paymentStatus]}`}
                      >
                        {PAYMENT_LABELS[o.paymentStatus]}
                      </span>
                      <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-[#33323a]/70">
                        {METHOD_LABELS[o.paymentMethod]}
                      </span>
                      {o.paymentStatus === "beklemede" &&
                        o.paymentMethod !== "kart" && (
                          <button
                            type="button"
                            onClick={() => setPaymentStatus(o.id, "odendi")}
                            className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                          >
                            Ödemeyi Onayla
                          </button>
                        )}
                    </div>
                    <div className="mt-1 text-xs text-[#33323a]/50">
                      {new Date(o.createdAt).toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <select
                    value={o.status}
                    onChange={(e) =>
                      setOrderStatus(o.id, e.target.value as OrderStatus)
                    }
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#d9594c]"
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f4f2ef] p-4 text-sm">
                    <div className="font-semibold">{o.customer.name}</div>
                    <div className="text-[#33323a]/60">{o.customer.phone}</div>
                    <div className="mt-1 text-[#33323a]/60">
                      {o.customer.address}
                    </div>
                    {o.customer.deliveryDate && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#d9594c]/10 px-2.5 py-1 text-xs font-semibold text-[#d9594c]">
                        <CalendarDays className="h-3 w-3" />
                        Teslimat:{" "}
                        {new Date(o.customer.deliveryDate).toLocaleDateString(
                          "tr-TR",
                          { day: "numeric", month: "long", weekday: "long" }
                        )}
                      </div>
                    )}
                    {o.customer.note && (
                      <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs italic text-[#33323a]/70">
                        Kart notu: “{o.customer.note}”
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    {o.items.map((i) => (
                      <div
                        key={i.id}
                        className="flex justify-between border-b border-black/5 py-1.5"
                      >
                        <span>
                          {i.name}{" "}
                          <span className="text-[#33323a]/40">× {i.qty}</span>
                        </span>
                        <span>{formatPrice(i.price * i.qty)}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between font-serif text-base font-bold">
                      <span>Toplam</span>
                      <span className="text-[#d9594c]">
                        {formatPrice(o.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ---------- Urunler ---------- */}
        {!loading && tab === "urunler" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-[#33323a]/60">
                Ürünleri düzenleyin, silin veya yeni ürün ekleyin — değişiklikler
                sitede anında görünür.
              </p>
              <button
                type="button"
                onClick={() => openEditor("yeni")}
                className="flex items-center gap-2 rounded-full bg-[#d9594c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c2493d]"
              >
                <Plus className="h-4 w-4" />
                Yeni Ürün
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-20 w-16 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between overflow-hidden">
                    <div>
                      <div className="truncate text-sm font-semibold">
                        {p.name}
                        {p.model && (
                          <span className="ml-1 rounded bg-purple-100 px-1.5 text-[10px] font-bold text-purple-700">
                            3D
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-[#33323a]/50">
                        {p.tag}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-[#d9594c]">
                        {formatPrice(p.price)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditor(p)}
                        className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs hover:border-[#d9594c] hover:text-[#d9594c]"
                      >
                        <Pencil className="h-3 w-3" />
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(p)}
                        className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs text-red-500 hover:border-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Atolye icerigi ---------- */}
        {!loading && tab === "atolye" && (
          <AdminWorkshopTab
            authedFetch={authedFetch}
            onUnauthorized={() => {
              sessionStorage.removeItem("ciceksel-admin-key");
              setKey(null);
              setLoginError("Oturum süresi doldu, tekrar giriş yapın");
            }}
          />
        )}

        {/* ---------- Site ayarlari ---------- */}
        {!loading && tab === "ayarlar" && (
          <AdminSettingsTab
            authedFetch={authedFetch}
            onUnauthorized={() => {
              sessionStorage.removeItem("ciceksel-admin-key");
              setKey(null);
              setLoginError("Oturum süresi doldu, tekrar giriş yapın");
            }}
          />
        )}
      </div>

      {/* ---------- Urun duzenleme paneli ---------- */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold">
                  {editing === "yeni" ? "Yeni Ürün" : "Ürünü Düzenle"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Kapat"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="relative h-36 w-28 overflow-hidden rounded-xl border border-black/10 bg-[#f4f2ef]">
                    {pform.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pform.image}
                        alt="Ürün fotoğrafı"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#33323a]/40">
                        Fotoğraf yok
                      </div>
                    )}
                    {uploadBusy && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="h-5 w-5 animate-spin text-[#d9594c]" />
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
                      if (f) handleUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadBusy}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium hover:border-[#d9594c] hover:text-[#d9594c] disabled:opacity-50"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Fotoğraf Yükle
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <input
                    placeholder="Ürün adı"
                    value={pform.name}
                    onChange={(e) =>
                      setPform((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#d9594c]"
                  />
                  <textarea
                    placeholder="Kısa açıklama"
                    rows={3}
                    value={pform.tag}
                    onChange={(e) =>
                      setPform((f) => ({ ...f, tag: e.target.value }))
                    }
                    className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#d9594c]"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#33323a]/40">
                      ₺
                    </span>
                    <input
                      placeholder="Fiyat"
                      inputMode="numeric"
                      value={pform.price}
                      onChange={(e) =>
                        setPform((f) => ({
                          ...f,
                          price: e.target.value.replace(/[^\d.]/g, ""),
                        }))
                      }
                      className="w-full rounded-lg border border-black/10 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-[#d9594c]"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <p className="mt-3 text-xs text-red-500">{formError}</p>
              )}

              <button
                type="button"
                onClick={saveProduct}
                disabled={saving || uploadBusy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#d9594c] py-3 text-sm font-semibold text-white hover:bg-[#c2493d] disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing === "yeni" ? "Ürünü Ekle" : "Kaydet"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
