// Client-safe. Sunucu tarafi okuma/yazma getWorldGallery/setWorldGallery
// lib/store.ts icinde.

export interface WorldGallerySettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  /** Secili urun id'leri (sirasiyla). Bossa otomatik secim yapilir. */
  productIds: string[];
}

export const DEFAULT_WORLD_GALLERY: WorldGallerySettings = {
  enabled: true,
  title: "Çiçeksel Dünyası",
  subtitle: "Kaydırarak çevirin • Üzerine gelip sepete ekleyin",
  productIds: [],
};

/** Cembere sigacak en fazla urun sayisi */
export const WORLD_GALLERY_MAX = 16;
