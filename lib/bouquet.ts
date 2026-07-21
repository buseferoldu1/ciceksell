/**
 * "Kendi Buketini Oluştur" verisi.
 *
 * Fiyatlar dal basi / birim bazindadir ve katalogdaki hazir buketlerle
 * tutarli olacak sekilde belirlendi (orn. 11 kirmizi gul buketi katalogda
 * 1250 TL -> dal basi ~95 TL + ambalaj).
 * Gercek maliyetlere gore admin tarafindan guncellenmesi gerekebilir.
 */

export type FlowerCategory = "saksi" | "orkide" | "gul" | "kesme" | "celenk";

export const FLOWER_CATEGORIES: { key: FlowerCategory; label: string }[] = [
  { key: "saksi", label: "Saksı Çiçekleri" },
  { key: "orkide", label: "Orkide" },
  { key: "gul", label: "Gül" },
  { key: "kesme", label: "Kesme Çiçek" },
  { key: "celenk", label: "Çelenk" },
];

export interface FlowerOption {
  id: string;
  name: string;
  /** Dal basi fiyat (TL) */
  price: number;
  image: string;
  /** Kart uzerinde gosterilecek kisa not */
  note: string;
  /** Onizlemede kullanilan temsili renk */
  color: string;
  /** 3D onizlemedeki GLB modeli (public/ altinda) */
  model: string;
  /** Secim ekraninda gruplama icin kategori */
  category: FlowerCategory;
}

/** Kraft ambalaj icin secilebilir kagit renkleri */
export const WRAP_COLORS: { id: string; name: string; hex: string }[] = [
  { id: "kahverengi", name: "Kahverengi (gazete kâğıdı)", hex: "#c9b8a3" },
  { id: "beyaz", name: "Beyaz", hex: "#f5f3ee" },
  { id: "mavi", name: "Mavi", hex: "#3b6ea8" },
  { id: "kirmizi", name: "Kırmızı", hex: "#b83b3b" },
  { id: "mor", name: "Mor", hex: "#6b4c8a" },
  { id: "pembe", name: "Pembe", hex: "#d98aa8" },
  { id: "siyah", name: "Siyah", hex: "#2a2a2a" },
  { id: "sari", name: "Sarı", hex: "#e0b23c" },
  { id: "turuncu", name: "Turuncu", hex: "#d97b3c" },
];

export interface WrapOption {
  id: string;
  name: string;
  price: number;
  note: string;
  /** Sadece "kraft" gibi kagit-sarma tiplerinde kullanicinin renk secmesine izin verilir */
  colorable?: boolean;
}

/**
 * Varsayilan cicek listesi. Admin panelinden duzenlenen guncel liste
 * `getBouquetFlowers()` ile (store.ts uzerinden) okunur; bu dizi yalnizca
 * hic ozellestirme yapilmamissa kullanilan baslangic degeridir.
 */
