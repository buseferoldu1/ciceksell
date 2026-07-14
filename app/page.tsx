import Navbar from "@/components/ui/navbar";
import FractalBloomHero from "@/components/ui/fractal-bloom-hero";
import Features from "@/components/ui/features";
import SocialProof from "@/components/ui/social-proof";

export default function Home() {
  return (
    <main>
      <Navbar />
      <FractalBloomHero />
      <Features />
      <SocialProof />
    </main>
  );
}
