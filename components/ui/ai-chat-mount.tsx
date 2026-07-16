import { getProducts } from "@/lib/store";
import AiChat from "./ai-chat";

/**
 * Asistan, urun/fiyat bilgisi verebilmek icin guncel katalogu ister.
 * Sunucuda okunup istemci bilesenine gecirilir.
 */
export default async function AiChatMount() {
  const products = await getProducts();
  return <AiChat products={products} />;
}
