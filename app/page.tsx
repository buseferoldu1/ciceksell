import Navbar from "@/components/ui/navbar";
import BloomHero from "@/components/ui/bloom-hero";
import Features from "@/components/ui/features";
import ModelShowcase from "@/components/ui/model-showcase";
import About from "@/components/ui/about";
import Faq from "@/components/ui/faq";
import Contact from "@/components/ui/contact";
import Footer from "@/components/ui/footer";
import { getProducts } from "@/lib/store";

// Urunler admin panelinden yonetildigi icin sayfa her istekte
// guncel veriyi okur.
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const modelProducts = products.filter((p) => p.model);

  return (
    <main>
      <Navbar />
      <BloomHero products={products} />
      <Features />
      <ModelShowcase products={modelProducts} />
      <About />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
