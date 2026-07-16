import PaymentResult from "@/components/ui/payment-result";

export const dynamic = "force-dynamic";

export default async function OdemeSonucPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; siparis?: string; tutar?: string }>;
}) {
  const sp = await searchParams;
  return (
    <PaymentResult
      durum={sp.durum ?? "basarisiz"}
      siparis={sp.siparis}
      tutar={sp.tutar ? Number(sp.tutar) : undefined}
    />
  );
}
