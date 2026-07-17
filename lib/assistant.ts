import type { Product } from "./products";
import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "./products";
import { DEFAULT_CONTACT, type ContactSettings } from "./site";

/**
 * Kural tabanli asistan.
 *
 * NOT: Bu gercek bir dil modeli DEGILDIR. Harici bir yapay zeka servisine
 * baglanmadan, sitenin kendi verisi (katalog, fiyatlar, teslimat kurallari,
 * iletisim) uzerinde calisan bir niyet esleyicidir. Boylece API anahtari,
 * ek maliyet ve gizlilik derdi olmadan siteyle ilgili sorulara DOGRU
 * cevap verir; bilmedigi seyde uydurmaz, insana yonlendirir.
 *
 * Gercek bir LLM istenirse: cevap uretimi sunucu tarafinda bir saglayiciya
 * (orn. Claude API) tasinmali; bu dosyadaki katalog ozeti sistem promptu
 * olarak verilebilir.
 */

export interface AsistanCevabi {
  text: string;
  /** Kullaniciya onerilecek takip sorulari */
  oneriler?: string[];
  /** Varsa ilgili urunler */
  urunler?: Product[];
}

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");

const iceriyor = (m: string, ...k: string[]) => k.some((x) => m.includes(norm(x)));

/** Mesajdaki butce ipucunu yakala: "500 tl", "1000-2000", "bin lira" */
function butceBul(mesaj: string): number | null {
  const bin = /(\d+)\s*bin/.exec(mesaj);
  if (bin) return parseInt(bin[1]) * 1000;
  const sayilar = mesaj.match(/\d{3,6}/g);
  if (!sayilar) return null;
  return Math.max(...sayilar.map(Number));
}

