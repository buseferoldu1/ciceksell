import Link from "next/link";
import { Flower2, Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { InstagramIcon } from "./icons";

const QUICK_LINKS = [
  { href: "/katalog", label: "Katalog" },
  { href: "/vitrin", label: "Atölye (3D)" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#iletisim", label: "İletişim" },
];

export default function Footer() {
  return (
    <footer className="bg-[#33323a] px-4 py-16 text-white/70 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Marka */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-white" />
              <span className="font-serif text-xl font-bold text-white">
                {SITE.name}
              </span>
            </div>
            <span className="text-xs italic text-white/45">{SITE.tagline}</span>
            <p className="mt-3 text-sm text-white/65">{SITE.description}</p>
          </div>

          {/* Hizli linkler */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Iletisim */}
          <div>
            <h3 className="mb-4 font-semibold text-white">İletişim</h3>
            <ul className="space-y-3 text-sm text-white/65">
              <li>
                <a
                  href={SITE.phoneHref}
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{SITE.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.emailHref}
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{SITE.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{SITE.address.short}</span>
              </li>
              <li>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <InstagramIcon className="h-4 w-4 shrink-0" />
                  <span>{SITE.instagramHandle}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Guvenli odeme */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">
              Güvenli Ödeme
            </h3>
            <div className="flex flex-wrap gap-2">
              {SITE.payment.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.
          </span>
        </div>
      </div>
    </footer>
  );
}
