import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-context";
import CartDrawer from "@/components/cart/cart-drawer";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import CiceksekDock from "@/components/ui/ciceksel-dock";
import AiChatMount from "@/components/ui/ai-chat-mount";
import { SiteSettingsProvider } from "@/components/site-settings-context";
import { getContactSettings } from "@/lib/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Çiçeksel | Premium Çiçek Tasarımları",
  description:
    "Sevdiklerinize doğanın zarafetini hediye edin. Aynı gün teslimat seçeneğiyle, en taze aranjmanlar kapınızda.",
};

// Iletisim/banka ayarlari admin panelinden yonetilebildigi icin her
// istekte guncel veri okunur.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await getContactSettings();
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <SiteSettingsProvider value={contact}>
          <CartProvider>
            {children}
            <CartDrawer />
            <CiceksekDock />
            <AiChatMount />
            <WhatsAppButton />
          </CartProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
