"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Flower2, Loader2, Lock, ShieldCheck } from "lucide-react";

/**
 * Yonetici girisi — /giris ekraniyla ayni split-panel duzeni.
 * Musteri hesaplarindan farkli olarak tek ADMIN_KEY ile calisir.
 */
export default function AdminLogin({
  password,
  setPassword,
  onSubmit,
  error,
  busy,
}: {
  password: string;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
  busy?: boolean;
}) {
  const [pos, setPos] = useState({ x: 0 });
  const [hover, setHover] = useState(false);
  const [glow, setGlow] = useState({ x: 0, y: 0 });
  const [glowOn, setGlowOn] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f2ef] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl lg:grid-cols-2"
      >
        {/* Sol: form */}
        <div
          className="relative overflow-hidden px-6 py-12 sm:px-10 lg:px-12"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setGlow({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onMouseEnter={() => setGlowOn(true)}
          onMouseLeave={() => setGlowOn(false)}
        >
          <div
            className={`pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-gradient-to-r from-[#d9594c]/15 via-[#f6b6be]/15 to-[#d9594c]/10 blur-3xl transition-opacity duration-300 ${
              glowOn ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate(${glow.x - 210}px, ${glow.y - 210}px)`,
              transition: "transform 0.12s ease-out, opacity 0.3s",
            }}
          />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#33323a]/15">
                <Flower2 className="h-5 w-5 text-[#d9594c]" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-serif text-xl font-bold text-[#33323a]">
                  Çiçeksel
                </span>
                <span className="text-[10px] italic text-[#33323a]/45">
                  yönetim paneli
                </span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9594c]/25 bg-[#d9594c]/10 px-3 py-1 text-[11px] font-semibold text-[#d9594c]">
              <ShieldCheck className="h-3 w-3" />
              Yetkili Girişi
            </span>

            <h1 className="mb-1 mt-4 font-serif text-3xl font-bold text-[#33323a]">
              Yönetim Paneli
            </h1>
            <p className="mb-8 text-sm text-[#33323a]/55">
              Siparişleri ve ürünleri yönetmek için şifrenizi girin.
            </p>

            <form onSubmit={onSubmit} className="grid gap-4" noValidate>
              <div className="w-full text-left">
                <label className="mb-1.5 block text-xs font-medium text-[#33323a]/70">
                  Yönetici Şifresi
                </label>
                <div className="relative w-full">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 z-20 -translate-y-1/2 text-[#33323a]/35">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    autoFocus
                    disabled={busy}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    onMouseMove={(e) =>
                      setPos({
                        x:
                          e.clientX -
                          e.currentTarget.getBoundingClientRect().left,
                      })
                    }
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    placeholder="••••••••"
                    className="relative z-10 h-12 w-full rounded-lg border border-black/10 bg-white pl-10 pr-4 text-sm text-[#33323a] outline-none transition-all duration-200 placeholder:text-[#33323a]/25 focus:border-[#d9594c]/60 focus:shadow-[0_0_0_3px_rgba(217,89,76,0.10)] disabled:opacity-60"
                  />
                  {hover && (
                    <>
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] rounded-t-lg"
                        style={{
                          background: `radial-gradient(30px circle at ${pos.x}px 0px, #d9594c 0%, transparent 70%)`,
                        }}
                      />
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[2px] rounded-b-lg"
                        style={{
                          background: `radial-gradient(30px circle at ${pos.x}px 2px, #d9594c 0%, transparent 70%)`,
                        }}
                      />
                    </>
                  )}
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={busy}
                whileHover={busy ? undefined : { scale: 1.02 }}
                whileTap={busy ? undefined : { scale: 0.98 }}
                className="group/button relative mt-1 flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-[#d9594c] text-sm font-semibold text-white shadow-lg shadow-[#d9594c]/25 transition-colors hover:bg-[#c2493d] disabled:opacity-70"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Giriş Yap</span>
                )}
                <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                  <span className="relative h-full w-8 bg-white/20" />
                </span>
              </motion.button>
            </form>

            <Link
              href="/"
              className="group mt-6 flex items-center justify-center gap-1.5 text-xs text-[#33323a]/50 transition-colors hover:text-[#d9594c]"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Siteye dön
            </Link>
          </div>
        </div>

        {/* Sag: cicek gorseli */}
        <div className="relative hidden min-h-[520px] lg:block">
          <img
            src="/flowers/orkide.jpg"
            alt="Orkide"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#33323a]/85 via-[#33323a]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="font-serif text-2xl font-bold leading-snug">
              Atölyenin kalbi burada.
            </p>
            <p className="mt-2 text-sm text-white/70">
              Siparişler, ürünler ve fotoğraflar tek panelde.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
