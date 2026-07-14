import FractalBloomBackground from "@/components/ui/fractal-bloom-background";
import InteractiveShowcase from "@/components/ui/interactive-showcase";

export default function VitrinPage() {
  return (
    <main className="relative min-h-screen bg-[#131314]">
      <FractalBloomBackground />
      <div className="relative z-10">
        <InteractiveShowcase />
      </div>
    </main>
  );
}
