import { Flower2, Mail, Phone, MapPin } from "lucide-react";

const QUICK_LINKS = [
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#yorumlar", label: "Yorumlar" },
  { href: "#fiyatlandirma", label: "Fiyatlandırma" },
  { href: "#sss", label: "SSS" },
];

const SOCIALS = [
  { abbr: "IG", href: "#", label: "Instagram" },
  { abbr: "FB", href: "#", label: "Facebook" },
  { abbr: "X", href: "#", label: "X (Twitter)" },
];

export default function Footer() {
  return (
    <footer className="bg-emerald-900 px-4 py-16 text-emerald-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-white" />
              <span className="font-serif text-xl font-bold text-white">
                Çiçek Bankası
              </span>
            </div>
            <p className="text-sm text-emerald-200">
              Sevdiklerinize doğanın zarafetini hediye edin.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Hızlı Linkler</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-emerald-200 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">İletişim</h3>
            <ul className="space-y-3 text-sm text-emerald-200">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>merhaba@cicekbankasi.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Levent, İstanbul</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Bizi Takip Edin</h3>
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {social.abbr}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-emerald-300">
          © {new Date().getFullYear()} Çiçek Bankası. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