export function cevapUret(
  soru: string,
  urunler: Product[],
  SITE: ContactSettings = DEFAULT_CONTACT
): AsistanCevabi {
  const m = norm(soru);
  const aktif = urunler.filter((u) => u.price > 0);
  const enUcuz = [...aktif].sort((a, b) => a.price - b.price)[0];
  const enPahali = [...aktif].sort((a, b) => b.price - a.price)[0];

  /* ---------------- Selamlama ---------------- */
  if (iceriyor(m, "merhaba", "selam", "iyi gunler", "gunaydin", "hey")) {
    return {
      text: `Merhaba! Ben Çiçeksel'in dijital asistanıyım. Size hangi konuda yardımcı olabilirim? Aranjman önerisi, teslimat, fiyat veya bakım hakkında sorabilirsiniz.`,
      oneriler: ["Sevgilime ne alsam?", "Aynı gün teslimat var mı?", "En uygun buket hangisi?"],
    };
  }

  /* ---------------- Teslimat ---------------- */
  if (iceriyor(m, "teslimat", "kargo", "ne zaman gelir", "kac saatte", "ayni gun", "gonderim")) {
    return {
      text: `Şehir içi (Ankara) siparişlerinizde saat 14:00'a kadar verilen siparişler aynı gün teslim edilir. ${formatPrice(FREE_SHIPPING_THRESHOLD)} ve üzeri alışverişlerde teslimat ücretsiz; altındaki siparişlerde ${formatPrice(SHIPPING_FEE)} teslimat ücreti eklenir. Türkiye genelinde de gönderim yapıyoruz.`,
      oneriler: ["Ücretsiz teslimat için ne kadar almalıyım?", "Bugün sipariş versem yarın gider mi?"],
    };
  }

  /* ---------------- Ucretsiz teslimat esigi ---------------- */
  if (iceriyor(m, "ucretsiz", "bedava") && iceriyor(m, "teslimat", "kargo")) {
    return {
      text: `${formatPrice(FREE_SHIPPING_THRESHOLD)} ve üzeri tüm siparişlerde teslimat ücretsiz. Katalogdaki çoğu aranjman zaten bu tutarın üzerinde, yani genelde teslimat ücreti ödemezsiniz.`,
    };
  }

  /* ---------------- Butce / fiyat ---------------- */
  const butce = butceBul(m);
  if (butce && iceriyor(m, "tl", "lira", "butce", "bin", "kadar", "altinda", "civari", "arasi")) {
    const uygun = aktif
      .filter((u) => u.price <= butce)
      .sort((a, b) => b.price - a.price)
      .slice(0, 3);
    if (uygun.length === 0) {
      return {
        text: `${formatPrice(butce)} bütçesine uyan bir aranjman bulamadım. En uygun seçeneğimiz ${enUcuz.name} — ${formatPrice(enUcuz.price)}. Dilerseniz bütçenizi biraz artırarak çok daha zengin bir buket alabilirsiniz.`,
        urunler: [enUcuz],
      };
    }
    return {
      text: `${formatPrice(butce)} bütçenize en yakışan ${uygun.length} seçenek şunlar. Bütçenizi tam kullanmak isterseniz ${uygun[0].name} (${formatPrice(uygun[0].price)}) en zengin görünen olur.`,
      urunler: uygun,
      oneriler: ["Bunlardan hangisi daha uzun ömürlü?", "Aynı gün teslim edilir mi?"],
    };
  }

  if (iceriyor(m, "en ucuz", "en uygun", "ucuz", "ekonomik")) {
    return {
      text: `En uygun seçeneğimiz ${enUcuz.name} — ${formatPrice(enUcuz.price)}. ${enUcuz.tag}. Küçük ama şık bir jest arıyorsanız ideal.`,
      urunler: [enUcuz],
    };
  }

  if (iceriyor(m, "en pahali", "en luks", "en iyi", "premium", "en gosterisli")) {
    return {
      text: `En gösterişli aranjmanımız ${enPahali.name} — ${formatPrice(enPahali.price)}. ${enPahali.tag}. Gerçekten etkilemek istediğiniz anlar için.`,
      urunler: [enPahali],
    };
  }

  /* ---------------- Duruma gore oneri (fikir yurutme) ---------------- */
  if (iceriyor(m, "sevgili", "romantik", "ask", "yildonumu", "yil donumu", "evlilik teklifi", "esime", "esim")) {
    const guller = aktif
      .filter((u) => norm(u.name + u.tag).includes("gul"))
      .sort((a, b) => b.price - a.price)
      .slice(0, 3);
    return {
      text: `Romantik anlar için gül şaşmaz bir tercih. Klasikten etkileyiciye doğru sıralarsam: kırmızı gül tutkuyu, pembe gül zarafeti anlatır. Evlilik teklifi gibi büyük bir an ise adet önemli — 101 gül gibi büyük buketler o anı unutulmaz kılıyor.`,
      urunler: guller,
      oneriler: ["101 gül ne kadar?", "Kart notu ekleyebilir miyim?"],
    };
  }

  if (iceriyor(m, "anne", "annem", "anneler gunu")) {
    const oneri = aktif
      .filter((u) => norm(u.name + u.tag).includes("ortanca") || norm(u.name + u.tag).includes("orkide") || norm(u.name + u.tag).includes("lilyum"))
      .slice(0, 3);
    return {
      text: `Anneler için genelde uzun ömürlü ve zarif olanı öneriyorum: orkide aylarca dayanır ve bakımı kolaydır; ortanca ise sıcak, samimi bir görünüm verir. Kesme çiçek yerine saksı tercih ederseniz hediyeniz çok daha uzun kalır.`,
      urunler: oneri,
      oneriler: ["Orkide bakımı zor mu?", "Saksı çiçeği mi kesme çiçek mi?"],
    };
  }

  if (iceriyor(m, "dogum gunu", "kutlama", "tebrik", "mezuniyet", "terfi")) {
    const renkli = aktif
      .filter((u) => norm(u.name + u.tag).includes("karisik") || norm(u.name + u.tag).includes("renkli") || norm(u.name + u.tag).includes("lale"))
      .slice(0, 3);
    return {
      text: `Kutlamalarda canlı ve renkli aranjmanlar daha çok yakışıyor — tek renk yerine karışık buketler neşeyi daha iyi taşıyor. Laleler de bahar havası veriyor.`,
      urunler: renkli,
    };
  }

  if (iceriyor(m, "cenaze", "bassagligi", "taziye", "vefat", "anma")) {
    const celenk = aktif.filter((u) => norm(u.name).includes("celenk")).slice(0, 2);
    return {
      text: `Başınız sağolsun. Bu tür anlarda beyaz çiçekler ve çelenkler tercih ediliyor. Törenin yerini ve saatini bize iletirseniz zamanında ulaştırırız; isterseniz ${SITE.phone} numarasından bizi arayın, hızlıca ilgilenelim.`,
      urunler: celenk,
    };
  }

  if (iceriyor(m, "ofis", "kurumsal", "isyeri", "magaza", "acilis")) {
    return {
      text: `Ofis ve kurumsal alanlar için saksı bitkileri ve düzenli aranjman aboneliği öneriyorum — hem daha ekonomik hem sürekli taze görünüm sağlıyor. Toplu ve düzenli siparişlerde özel fiyat verebiliyoruz; ${SITE.phone} numarasından görüşebiliriz.`,
      oneriler: ["Düzenli aranjman anlaşması nasıl oluyor?"],
    };
  }

  /* ---------------- Bakim ---------------- */
  if (iceriyor(m, "bakim", "ne kadar dayanir", "solmasin", "taze kalir", "omru", "kac gun")) {
    return {
      text: `Doğru bakımla buketlerimiz ortalama 5-7 gün taze kalır. Üç öneri: (1) sapları çapraz kesin ve suyu 2 günde bir değiştirin, (2) doğrudan güneş ve kalorifer yakınından uzak tutun, (3) suya çiçek besini ekleyin. Orkide gibi saksı bitkileri ise doğru bakımda aylarca yaşar.`,
      oneriler: ["Orkideyi ne sıklıkla sulamalıyım?"],
    };
  }

  if (iceriyor(m, "orkide") && iceriyor(m, "sula", "bakim", "nasil")) {
    return {
      text: `Orkide için altın kural: az su, bol ışık (ama direkt güneş değil). Haftada bir kez, saksıyı 10 dakika suya batırıp süzdürmek yeterli. Kökler gümüşi griye dönünce su zamanı gelmiş demektir. Fazla su orkideyi öldüren bir numaralı sebeptir.`,
    };
  }

  /* ---------------- Iade / garanti ---------------- */
  if (iceriyor(m, "iade", "garanti", "memnun kalmazsam", "degisim", "sorun olursa")) {
    return {
      text: `Taze çiçek garantimiz var: aranjmanınızda bir sorun olursa 24 saat içinde bize ulaşın, ücretsiz yenileyelim. 1984'ten bu yana verdiğimiz söz bu. Teslimat saatinden 4 saat öncesine kadar siparişinizi ücretsiz iptal edebilir veya değiştirebilirsiniz.`,
    };
  }

  /* ---------------- Iletisim / adres / saat ---------------- */
  if (iceriyor(m, "iletisim", "telefon", "numara", "adres", "nerede", "magaza", "ulasabilir", "eposta", "e-posta", "mail", "instagram")) {
    return {
      text: `Bize şu kanallardan ulaşabilirsiniz:\n📞 ${SITE.phone}\n✉️ ${SITE.email}\n📍 ${SITE.addressLine1}, ${SITE.addressLine2}\n📷 ${SITE.instagramHandle}\n\nE-postalara genellikle 24 saat içinde dönüyoruz.`,
    };
  }

  /* ---------------- Odeme ---------------- */
  if (iceriyor(m, "odeme", "kredi karti", "kart", "taksit", "havale", "kapida")) {
    return {
      text: `Ödeme sayfamızda kart bilgilerinizi girerek sipariş verebilirsiniz. Güvenli ödeme altyapımız iyzico ile sağlanır; VISA, Mastercard ve TROY kartları 3D Secure ile desteklenir.\n\n(Not: ödeme entegrasyonu şu anda test aşamasındadır — kesin bilgi için ${SITE.phone} numarasından bize ulaşın.)`,
    };
  }

  /* ---------------- Firma / hakkinda ---------------- */
  if (iceriyor(m, "kimsiniz", "hakkinda", "ne zaman kuruldu", "kac yillik", "firma", "hikaye", "1984")) {
    return {
      text: `Çiçeksel, 1984'te Etem Çiçekçilik adıyla Ankara Kızılay'daki Çiçekçiler Çarşısı'nda küçük bir dükkânla başladı. 40 yılı aşkın süredir, üç kuşaktır aynı işi yapıyoruz: 50.000'den fazla mutlu müşteri, 200.000'den fazla teslim edilen buket.`,
    };
  }

  /* ---------------- 3D ---------------- */
  if (iceriyor(m, "3d", "uc boyut", "dondur", "360")) {
    return {
      text: `Bazı aranjmanlarımızı sitede 360° döndürerek inceleyebilirsiniz — "Atölye (3D)" sayfasına veya ana sayfadaki 3D Koleksiyon bölümüne göz atın. Fareyle sürükleyerek her açıdan bakabilirsiniz.`,
    };
  }

  /* ---------------- Genel urun sorusu ---------------- */
  if (iceriyor(m, "ne var", "urun", "katalog", "cesit", "neler satiyor", "oneri", "ne alsam", "onerir")) {
    return {
      text: `Katalogumuzda ${aktif.length} aranjman var: güller, orkideler, ortancalar, laleler, şakayıklar, kazablanka lilyumları, teraryumlar ve çelenkler. Fiyatlar ${formatPrice(enUcuz.price)} ile ${formatPrice(enPahali.price)} arasında değişiyor.\n\nKimin için aldığınızı söylerseniz daha isabetli öneririm.`,
      oneriler: ["Sevgilime ne alsam?", "Anneme ne önerirsin?", "1000 TL bütçem var"],
    };
  }

  /* ---------------- Isimle urun arama ---------------- */
  const eslesen = aktif.filter((u) => {
    const ad = norm(u.name);
    return m.split(/\s+/).some((kelime) => kelime.length > 3 && ad.includes(kelime));
  });
  if (eslesen.length > 0) {
    const u = eslesen[0];
    return {
      text: `${u.name} — ${formatPrice(u.price)}. ${u.tag}.`,
      urunler: eslesen.slice(0, 3),
      oneriler: ["Aynı gün teslim edilir mi?", "Ne kadar dayanır?"],
    };
  }

  /* ---------------- Bilinmeyen: uydurmadan yonlendir ---------------- */
  return {
    text: `Bunu tam anlayamadım — uydurmaktansa dürüst olayım. Size şu konularda net yardımcı olabilirim: aranjman önerisi (kimin için, bütçe), teslimat ve ücretler, çiçek bakımı, iade/garanti, iletişim bilgileri.\n\nDaha özel bir konuysa ${SITE.phone} numarasından ekibimize sorabilirsiniz.`,
    oneriler: ["Ne alsam bilmiyorum", "Teslimat ne kadar sürer?", "İletişim bilgileri"],
  };
}
