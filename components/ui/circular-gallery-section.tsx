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
  // En premium (fiyati en yuksek) urunler one cikarilir; 3D modelli
  // urunler esit fiyatta oncelikli sayilir. Cembere sigacak kadar urun
  // gosterilir (fazlasi ust uste biner)
  const featured = [...products]
    .sort((a, b) => {
      if (b.price !== a.price) return b.price - a.price;
      return (b.model ? 1 : 0) - (a.model ? 1 : 0);
    })
    .slice(0, 12);
  if (featured.length === 0) return null;

  return <CircularGallery items={featured} onAdd={addItem} />;
}
