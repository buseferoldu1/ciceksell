/**
 * Atolye (/vitrin) sayfasinin acilisindaki cicek hikaye kartlari
 * (Gul/Orkide/Ortanca — kokeni, ailesi, hikayesi). Admin panelinden
 * duzenlenebilir; 3D model dosyasi (GLB) sabit kalir, yalnizca metin ve
 * gorseller degistirilebilir.
 */

export interface FlowerStory {
  id: number;
  category: string;
  name: string;
  description: string;
  origin: string;
  family: string;
  story: string;
  /** Gorseller: Wikimedia Commons (bkz. public/flowers/ATTRIBUTION.md) */
  image: string;
  thumbnail: string;
  /** Imlecle 360 derece dondurulebilen 3D model (public/models/*.glb) — sabit */
  model: string;
}

export const DEFAULT_FLOWER_STORIES: FlowerStory[] = [
  {
    id: 1,
    category: "Atölye Serisi",
    name: "Gül",
    description:
      "Kadife dokulu yaprakları ve zamansız zarafetiyle, tutkunun en klasik ifadesi.",
    origin: "Anadolu",
    family: "Rosaceae",
    story:
      "Güllerimiz gün doğumundan önce toplanır ve en yoğun kokusunu koruması için soğuk zincirde atölyemize taşınır.",
    image: "/flowers/gul.jpg",
    thumbnail: "/flowers/gul-thumb.jpg",
    model: "/models/gul-3d.glb",
  },
  {
    id: 2,
    category: "Atölye Serisi",
    name: "Orkide",
    description:
      "Zarif kavisleri ve haftalarca süren ömrüyle, sadeliğin en gösterişli yorumu.",
    origin: "Güneydoğu Asya",
    family: "Orchidaceae",
    story:
      "Orkidelerimiz el işçiliğiyle hazırlanan özel serada haftalar süren bir olgunlaşma sürecinden geçer.",
    image: "/flowers/orkide.jpg",
    thumbnail: "/flowers/orkide-thumb.jpg",
    model: "/models/orkide-3d.glb",
  },
  {
    id: 3,
    category: "Atölye Serisi",
    name: "Ortanca",
    description:
      "Bulut gibi kabaran taç yapraklarıyla, bereketin ve içten duyguların çiçeği.",
    origin: "Doğu Asya",
    family: "Hydrangeaceae",
    story:
      "Ortancalarımız toprağın asidine göre renk değiştirir; her demet doğanın o güne özel imzasını taşır.",
    image: "/flowers/ortanca.jpg",
    thumbnail: "/flowers/ortanca-thumb.jpg",
    model: "/models/ortanca-3d.glb",
  },
];

// getFlowerStories/setFlowerStories bilerek burada DEGIL: bu dosya client
// bilesenlerinden (interactive-showcase) de import edildigi icin Node-only
// "./store" modulunu buraya almiyoruz. Sunucu taraf fonksiyonlari
// lib/store.ts icinde.
