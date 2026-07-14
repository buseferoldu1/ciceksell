import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FractalBloomBackground from "@/components/ui/fractal-bloom-background";
import FallingPetals from "@/components/ui/falling-petals";
import InteractiveShowcase from "@/components/ui/interactive-showcase";
import RevealText from "@/components/ui/reveal-text";

export default function VitrinPage() {
  return (
    <main className="relative min-h-screen bg-[#131314]">
      <FractalBloomBackground />

      <Link
        href="/"
        className="fixed left-5 top-5 z-40 flex items-center gap-2 rounded-full border border-[#f6b6be]/40 bg-[#131314]/70 px-4 py-2 text-xs font-medium text-[#e5e2e3] backdrop-blur-sm transition-colors hover:border-[#f6b6be] hover:text-[#f6b6be]"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfa
      </Link>

      <div className="relative z-10">
        <div className="relative">
          <FallingPetals count={12} />
          <InteractiveShowcase />
        </div>

        {/* Marka imza bandi — hover'da harflerin ardinda cicekler belirir */}
        <RevealText />
      </div>
    </main>
  );
}
