// Bu dosya CLIENT bilesenlerinden de import edilir (navbar, footer, contact,
// whatsapp-button vb.); bu yuzden Node-only modul kullanan "./store"u
// BURADA import ETMEYIN — aksi halde `fs` tarayici derlemesine sizar ve
// build kirilir. Sunucu tarafi okuma/yazma fonksiyonlari (getContactSettings/
// setContactSettings) bilerek lib/store.ts icinde tutuluyor.

// Marka kimligi (ad, slogan, odeme rozetleri) — bunlar nadiren degisir ve
// admin panelinden duzenlenmez. Iletisim/banka bilgileri asagidaki
// ContactSettings uzerinden admin panelinden duzenlenebilir.
export const SITE_BRAND = {
  name: "Çiçeksel",
  tagline: "since 1984",
  description:
    "1984'ten bu yana Ankara Kızılay'da. Sevdiklerinize en güzel çiçekleri gönderin — aynı gün teslimat, taze çiçek garantisi ve 40 yıllık güvenle.",
  country: "Türkiye",
  payment: ["iyzico", "VISA", "Mastercard", "TROY", "3D Secure"],
  legal: [
    { label: "Gizlilik Politikası", href: "#" },
    { label: "Kullanım Şartları", href: "#" },
    { label: "Çerez Politikası", href: "#" },
  ],
} as const;

/**
 * Admin panelinden duzenlenebilir iletisim + banka bilgileri.
 * `getContactSettings()` ile DB'den (yoksa DEFAULT_CONTACT'tan) okunur.
 */
export interface ContactSettings {
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  addressShort: string;
  instagram: string;
  instagramHandle: string;
  responseTime: string;
  /** Havale/EFT hesap sahibi. Bos ise havale secenegi gizlenir. */
  bankHolder: string;
  /** Havale/EFT IBAN. Bos ise havale secenegi gizlenir. */
  bankIban: string;
  bankName: string;
}

export const DEFAULT_CONTACT: ContactSettings = {
  phone: "+90 535 733 9333",
  email: "ciceksel1984@gmail.com",
  addressLine1: "Atatürk Bulvarı MEB Yanı Çiçekçiler Çarşısı No: 21-22-23-24",
  addressLine2: "Ankara, Çankaya 06420",
  addressShort: "Ankara, Çankaya",
  instagram: "https://instagram.com/cicekselcom",
  instagramHandle: "@cicekselcom",
  responseTime: "Genellikle 24 saat içinde yanıt veririz",
  bankHolder: "Etem Perçin",
  bankIban: "TR41 0001 0011 3327 9183 4050 18",
  bankName: "Ziraat Bankası",
};

/** phone/email'den turetilen href'ler — bilesenlerde tekrar hesaplanmaz */
export function contactHrefs(c: ContactSettings) {
  return {
    phoneHref: `tel:${c.phone.replace(/[^\d+]/g, "")}`,
    emailHref: `mailto:${c.email}`,
  };
}

export function bankActive(c: ContactSettings): boolean {
  return c.bankIban.trim().length > 0;
}

export const ABOUT_INTRO =
  "1984'ten bu yana Ankara'nın kalbinde, her duyguya en güzel çiçekle eşlik ediyoruz.";

export const ABOUT_SECTIONS = [
  {
    title: "Hikayemiz",
    body: "Etem Çiçekçilik adı altında 1984 yılında Ankara Kızılay'ın tam kalbinde, Atatürk Bulvarı üzerindeki Çiçekçiler Çarşısı'nda küçük bir dükkânla hayata geçtik. 40 yılı aşkın süredir çiçekçilik yapıyor, her duyguya en güzel çiçekle eşlik ediyoruz. Kurucumuzun çiçeklere olan tutkusu ve insanların duygularını en güzel şekilde ifade etme isteği, bu yolculuğun başlangıç noktasıydı.\n\nYıllar içinde binlerce evlilik teklifine, doğum günü sürprizine, mezuniyet kutlamasına ve anma törenine eşlik ettik. Her buket, her aranjman; bir duygunun, bir anın, bir bağın somut ifadesi oldu. Bugün üç kuşaktır sürdürdüğümüz bu geleneği, Çiçeksel markamız ve modern e-ticaret altyapımızla tüm Türkiye'ye taşıyoruz.",
  },
  {
    title: "Misyonumuz",
    body: "Her duyguyu en taze, en özenli çiçeklerle taçlandırmak. Sevgi, saygı, özlem, kutlama — hangi his olursa olsun, Çiçeksel olarak o anı unutulmaz kılmak için buradayız. Aynı gün teslimat garantimiz ve 40 yıllık deneyimimizle her siparişi bir sanat eserine dönüştürüyoruz.",
  },
  {
    title: "Değerlerimiz",
    body: "Tazelik, özen ve güven — 1984'ten bu yana değişmeyen üç temel ilkemiz. Her çiçeği sanki kendi sevdiklerimize gönderiyormuşuz gibi hazırlıyor, her müşterimize aile sıcaklığıyla yaklaşıyoruz.",
  },
  {
    title: "Ekibimiz",
    body: "Çiçeksel ailesi; deneyimli floristler, yaratıcı aranjman ustaları ve güler yüzlü teslimat ekibinden oluşuyor. Her biri işini sevgiyle yapan bu ekip, 40 yıldır Ankara'nın çiçek hafızasını oluşturuyor.",
  },
  {
    title: "Taze Çiçek Garantisi",
    body: "Tüm çiçeklerimiz her sabah taze olarak temin edilir. Soluk veya hasarlı çiçek asla müşterimize ulaşmaz — bu, 1984'ten bu yana verdiğimiz sözdür. Memnun kalmadığınız her siparişi ücretsiz yeniliyoruz.",
  },
] as const;

export const ABOUT_STATS = [
  { value: "50.000+", label: "Mutlu Müşteri" },
  { value: "200.000+", label: "Teslim Edilen Buket" },
  { value: "40+", label: "Yıllık Deneyim" },
  { value: "%98", label: "Müşteri Memnuniyeti" },
] as const;
