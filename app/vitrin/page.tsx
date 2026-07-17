import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FractalBloomBackground from "@/components/ui/fractal-bloom-background";
import FallingPetals from "@/components/ui/falling-petals";
import InteractiveShowcase from "@/components/ui/interactive-showcase";
import ModelShowcase from "@/components/ui/model-showcase";
import BouquetBuilder from "@/components/ui/bouquet-builder";
import RevealText from "@/components/ui/reveal-text";
import { getProducts, getFlowerStories, getBouquetFlowers } from "@/lib/store";

// 3D urunler ve atolye icerigi admin panelinden yonetilebildigi icin
// guncel veri okunur
export const dynamic = "force-dynamic";

export default async function VitrinPage() {
  const [products, flowerStories, bouquetFlowers] = await Promise.all([
    getProducts(),
    getFlowerStories(),
    getBouquetFlowers(),
  ]);
  const modelProducts = products.filter((p) => p.model);

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
          <InteractiveShowcase flowers={flowerStories} />
        </div>

        {/* 3D koleksiyon — ana sayfadan buraya tasindi */}
        <ModelShowcase products={modelProducts} />

        {/* Kendi buketini olustur */}
        <BouquetBuilder flowers={bouquetFlowers} />

        {/* Marka imza bandi — hover'da harflerin ardinda cicekler belirir */}
        <RevealText />
      </div>
    </main>
  );
}
