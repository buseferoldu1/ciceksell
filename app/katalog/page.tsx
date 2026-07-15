import type { Metadata } from "next";
import { getProducts } from "@/lib/store";
import CatalogGrid from "@/components/ui/catalog-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog | Çiçeksel",
};

export default async function KatalogPage() {
  const products = await getProducts();
  return <CatalogGrid products={products} />;
}