export const DEFAULT_FLOWER_OPTIONS: FlowerOption[] = [
  {
    id: "kirmizi-gul",
    name: "Kırmızı Gül",
    price: 95,
    image: "/flowers/katalog/11-li-kirmizi-gul.jpg",
    note: "Tutku ve aşkın klasiği",
    color: "#c0223a",
    model: "/models/buket/gul-kirmizi.glb",
    category: "gul",
  },
  {
    id: "pembe-gul",
    name: "Pembe Gül",
    price: 90,
    image: "/flowers/katalog/11li-pembe-acik-gul.jpg",
    note: "Zarafet ve incelik",
    color: "#e88aa6",
    model: "/models/buket/gul-pembe.glb",
    category: "gul",
  },
  {
    id: "beyaz-gul",
    name: "Beyaz Gül",
    price: 95,
    image: "/flowers/katalog/gul-2.jpg",
    note: "Saflık ve yeni başlangıçlar",
    color: "#f4f1ea",
    model: "/models/buket/gul-beyaz.glb",
    category: "gul",
  },
  {
    id: "lale",
    name: "Lale",
    price: 70,
    image: "/flowers/katalog/21-lale-mix-premium.jpg",
    note: "Bahar neşesi",
    color: "#e4572e",
    model: "/models/buket/lale.glb",
    category: "kesme",
  },
  {
    id: "sakayik",
    name: "Şakayık",
    price: 160,
    image: "/flowers/katalog/sakayik-mix.jpg",
    note: "Bolluk ve romantizm",
    color: "#f2a1b7",
    model: "/models/buket/sakayik.glb",
    category: "kesme",
  },
  {
    id: "ortanca",
    name: "Ortanca",
    price: 130,
    image: "/flowers/katalog/ortanca-mix.jpg",
    note: "Bulut gibi dolgun",
    color: "#8fa8d8",
    model: "/models/buket/ortanca.glb",
    category: "kesme",
  },
  {
    id: "kazablanka",
    name: "Kazablanka",
    price: 120,
    image: "/flowers/katalog/kazablanka-mix.jpg",
    note: "Yoğun kokulu lilyum",
    color: "#f7f3e8",
    // NOT: kazablanka.glb kaynak modeli gercekte bir lilyum degil, yesil
    // yaprakli kucuk bir bitkiye benziyor (dogru olmayan 3D varlik).
    // Duzeltilene kadar zarif beyaz lale modeli gorsel olarak kullaniliyor.
    model: "/models/buket/lale-beyaz.glb",
    category: "kesme",
  },
  {
    id: "orkide",
    name: "Orkide Dalı",
    price: 210,
    image: "/flowers/orkide-1.jpg",
    note: "Uzun ömürlü ve gösterişli",
    color: "#d8b4e2",
    model: "/models/buket/orkide.glb",
    category: "orkide",
  },
];

export const WRAP_OPTIONS: WrapOption[] = [
  { id: "kraft", name: "Kraft Ambalaj", price: 0, note: "Sade ve doğal", colorable: true },
  { id: "luks", name: "Lüks Ambalaj + Kurdele", price: 150, note: "Özel günler için" },
  { id: "vazo", name: "Cam Vazo", price: 450, note: "Hazır sunum, uzun ömür" },
];

/** Minimum dal sayisi — altinda buket derli toplu gorunmuyor */
export const MIN_STEMS = 5;

export interface BouquetSelection {
  /** flowerId -> adet */
  stems: Record<string, number>;
  wrapId: string;
}

export function bouquetTotals(
  sel: BouquetSelection,
  flowers: FlowerOption[] = DEFAULT_FLOWER_OPTIONS
) {
  const stemCount = Object.values(sel.stems).reduce((s, n) => s + n, 0);
  const flowersPrice = Object.entries(sel.stems).reduce((sum, [id, n]) => {
    const f = flowers.find((x) => x.id === id);
    return sum + (f ? f.price * n : 0);
  }, 0);
  const wrap = WRAP_OPTIONS.find((w) => w.id === sel.wrapId) ?? WRAP_OPTIONS[0];
  return {
    stemCount,
    flowersPrice,
    wrapPrice: wrap.price,
    total: flowersPrice + wrap.price,
    wrap,
    yeterli: stemCount >= MIN_STEMS,
  };
}

/** Sepette ve siparis ozetinde gorunecek aciklama */
export function bouquetDescription(
  sel: BouquetSelection,
  flowers: FlowerOption[] = DEFAULT_FLOWER_OPTIONS
): string {
  const parcalar = Object.entries(sel.stems)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => {
      const f = flowers.find((x) => x.id === id);
      return f ? `${n} ${f.name}` : null;
    })
    .filter(Boolean);
  const wrap = WRAP_OPTIONS.find((w) => w.id === sel.wrapId) ?? WRAP_OPTIONS[0];
  return `${parcalar.join(", ")} — ${wrap.name}`;
}

// getBouquetFlowers/setBouquetFlowers bilerek burada DEGIL: bu dosya
// client bilesenlerinden (bouquet-builder, bouquet-scene) de import
// edildigi icin Node-only "./store" modulunu buraya almiyoruz (aksi
// halde `fs` tarayici derlemesine sizar). Sunucu taraf okuma/yazma
// fonksiyonlari lib/store.ts icinde.
