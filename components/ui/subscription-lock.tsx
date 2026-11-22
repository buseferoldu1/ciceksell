/**
 * Abonelik odenmediginde sitenin girisini kaplayan uyari ekrani.
 *
 * VARSAYILAN: KAPALI (hicbir sey gostermez). Acmak icin Vercel ortam
 * degiskenlerine SUBSCRIPTION_OVERDUE=1 ekleyip yeniden deploy edin;
 * kapatmak icin degiskeni silin / 0 yapin. Admin panelinden degistirilemez.
 *
 * Istege bagli degiskenler:
 *  - SUBSCRIPTION_CONTACT  (butonun altinda gorunen iletisim/odeme notu)
 *
 * "Yeniden Abone Ol"a tiklaninca "sahip oldugunuz servis saglayiciya
 * basvurun" mesaji gosterilir.
 */
import SubscribeButton from "./subscribe-button";

export default function SubscriptionLock() {
  if (process.env.SUBSCRIPTION_OVERDUE !== "1") return null;

  const contact = process.env.SUBSCRIPTION_CONTACT;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Abonelik uyarısı"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#131314] px-6 text-center text-[#e5e2e3]"
    >
      <div className="max-w-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#d9594c]/40 bg-[#d9594c]/10 text-3xl">
          ⚠️
        </div>
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Aboneliğiniz ödenmedi
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[#e5e2e3]/70">
          Site aboneliğiniz ödenmediği için bu sayfa geçici olarak erişime
          kapatılmıştır. Yeniden abone olarak sitenizi hemen tekrar yayına
          alabilirsiniz.
        </p>
        <SubscribeButton />
        {contact && (
          <p className="mt-6 text-sm text-[#e5e2e3]/50">{contact}</p>
        )}
      </div>
    </div>
  );
}
