export type CategoryKey = "katalog";

export interface Product {
  id: string;
  name: string;
  tag: string;
  price: number;
  image: string;
  category: CategoryKey;
  /** Varsa, imleçle 360° döndürülebilen .glb modeli (public/models/...) */
  model?: string;
}

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "katalog", label: "Tümü" },
];

// Urun verisi ve gorseller ciceksel.com katalogundan aktarildi
// (bkz. public/flowers/ATTRIBUTION.md)
export const CATALOG: Record<CategoryKey, Product[]> = {
  katalog: [
    { id: "k1", name: "41 Beyaz Gül Karışık Mix", tag: "41 adet beyaz gül ve renkli çiçeklerden oluşan lüks karışık buket", price: 3900, image: "/flowers/katalog/41-beyaz-gul-karisik-mix.jpg", category: "katalog" },
    { id: "k2", name: "Karışık Buket Lüks", tag: "Gül, lilyum ve mevsim çiçeklerinden oluşan lüks karışık buket", price: 2100, image: "/flowers/katalog/karisik-buket-luks.jpg", category: "katalog" },
    { id: "k3", name: "41li Yatay Kırmızı Gül", tag: "41 adet kırmızı gülden oluşan yatay dizayn buket", price: 3800, image: "/flowers/katalog/41li-yatay-kirmizi-gul.jpg", category: "katalog" },
    { id: "k4", name: "Vazolu Naturel", tag: "Cam vazoda doğal mevsim çiçeklerinden oluşan şık aranjman", price: 5250, image: "/flowers/katalog/vazolu-naturel.jpg", category: "katalog" },
    { id: "k5", name: "Vazolu Renkli Lüks", tag: "Cam vazoda renkli lüks çiçek aranjmanı, gül ve şakayık", price: 5250, image: "/flowers/katalog/vazolu-renkli-luks.jpg", category: "katalog" },
    { id: "k6", name: "41 Gül", tag: "41 adet premium gülden oluşan büyük lüks buket", price: 4100, image: "/flowers/katalog/41-gul.jpg", category: "katalog" },
    { id: "k7", name: "Vazolu Naturel Premium", tag: "Premium cam vazoda lüks doğal çiçek aranjmanı", price: 6700, image: "/flowers/katalog/vazolu-naturel-premium.jpg", category: "katalog" },
    { id: "k8", name: "Kutulu 101 Gül", tag: "Lüks hediye kutusunda 101 adet kırmızı gül, romantik hediye", price: 7500, image: "/flowers/katalog/kutulu-101-gul.jpg", category: "katalog" },
    { id: "k9", name: "21 Lale Mix Premium", tag: "21 adet renkli lale, premium karışık bahar buketi", price: 3650, image: "/flowers/katalog/21-lale-mix-premium.jpg", category: "katalog" },
    { id: "k10", name: "41 li Siyah Gül", tag: "41 adet dramatik siyah gül, etkileyici romantik buket", price: 4100, image: "/flowers/katalog/41-li-siyah-gul.jpg", category: "katalog" },
    { id: "k11", name: "Şakayık Mix", tag: "Pembe, beyaz ve mercan renkli şakayıklardan oluşan lüks buket", price: 4150, image: "/flowers/katalog/sakayik-mix.jpg", category: "katalog" },
    { id: "k12", name: "3lü Mix Orkide Premium", tag: "3 adet premium orkide bitkisi, dekoratif saksılarda", price: 6700, image: "/flowers/katalog/3lu-mix-orkide-premium.jpg", category: "katalog" },
    { id: "k13", name: "7 Adet Kırmızı Gül", tag: "Lacivert ambalaj içinde sunulan 7 adet kırmızı gülden oluşan şık buket", price: 1250, image: "/flowers/katalog/7-adet-kirmizi-gul.jpg", category: "katalog" },
    { id: "k14", name: "Lilyumlu Karışık Mix", tag: "Beyaz lilyum ve renkli çiçeklerden oluşan zarif karışık buket", price: 1750, image: "/flowers/katalog/lilyumlu-karisik-mix.jpg", category: "katalog" },
    { id: "k15", name: "Kazablanka Buket Mix", tag: "Kazablanka lilyum ve güllerden oluşan zarif karışık buket", price: 2800, image: "/flowers/katalog/kazablanka-buket-mix.jpg", category: "katalog" },
    { id: "k16", name: "Naturel Gül Karışık Renkli", tag: "Doğal bahçe güllerinden oluşan renkli karışık buket", price: 3750, image: "/flowers/katalog/naturel-gul-karisik-renkli.jpg", category: "katalog" },
    { id: "k17", name: "11li Pembe Açık Gül", tag: "11 adet açık pembe gülden oluşan romantik buket", price: 1450, image: "/flowers/katalog/11li-pembe-acik-gul.jpg", category: "katalog" },
    { id: "k18", name: "Düğün Çelengi İkili", tag: "Beyaz çiçekler ve yeşilliklerden oluşan iki adet düğün çelengi", price: 2850, image: "/flowers/katalog/dugun-celengi-ikili.jpg", category: "katalog" },
    { id: "k19", name: "Mavili Mix", tag: "Mavi çiçekler ve beyaz güllerden oluşan zarif karışık buket", price: 1670, image: "/flowers/katalog/mavili-mix.jpg", category: "katalog" },
    { id: "k20", name: "Ortanca Mix", tag: "Pembe, mavi ve mor ortancalardan oluşan zarif buket", price: 1900, image: "/flowers/katalog/ortanca-mix.jpg", category: "katalog" },
    { id: "k21", name: "Kazablanka Mix Lüks", tag: "Premium kazablanka lilyum ve mevsim çiçeklerinden oluşan lüks buket", price: 2800, image: "/flowers/katalog/kazablanka-mix-luks.jpg", category: "katalog" },
    { id: "k22", name: "Ortanca Saksısı (6 Dal)", tag: "6 dallı pembe ve mor ortanca saksı bitkisi", price: 2150, image: "/flowers/katalog/ortanca-saksisi-6-dal.jpg", category: "katalog" },
    { id: "k23", name: "Karışık Lüks Buket", tag: "Gül, şakayık ve mevsim çiçeklerinden oluşan lüks karışık buket", price: 2750, image: "/flowers/katalog/karisik-luks-buket.jpg", category: "katalog" },
    { id: "k24", name: "Mor 2li Yapay Aranjman", tag: "İki adet mor yapay çiçek aranjmanı, ev dekorasyonu için ideal", price: 2750, image: "/flowers/katalog/mor-2li-yapay-aranjman.jpg", category: "katalog" },
    { id: "k25", name: "Beyaz 2li Saksılı", tag: "İki adet beyaz yapay çiçek aranjmanı, zarif ev dekorasyonu", price: 2000, image: "/flowers/katalog/beyaz-2li-saksili.jpg", category: "katalog" },
    { id: "k26", name: "Sarı 2li Yapay Aranjman", tag: "İki adet sarı yapay çiçek aranjmanı, neşeli ev dekorasyonu", price: 2750, image: "/flowers/katalog/sari-2li-yapay-aranjman.jpg", category: "katalog" },
    { id: "k27", name: "3lü Anastasia Vazolu", tag: "3 adet anastasia krizantem çiçeği, zarif cam vazoda", price: 950, image: "/flowers/katalog/3lu-anastasia-vazolu.jpg", category: "katalog" },
    { id: "k28", name: "2li Beyaz Saksılı", tag: "İki adet beyaz yapay çiçek aranjmanı, dekoratif saksılarda", price: 1900, image: "/flowers/katalog/2li-beyaz-saksili.jpg", category: "katalog" },
    { id: "k29", name: "2li Yuka Hasır Saksılı", tag: "İki adet yuka bitkisi, doğal hasır saksılarda", price: 3150, image: "/flowers/katalog/2li-yuka-hasir-saksili.jpg", category: "katalog" },
    { id: "k30", name: "21li Beyaz Lale Lüx", tag: "21 adet saf beyaz lale, lüks bahar buketi", price: 3500, image: "/flowers/katalog/21li-beyaz-lale-lux.jpg", category: "katalog" },
    { id: "k31", name: "Mavili Cam Teraryum", tag: "Mavi çiçekler ve sukulent bitkilerle dolu zarif cam teraryum", price: 1870, image: "/flowers/katalog/mavili-cam-teraryum.jpg", category: "katalog" },
    { id: "k32", name: "Karışık Renkli Buket", tag: "Gül ve mevsim çiçeklerinden oluşan canlı renkli karışık buket", price: 1950, image: "/flowers/katalog/karisik-renkli-buket.jpg", category: "katalog" },
    { id: "k33", name: "Kazablanka Mix", tag: "Kazablanka lilyum ve yeşilliklerden oluşan zarif sade buket", price: 1750, image: "/flowers/katalog/kazablanka-mix.jpg", category: "katalog" },
    { id: "k34", name: "11 li Kırmızı Gül", tag: "11 adet klasik kırmızı gül, romantik buket", price: 1250, image: "/flowers/katalog/11-li-kirmizi-gul.jpg", category: "katalog" },
    { id: "k35", name: "11 li Şakayık Vazo", tag: "11 adet pembe şakayık, zarif cam vazoda", price: 3750, image: "/flowers/katalog/11-li-sakayik-vazo.jpg", category: "katalog" },
    { id: "k36", name: "Yapay Açık Teraryum", tag: "Yapay çiçekler ve sukulent bitkilerle dolu dekoratif açık teraryum", price: 2350, image: "/flowers/katalog/yapay-acik-teraryum.jpg", category: "katalog" },
    { id: "k37", name: "2li Pembe Saksılı", tag: "İki adet pembe yapay çiçek aranjmanı, dekoratif saksılarda", price: 1900, image: "/flowers/katalog/2li-pembe-saksili.jpg", category: "katalog" },
    { id: "k38", name: "30lu Gül", tag: "30 adet pembe ve kırmızı gülden oluşan zarif buket", price: 2250, image: "/flowers/katalog/30lu-gul.jpg", category: "katalog" },
    { id: "k39", name: "Cenaze Çelengi", tag: "Beyaz çiçekler ve yeşilliklerden oluşan büyük cenaze çelengi", price: 4500, image: "/flowers/katalog/cenaze-celengi.jpg", category: "katalog" },
  ],
};

// Imlecle 360 derece dondurulebilen 3D urunler (public/models/*.glb)
export const MODELS_3D: Product[] = [
  {
    id: "m1",
    name: "Orkide Bahçesi",
    tag: "Seramik Saksıda Mini Mor Orkide",
    price: 1290,
    image: "/flowers/orkide-2.jpg",
    category: "katalog",
    model: "/models/orkide-bahce.glb",
  },
  {
    id: "m2",
    name: "Kraliyet Gülleri",
    tag: "Siyah Vazoda Rengârenk Güller",
    price: 1590,
    image: "/flowers/gul-1.jpg",
    category: "katalog",
    model: "/models/royal-guller.glb",
  },
];

export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_FEE = 49;

export const formatPrice = (n: number) => `₺${n.toLocaleString("tr-TR")}`;
