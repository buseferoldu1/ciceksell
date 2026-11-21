// Client-safe (fs/store'a bagimli degil). Sunucu tarafi okuma/yazma
// getTeachersDay/setTeachersDay lib/store.ts icinde.

/** "auto": 1-25 Kasim arasi gorunur; "on": hep goster; "off": hep gizle */
export type TeachersDayVisibility = "auto" | "on" | "off";

export interface TeachersDaySettings {
  visibility: TeachersDayVisibility;
  eyebrow: string;
  title: string;
  /** Paragraflar bos satirla ayrilir */
  message: string;
  quote: string;
  quoteAuthor: string;
  /** Opsiyonel Ataturk portresi (admin panelinden yuklenir) */
  photo: string;
  ctaLabel: string;
  ctaHref: string;
  /** Opsiyonel kampanya satiri (orn. kupon bilgisi) */
  promo: string;
}

export const DEFAULT_TEACHERS_DAY: TeachersDaySettings = {
  visibility: "auto",
  eyebrow: "24 Kasım · Öğretmenler Günü",
  title: "Başta Atatürk olmak üzere tüm öğretmenlerimize",
  message:
    "Bir ülkenin geleceği, sınıflarda yetişen çocuklarla yazılır. O geleceğin ilk satırını sabırla, emekle ve sevgiyle bize öğreten öğretmenlerimizi bugün minnetle anıyoruz.\n\nBaşöğretmenimiz Gazi Mustafa Kemal Atatürk'ten bu yana ışığı nesilden nesile taşıyan, bir çocuğun gözündeki merakı büyük bir hayale dönüştüren tüm öğretmenlerimizin 24 Kasım Öğretmenler Günü kutlu olsun.\n\nBir ömürlük emeğin yanında bir çiçek küçük kalır; ama içinden gelen bir teşekkürü en güzel o taşır.",
  quote: "Yeni nesil sizin eseriniz olacaktır.",
  quoteAuthor: "Mustafa Kemal Atatürk",
  photo: "",
  ctaLabel: "Öğretmenime Çiçek Gönder",
  ctaHref: "/katalog",
  promo: "",
};

/** Kasim ayinin ilk 25 gunu (auto modunda gosterim penceresi) */
export function teachersDayActive(s: TeachersDaySettings, now = new Date()): boolean {
  if (s.visibility === "on") return true;
  if (s.visibility === "off") return false;
  return now.getMonth() === 10 && now.getDate() <= 25;
}
