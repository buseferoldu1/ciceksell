import { NextResponse } from "next/server";
import { addOrder, getProducts, setOrderPayment } from "@/lib/store";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/products";
import {
  initCheckoutForm,
  isIyzicoConfigured,
  type IyzicoBasketItem,
} from "@/lib/iyzico";

export const dynamic = "force-dynamic";

/** Integer TL -> iyzico'nun bekledigi "123.0" formati */
const tl = (n: number) => n.toFixed(1);

/** Istegin geldigi kok adres (Vercel proxy arkasinda dogru sonuc verir) */
function origin(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://ciceksel.com";
}

export async function POST(req: Request) {
  if (!isIyzicoConfigured()) {
    return NextResponse.json(
      { error: "Ödeme sistemi şu an yapılandırılmamış. Lütfen bizi arayın." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const customer = body?.customer;

  if (
    !rawItems.length ||
    !customer?.name ||
    !customer?.phone ||
    !customer?.address ||
    !customer?.email
  ) {
    return NextResponse.json(
      { error: "items ve customer (name, phone, address, email) zorunludur" },
      { status: 400 }
    );
  }

  // Katalog urunlerinin fiyatini sunucudaki (yetkili) degerden dogrula;
  // ozel buketler (id "ozel-...") istemci fiyatiyla gecer.
  const products = await getProducts();
  const priceById = new Map(products.map((p) => [p.id, p.price]));

  const items = rawItems.map((i: Record<string, unknown>) => {
    const id = String(i.id);
    const authoritative = priceById.get(id);
    const price = authoritative ?? Math.max(0, Number(i.price) || 0);
    return {
      id,
      name: String(i.name).slice(0, 200),
      price,
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
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  // Once siparisi "beklemede" olarak kaydet; callback'te "odendi" yapilir.
  const order = await addOrder({
    customer: {
      name: String(customer.name).slice(0, 120),
      phone: String(customer.phone).slice(0, 30),
      email: String(customer.email).slice(0, 120),
      address: String(customer.address).slice(0, 500),
      note: customer.note ? String(customer.note).slice(0, 300) : undefined,
      deliveryDate: customer.deliveryDate
        ? String(customer.deliveryDate).slice(0, 10)
        : undefined,
    },
    items,
    subtotal,
    shipping,
    total,
    paymentStatus: "beklemede",
    paymentMethod: "kart",
  });

  // iyzico sepet kalemleri: her satir = birim fiyat * adet. Kargo varsa
  // ayri bir kalem olarak eklenir ki sum(basketItems) == price == paidPrice.
  const basketItems: IyzicoBasketItem[] = items.map(
    (i: { id: string; name: string; price: number; qty: number }) => ({
      id: i.id,
      name: i.qty > 1 ? `${i.name} (${i.qty} adet)` : i.name,
      category1: "Çiçek",
      itemType: "PHYSICAL",
      price: tl(i.price * i.qty),
    })
  );
  if (shipping > 0) {
    basketItems.push({
      id: "kargo",
      name: "Teslimat",
      category1: "Kargo",
      itemType: "PHYSICAL",
      price: tl(shipping),
    });
  }

  // Ad/soyad ayir; iyzico ikisini de ister
  const parts = String(customer.name).trim().split(/\s+/);
  const surname = parts.length > 1 ? parts.pop()! : parts[0];
  const name = parts.join(" ") || surname;

  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    "85.34.78.112";

  try {
    const result = await initCheckoutForm({
      conversationId: order.id,
      basketId: order.id,
      price: tl(total),
      paidPrice: tl(total),
      callbackUrl: `${origin(req)}/api/payment/callback`,
      buyer: {
        id: order.id,
        name,
        surname,
        gsmNumber: String(customer.phone).replace(/\s/g, ""),
        email: String(customer.email),
        // TCKN toplamiyoruz; iyzico Odeme Formu placeholder kabul eder
        identityNumber: "11111111111",
        registrationAddress: String(customer.address).slice(0, 500),
        city: "İstanbul",
        country: "Türkiye",
        ip,
      },
      shippingAddress: {
        contactName: String(customer.name),
        city: "İstanbul",
        country: "Türkiye",
        address: String(customer.address).slice(0, 500),
      },
      billingAddress: {
        contactName: String(customer.name),
        city: "İstanbul",
        country: "Türkiye",
        address: String(customer.address).slice(0, 500),
      },
      basketItems,
    });

    if (result.status !== "success" || !result.paymentPageUrl) {
      // Basarisiz init -> siparisi basarisiz isaretle
      await setOrderPayment(order.id, "basarisiz");
      return NextResponse.json(
        {
          error:
            result.errorMessage ||
            "Ödeme başlatılamadı, lütfen tekrar deneyin.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      paymentPageUrl: result.paymentPageUrl,
    });
  } catch (e) {
    await setOrderPayment(order.id, "basarisiz");
    const msg = e instanceof Error ? e.message : "Ödeme başlatılamadı";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
