"use client";

import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-context";
import CircularGallery from "./circular-gallery";

/**
 * Galeriyi sepete baglayan ince sarmalayici. Ana sayfa (server component)
 * sepet context'ine erisemedigi icin bu ara katman gerekiyor.
 */
export default function CircularGallerySection({
  products,
}: {
  products: Product[];
}) {
  const { addItem } = useCart();
  // Premium (3D modelli) urunler one alinir, cembere sigacak kadar urun
  // goster (fazlasi ust uste biner)
  const premium = products.filter((p) => p.model);
  const digerleri = products.filter((p) => !p.model);
  const featured = [...premium, ...digerleri].slice(0, 12);
  if (featured.length === 0) return null;

  return <CircularGallery items={featured} onAdd={addItem} />;
}
