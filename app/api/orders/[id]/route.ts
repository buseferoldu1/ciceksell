import { NextResponse } from "next/server";
import {
  setOrderPayment,
  updateOrderStatus,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = [
  "yeni",
  "hazirlaniyor",
  "yolda",
  "teslim-edildi",
  "iptal",
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  "beklemede",
  "odendi",
  "basarisiz",
];

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  // Odeme durumu guncellemesi (orn. havale onayi)
  if (typeof body?.paymentStatus === "string") {
    const ps = body.paymentStatus as PaymentStatus;
    if (!VALID_PAYMENT_STATUSES.includes(ps)) {
      return NextResponse.json({ error: "Geçersiz ödeme durumu" }, { status: 400 });
    }
    const updated = await setOrderPayment(id, ps);
    if (!updated) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(updated);
  }

  // Siparis durumu guncellemesi
  const status = body?.status as OrderStatus;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }
  const updated = await updateOrderStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
