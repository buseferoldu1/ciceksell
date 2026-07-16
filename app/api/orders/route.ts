import { NextResponse } from "next/server";
import { addOrder, getOrders } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  return NextResponse.json(await getOrders());
}

export async function POST(req: Request) {
  const body = await req.json();
  const items = Array.isArray(body?.items) ? body.items : [];
  const customer = body?.customer;
  if (!items.length || !customer?.name || !customer?.phone || !customer?.address) {
    return NextResponse.json(
      { error: "items ve customer (name, phone, address) zorunludur" },
      { status: 400 }
    );
  }
  const cleanItems = items.map((i: Record<string, unknown>) => ({
    id: String(i.id),
    name: String(i.name),
    price: Number(i.price) || 0,
    qty: Math.max(1, Number(i.qty) || 1),
  }));
  const subtotal = cleanItems.reduce(
    (s: number, i: { price: number; qty: number }) => s + i.price * i.qty,
    0
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const order = await addOrder({
    customer: {
      name: String(customer.name),
      phone: String(customer.phone),
      address: String(customer.address),
      note: customer.note ? String(customer.note) : undefined,
      deliveryDate: customer.deliveryDate
        ? String(customer.deliveryDate)
        : undefined,
    },
    items: cleanItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
  });
  return NextResponse.json(order, { status: 201 });
}
