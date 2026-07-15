"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2, Loader2, Lock, Mail, User as UserIcon } from "lucide-react";

/**
 * Referans "login-1" bileseninden uyarlandi:
 *  - Orijinal shadcn/koyu tema CSS degiskenlerini (--color-bg, --color-surface,
 *    --color-border) kullaniyordu; bunlar projede tanimli olmadigi icin alanlar
 *    renksiz cikardi. Mercan/charcoal paletimize gecirildi.
 *  - Orijinalde `onSubmit={()=>{e.preventDefault();}}` vardi: `e` tanimsiz
 *    oldugu icin forma basinca ReferenceError atiyordu. Gercek gonderim
 *    mantigiyla degistirildi.
 *  - Imlecle gezinen isik/parilti efekti korundu.
 */

interface AppInputProps {
  label: string;
  icon: ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function AppInput({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}: AppInputProps) {
  const [pos, setPos] = useState({ x: 0 });
  const [hover, setHover] = useState(false);

  return (
    <div className="w-full text-left">
      <label className="mb-1.5 block text-xs font-medium text-[#33323a]/70">
        {label}
      </label>
      <div className="relative w-full">
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-20 -translate-y-1/2 text-[#33323a]/35">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onMouseMove={(e) =>
            setPos({ x: e.clientX - e.currentTarget.getBoundingClientRect().left })
          }
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          placeholder={placeholder}
          className="relative z-10 h-12 w-full rounded-lg border border-black/10 bg-white pl-10 pr-4 text-sm text-[#33323a] outline-none transition-all duration-200 placeholder:text-[#33323a]/25 focus:border-[#d9594c]/60 focus:shadow-[0_0_0_3px_rgba(217,89,76,0.10)] disabled:opacity-60"
        />
        {/* Imleci takip eden ust/alt isik cizgisi */}
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
  );
}

type Mode = "giris" | "kaydol";

export default function AuthForm({
  onSuccess,
}: {
  onSuccess?: (name: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("giris");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Sol panelde imleci takip eden yumusak isik
  const [glow, setGlow] = useState({ x: 0, y: 0 });
  const [glowOn, setGlowOn] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        mode === "giris" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "giris" ? { email, password } : { name, email, password }
          ),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Bir hata oluştu");
      onSuccess?.(data.user?.name ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid w-full overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl lg:grid-cols-2">
      {/* Sol: form */}
      <div
        className="relative overflow-hidden px-6 py-10 sm:px-10 lg:px-12"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setGlow({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseEnter={() => setGlowOn(true)}
        onMouseLeave={() => setGlowOn(false)}
      >
        {/* Imleci takip eden parilti */}
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
                since 1984
              </span>
            </span>
          </div>

          {/* Sekmeler */}
          <div className="relative mb-7 flex gap-1 rounded-full bg-[#f4f2ef] p-1">
            {(["giris", "kaydol"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`relative flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  mode === m ? "text-white" : "text-[#33323a]/60 hover:text-[#33323a]"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-tab"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-[#d9594c]"
                  />
                )}
                <span className="relative z-10">
                  {m === "giris" ? "Giriş Yap" : "Kaydol"}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mb-1 font-serif text-3xl font-bold text-[#33323a]"
            >
              {mode === "giris" ? "Tekrar hoş geldiniz" : "Aramıza katılın"}
            </motion.h1>
          </AnimatePresence>
          <p className="mb-7 text-sm text-[#33323a]/55">
            {mode === "giris"
              ? "Siparişlerinizi takip etmek için giriş yapın."
              : "Hesap oluşturun, siparişleriniz kayıtlı kalsın."}
          </p>

          <form onSubmit={submit} className="grid gap-4" noValidate>
            <AnimatePresence initial={false}>
              {mode === "kaydol" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <AppInput
                    label="Ad Soyad"
                    icon={<UserIcon className="h-4 w-4" />}
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Adınız"
                    autoComplete="name"
                    disabled={busy}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AppInput
              label="E-posta"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ornek@eposta.com"
              autoComplete="email"
              disabled={busy}
            />
            <AppInput
              label="Şifre"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === "kaydol" ? "En az 8 karakter" : "••••••••"}
              autoComplete={mode === "giris" ? "current-password" : "new-password"}
              disabled={busy}
            />

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
                <span>{mode === "giris" ? "Giriş Yap" : "Hesap Oluştur"}</span>
              )}
              {/* Uzerinden gecen isik parlamasi */}
              <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                <span className="relative h-full w-8 bg-white/20" />
              </span>
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-[#33323a]/45">
            {mode === "giris" ? "Hesabınız yok mu? " : "Zaten üye misiniz? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "giris" ? "kaydol" : "giris");
                setError(null);
              }}
              className="font-semibold text-[#d9594c] hover:underline"
            >
              {mode === "giris" ? "Kaydolun" : "Giriş yapın"}
            </button>
          </p>
        </div>
      </div>

      {/* Sag: cicek gorseli */}
      <div className="relative hidden min-h-[560px] lg:block">
        <img
          src="/flowers/gul.jpg"
          alt="Kırmızı gül"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#33323a]/85 via-[#33323a]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="font-serif text-2xl font-bold leading-snug">
            Her duyguya en güzel çiçekle eşlik ediyoruz.
          </p>
          <p className="mt-2 text-sm text-white/70">
            1984&apos;ten bu yana Ankara Kızılay&apos;da.
          </p>
        </div>
      </div>
    </div>
  );
}
