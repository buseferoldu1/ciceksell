import { NextResponse } from "next/server";
import { addOrder, getOrders, getProducts, type PaymentMethod } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";
import { computeOrderTotals } from "@/lib/products";
import { bankActive } from "@/lib/site";
import { getContactSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  return NextResponse.json(await getOrders());
}

/**
 * Kart disi odeme yontemleri (Havale/EFT ve Kapida Odeme) icin siparis
 * olusturur. Kart odemeleri /api/payment/init uzerinden gider.
 * Siparis "beklemede" olarak kaydedilir; havale onayi veya teslimat
 * sonrasi admin panelinden "odendi" yapilir.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const customer = body?.customer;
  const method = body?.paymentMethod as PaymentMethod | undefined;

  if (method !== "havale" && method !== "kapida") {
    return NextResponse.json(
      { error: "Geçersiz ödeme yöntemi" },
      { status: 400 }
    );
  }
  if (method === "havale" && !bankActive(await getContactSettings())) {
    return NextResponse.json(
      { error: "Havale/EFT şu an kullanılamıyor." },
      { status: 503 }
    );
  }
  if (
    !rawItems.length ||
    !customer?.name ||
    !customer?.phone ||
    !customer?.address
  ) {
    return NextResponse.json(
      { error: "items ve customer (name, phone, address) zorunludur" },
      { status: 400 }
    );
  }

  // Katalog urunlerinin fiyatini sunucudaki (yetkili) degerden dogrula
  const products = await getProducts();
  const priceById = new Map(products.map((p) => [p.id, p.price]));
  const items = rawItems.map((i: Record<string, unknown>) => {
    const id = String(i.id);
    const authoritative = priceById.get(id);
    return {
      id,
      name: String(i.name).slice(0, 200),
      price: authoritative ?? Math.max(0, Number(i.price) || 0),
      qty: Math.max(1, Math.min(99, Number(i.qty) || 1)),
    };
  });

  const subtotal = items.reduce(
    (s: number, i: { price: number; qty: number }) => s + i.price * i.qty,
    0
  );
  if (subtotal <= 0) {
    return NextResponse.json({ error: "Geçersiz sepet tutarı" }, { status: 400 });
  }
  const { shipping, discount, total, couponCode } = computeOrderTotals(
    subtotal,
    typeof body?.couponCode === "string" ? body.couponCode : undefined
  );

  const order = await addOrder({
    customer: {
      name: String(customer.name).slice(0, 120),
      phone: String(customer.phone).slice(0, 30),
      email: customer.email ? String(customer.email).slice(0, 120) : undefined,
      address: String(customer.address).slice(0, 500),
      note: customer.note ? String(customer.note).slice(0, 300) : undefined,
      deliveryDate: customer.deliveryDate
        ? String(customer.deliveryDate).slice(0, 10)
        : undefined,
    },
    items,
    subtotal,
    shipping,
    discount,
    couponCode,
    total,
    paymentStatus: "beklemede",
    paymentMethod: method,
  });
  return NextResponse.json(order, { status: 201 });
}
