import SubscriptionLock from "@/components/ui/subscription-lock";

// Abonelik durumu sunucu tarafinda okunur (bkz. components/ui/subscription-lock.tsx);
// admin paneli "use client" oldugu icin process.env burada, layout'ta kontrol edilir.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.SUBSCRIPTION_OVERDUE === "1") {
    return <SubscriptionLock />;
  }
  return <>{children}</>;
}
