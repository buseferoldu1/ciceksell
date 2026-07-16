"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Flower2,
  HomeIcon,
  Mail,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "./dock";
import { useCart } from "@/components/cart/cart-context";
import { SITE } from "@/lib/site";

/**
 * Ciceksel navigasyon dock'u — sayfanin altinda sabit durur.
 * Demo koddaki genel butonlar (Home/Products/Theme...) yerine sitenin
 * gercek rotalari kullanildi.
 */
export default function CiceksekDock() {
  const pathname = usePathname();
  const { count, openCart } = useCart();

  const items = [
    { title: "Ana Sayfa", icon: HomeIcon, href: "/" },
    { title: "Katalog", icon: Flower2, href: "/katalog" },
    { title: "Atölye (3D)", icon: Boxes, href: "/vitrin" },
    { title: "Hakkımızda", icon: Mail, href: "/#hakkimizda" },
    { title: "İletişim", icon: Phone, href: "/#iletisim" },
  ];

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4">
      <div className="pointer-events-auto">
        <Dock>
          {items.map((item) => {
            const aktif =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("#")[0]) &&
                  item.href !== "/#hakkimizda" &&
                  item.href !== "/#iletisim";
            return (
              <DockItem
                key={item.title}
                className={`aspect-square rounded-full transition-colors ${
                  aktif ? "bg-[#d9594c]/15" : "bg-[#f4f2ef] hover:bg-[#d9594c]/10"
                }`}
              >
                <DockLabel>{item.title}</DockLabel>
                <DockIcon>
                  <Link
                    href={item.href}
                    aria-label={item.title}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <item.icon
                      className={`h-full w-full ${
                        aktif ? "text-[#d9594c]" : "text-[#33323a]/70"
                      }`}
                    />
                  </Link>
                </DockIcon>
              </DockItem>
            );
          })}

          {/* Sepet: rota degil, cekmeceyi acar */}
          <DockItem className="aspect-square rounded-full bg-[#d9594c]">
            <DockLabel>
              {count > 0 ? `Sepetim (${count})` : "Sepetim"}
            </DockLabel>
            <DockIcon>
              <button
                type="button"
                onClick={openCart}
                aria-label="Sepeti aç"
                className="flex h-full w-full items-center justify-center"
              >
                <ShoppingBag className="h-full w-full text-white" />
              </button>
            </DockIcon>
            {count > 0 && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#33323a] px-1 text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </DockItem>
        </Dock>
      </div>
    </div>
  );
}
