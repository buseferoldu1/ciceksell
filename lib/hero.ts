// Client-safe. Sunucu tarafi okuma/yazma getHeroSettings/setHeroSettings
// lib/store.ts icinde.

export interface HeroSlide {
  headlineTop: string;
  headlineBottom: string;
  /** Slaytta one cikan urun (fiyat + Sepete Ekle bu urune baglanir) */
  productId: string;
  /** Opsiyonel ozel vitrin gorseli; bossa urun fotografi kullanilir */
  heroImage: string;
}

export interface HeroSettings {
  /** Basliktaki kampanya rozeti. Bos birakilirsa rozet gizlenir. */
  badge: string;
  slides: HeroSlide[];
}

export const HERO_MAX_SLIDES = 6;

export const DEFAULT_HERO: HeroSettings = {
  badge: "ciceksel200 koduyla 200₺ indirim",
  slides: [
    { headlineTop: "Zarafetin", headlineBottom: "Işıltısı", productId: "k30", heroImage: "/flowers/beyaz-zarafet.jpg" },
    { headlineTop: "Zamansız", headlineBottom: "Aşk", productId: "k8", heroImage: "" },
    { headlineTop: "Sükûnet", headlineBottom: "Bahçesi", productId: "k21", heroImage: "/flowers/sukunet.jpg" },
  ],
};
