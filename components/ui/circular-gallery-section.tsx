"use client";

import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import { WORLD_GALLERY_MAX, type WorldGallerySettings } from "@/lib/world-gallery";
import CircularGallery from "./circular-gallery";

/**
 * Galeriyi sepete baglayan ince sarmalayici. Ana sayfa (server component)
 * sepet context'ine erisemedigi icin bu ara katman gerekiyor.
 * Hangi urunlerin gorunecegi admin panelinden ("Çiçeksel Dünyası" sekmesi)
 * secilir; secim bossa premium (3D modelli) urunler one alinarak otomatik
 * secim yapilir.
 */
export default function CircularGallerySection({
  products,
  settings,
}: {
  products: Product[];
  settings: WorldGallerySettings;
}) {
  const { addItem } = useCart();
  if (!settings.enabled) return null;

  let featured: Product[];
  if (settings.productIds.length > 0) {
    const byId = new Map(products.map((p) => [p.id, p]));
    featured = settings.productIds
      .map((id) => byId.get(id))
      .filter((p): p is Product => !!p)
      .slice(0, WORLD_GALLERY_MAX);
  } else {
    const premium = products.filter((p) => p.model);
    const digerleri = products.filter((p) => !p.model);
    featured = [...premium, ...digerleri].slice(0, 12);
  }
  if (featured.length === 0) return null;

  return (
    <CircularGallery
      items={featured}
      onAdd={addItem}
      title={settings.title}
      subtitle={settings.subtitle}
    />
  );
}
