export type CategoryKey = "guller" | "orkideler" | "ortancalar";

export interface Product {
  id: string;
  name: string;
  tag: string;
  price: number;
  image: string;
  category: CategoryKey;
}

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "guller", label: "Güller" },
  { key: "orkideler", label: "Orkideler" },
  { key: "ortancalar", label: "Ortancalar" },
];

// Gorseller: Wikimedia Commons (bkz. public/flowers/ATTRIBUTION.md)
export const CATALOG: Record<CategoryKey, Product[]> = {
  guller: [
    { id: "g1", name: "Kadife Gece", tag: "Bordo Gül Buketi", price: 549, image: "/flowers/gul-1.jpg", category: "guller" },
    { id: "g2", name: "Beyaz Masal", tag: "Beyaz Gül Aranjmanı", price: 449, image: "/flowers/gul-2.jpg", category: "guller" },
    { id: "g3", name: "Pembe Sabah", tag: "Pembe Gül Buketi", price: 479, image: "/flowers/gul-3.jpg", category: "guller" },
    { id: "g4", name: "Kızıl Tutku", tag: "Kırmızı Gül Kutusu", price: 599, image: "/flowers/gul-4.jpg", category: "guller" },
    { id: "g5", name: "Şampanya Rüyası", tag: "Krem Gül Aranjmanı", price: 649, image: "/flowers/gul-5.jpg", category: "guller" },
    { id: "g6", name: "Bahçe Romansı", tag: "Karışık Gül Sepeti", price: 529, image: "/flowers/gul-6.jpg", category: "guller" },
  ],
  orkideler: [
    { id: "o1", name: "Kristal Beyaz", tag: "Tek Dal Beyaz Orkide", price: 749, image: "/flowers/orkide-1.jpg", category: "orkideler" },
    { id: "o2", name: "Mor Düş", tag: "Mor Toprak Orkidesi", price: 799, image: "/flowers/orkide-2.jpg", category: "orkideler" },
    { id: "o3", name: "Fildişi Zarafet", tag: "Beyaz Orkide Dalı", price: 829, image: "/flowers/orkide-3.jpg", category: "orkideler" },
    { id: "o4", name: "Gün Doğumu", tag: "Altın Sarısı Orkide", price: 779, image: "/flowers/orkide-4.jpg", category: "orkideler" },
    { id: "o5", name: "Zümrüt Vadi", tag: "Phalaenopsis Orkide", price: 859, image: "/flowers/orkide-5.jpg", category: "orkideler" },
    { id: "o6", name: "İpek Dokunuş", tag: "Egzotik Orkide Serisi", price: 899, image: "/flowers/orkide-6.jpg", category: "orkideler" },
  ],
  ortancalar: [
    { id: "h1", name: "Mavi Bulut", tag: "Çiy Damlalı Mavi Ortanca", price: 389, image: "/flowers/ortanca-1.jpg", category: "ortancalar" },
    { id: "h2", name: "Lila Bahçe", tag: "Lila Ortanca Aranjmanı", price: 419, image: "/flowers/ortanca-2.jpg", category: "ortancalar" },
    { id: "h3", name: "Pudra Küre", tag: "Pembe Ortanca Buketi", price: 399, image: "/flowers/ortanca-3.jpg", category: "ortancalar" },
    { id: "h4", name: "Okyanus Esintisi", tag: "Fuşya Ortanca Demeti", price: 449, image: "/flowers/ortanca-4.jpg", category: "ortancalar" },
    { id: "h5", name: "Beyaz Köpük", tag: "Beyaz Panikula Ortanca", price: 429, image: "/flowers/ortanca-5.jpg", category: "ortancalar" },
    { id: "h6", name: "Gökkuşağı Demeti", tag: "Karışık Ortanca", price: 469, image: "/flowers/ortanca-6.jpg", category: "ortancalar" },
  ],
};

export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_FEE = 49;

export const formatPrice = (n: number) => `₺${n.toLocaleString("tr-TR")}`;
