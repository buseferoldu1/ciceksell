"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2, Menu, Phone, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { SITE } from "@/lib/site";

const NAV_LINKS = [
  { href: "/katalog", label: "Katalog" },
  { href: "/vitrin", label: "Atölye (3D)" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#iletisim", label: "İletişim" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { count, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-[#f4f2ef]/85 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#33323a]/15">
            <Flower2 className="h-5 w-5 text-[#d9594c]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-2xl font-bold tracking-wide text-[#33323a]">
              {SITE.name}
            </span>
            <span className="text-[10px] italic text-[#33323a]/45">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#33323a]/70 transition-colors hover:text-[#d9594c]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href={SITE.phoneHref}
            className="hidden items-center gap-1.5 text-xs text-[#33323a]/60 transition-colors hover:text-[#d9594c] lg:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            {SITE.phone}
          </a>
          <Link
            href="/katalog"
            aria-label="Çiçek ara"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[#33323a] transition-colors hover:scale-110 hover:text-[#d9594c] sm:flex"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            href="/giris"
            aria-label="Giriş yap"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[#33323a] transition-colors hover:scale-110 hover:text-[#d9594c] sm:flex"
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label="Sepeti aç"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:text-[#d9594c]"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d9594c] px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#33323a] md:hidden"
            aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-[#f4f2ef]/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-medium text-[#33323a]/80 hover:text-[#d9594c]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
