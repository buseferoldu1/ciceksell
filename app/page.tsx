import Navbar from "@/components/ui/navbar";
import BloomHero from "@/components/ui/bloom-hero";
import Features from "@/components/ui/features";
import SocialProof from "@/components/ui/social-proof";
import Pricing from "@/components/ui/pricing";
import Faq from "@/components/ui/faq";
import Footer from "@/components/ui/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <BloomHero />
      <Features />
      <SocialProof />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
