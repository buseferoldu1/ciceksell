"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthForm from "@/components/ui/auth-form";
import FallingPetals from "@/components/ui/falling-petals";

export default function GirisPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f2ef] px-4 py-10">
      <FallingPetals count={10} color="#d9594c" />

      <Link
        href="/"
        className="group absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-[#33323a]/15 bg-white/70 px-4 py-2 text-xs font-medium text-[#33323a] backdrop-blur-sm transition-colors hover:border-[#d9594c] hover:text-[#d9594c]"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Ana Sayfa
      </Link>

      <div className="relative z-10 w-full max-w-5xl">
        <AuthForm
          onSuccess={() => {
            router.push("/");
            router.refresh();
          }}
        />
      </div>
    </main>
  );
}
