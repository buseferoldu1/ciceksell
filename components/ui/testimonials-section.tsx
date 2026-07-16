"use client";

import {
  TestimonialsSection,
  type Testimonial,
} from "@/components/blocks/testimonials-with-marquee";

/**
 * NOT: Asagidaki yorumlar ORNEKTIR — ciceksel.com'da gercek musteri yorumu
 * bulunmadigi icin yer tutucu olarak yazildi. Yayina almadan once gercek
 * musteri yorumlariyla degistirin (sahte yorum yayinlamak hem etik hem
 * yasal olarak sorunludur).
 */
const YORUMLAR: Testimonial[] = [
  {
    author: { name: "Elif Yılmaz", handle: "Çankaya, Ankara" },
    text: "Anneme gönderdiğim ortanca aranjmanı tarifsiz güzeldi. Aynı gün teslimat sözü tutuldu, çiçekler günlerce taze kaldı.",
  },
  {
    author: { name: "Mert Kaya", handle: "Kızılay, Ankara" },
    text: "Yıl dönümümüz için 41 kırmızı gül sipariş ettim. Paketleme ve sunum beklediğimden çok daha özenliydi.",
  },
  {
    author: { name: "Zeynep Arslan", handle: "Çayyolu, Ankara" },
    text: "Ofisimiz için düzenli aranjman alıyoruz. Her seferinde aynı kalite ve aynı güler yüz. 40 yıllık tecrübe belli oluyor.",
  },
  {
    author: { name: "Burak Demir", handle: "Etimesgut, Ankara" },
    text: "Son dakika doğum günü sürprizi için aradım, 3 saatte kapıdaydı. Gerçekten hayat kurtardılar.",
  },
  {
    author: { name: "Ayşe Şahin", handle: "Keçiören, Ankara" },
    text: "Kazablanka buketi fotoğraftakinin birebir aynısı geldi. İnternetten çiçek alırken en çok korktuğum şeydi, boşunaymış.",
  },
  {
    author: { name: "Can Öztürk", handle: "Yenimahalle, Ankara" },
    text: "Cenaze çelengi için aradığımda gösterdikleri anlayış ve hız için minnettarım. Zor bir günde yükümüzü hafiflettiler.",
  },
];

export default function Yorumlar() {
  return (
    <TestimonialsSection
      title="Müşterilerimiz Ne Diyor?"
      description="1984'ten bu yana 50.000'den fazla mutlu müşteri. İşte bazılarının deneyimi."
      testimonials={YORUMLAR}
    />
  );
}
