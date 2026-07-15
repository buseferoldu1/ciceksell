import { NextResponse } from "next/server";
import { updateOrderStatus, type OrderStatus } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = [
  "yeni",
  "hazirlaniyor",
  "yolda",
  "teslim-edildi",
  "iptal",
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
