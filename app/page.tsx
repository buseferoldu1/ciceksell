import SubscriptionLock from "@/components/ui/subscription-lock";
import Navbar from "@/components/ui/navbar";
import BloomHero from "@/components/ui/bloom-hero";
import Features from "@/components/ui/features";
import CircularGallerySection from "@/components/ui/circular-gallery-section";
import About from "@/components/ui/about";
import Yorumlar from "@/components/ui/testimonials-section";
import Faq from "@/components/ui/faq";
import Contact from "@/components/ui/contact";
import Footer from "@/components/ui/footer";
import TeachersDay from "@/components/ui/teachers-day";
import { getProducts, getHeroSettings, getTeachersDay, getWorldGallery } from "@/lib/store";
import { teachersDayActive } from "@/lib/teachers-day";

// Urunler admin panelinden yonetildigi icin sayfa her istekte
// guncel veriyi okur.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, teachersDay, worldGallery, hero] = await Promise.all([
    getProducts(),
    getTeachersDay(),
    getWorldGallery(),
    getHeroSettings(),
  ]);

  return (
    <main>
      <SubscriptionLock />
      <Navbar />
      <BloomHero products={products} settings={hero} />
      {teachersDayActive(teachersDay) && <TeachersDay settings={teachersDay} />}
      <CircularGallerySection products={products} settings={worldGallery} />
      {/* Yorumlar ile Neden Ciceksel yer degistirdi */}
      <Yorumlar />
      {/* 3D koleksiyon artik Atolye (/vitrin) sayfasinda */}
      <About />
      <Features />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
