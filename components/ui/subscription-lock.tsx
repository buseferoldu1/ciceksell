/**
 * Abonelik odenmediginde sitenin girisini kaplayan ekran.
 * Normal bir "404 / sayfa bulunamadi" hatasi gibi gorunur.
 *
 * VARSAYILAN: KAPALI (hicbir sey gostermez). Acmak icin Vercel ortam
 * degiskenlerine SUBSCRIPTION_OVERDUE=1 ekleyip yeniden deploy edin;
 * kapatmak icin degiskeni silin / 0 yapin. Admin panelinden degistirilemez.
 */
export default function SubscriptionLock() {
  if (process.env.SUBSCRIPTION_OVERDUE !== "1") return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-white px-6 text-center text-[#1a1a1a]">
      <div className="max-w-md">
        <h1 className="text-[96px] font-bold leading-none text-[#1a1a1a]">404</h1>
        <p className="mt-4 text-lg text-[#444]">Bu sayfaya şu anda ulaşılamıyor.</p>
        <p className="mt-2 text-sm text-[#888]">
          Aradığınız sayfa bulunamadı ya da geçici olarak kullanım dışı.
        </p>
      </div>
    </div>
  );
}
