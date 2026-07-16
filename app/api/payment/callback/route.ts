import { NextResponse } from "next/server";
import { retrieveCheckoutForm } from "@/lib/iyzico";
import { getOrderById, setOrderPayment } from "@/lib/store";

export const dynamic = "force-dynamic";

function origin(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://ciceksel.com";
}

/**
 * iyzico odeme sonrasi kullanicinin tarayicisini POST ile buraya yonlendirir
 * (govdede "token"). Sonucu dogrular, siparisi gunceller ve kullaniciyi
 * sonuc sayfasina 303 ile geri gondeririz.
 */
export async function POST(req: Request) {
  const base = origin(req);
  const sonuc = (durum: string, siparis?: string) => {
    const url = new URL("/odeme/sonuc", base);
    url.searchParams.set("durum", durum);
    if (siparis) url.searchParams.set("siparis", siparis);
    // 303: POST -> GET donusumu (tarayici sonuc sayfasini GET'ler)
    return NextResponse.redirect(url, 303);
  };

  let token = "";
  try {
    const form = await req.formData();
    token = String(form.get("token") ?? "");
  } catch {
    // Bazi durumlarda JSON gelebilir
    try {
      const body = await req.json();
      token = String(body?.token ?? "");
    } catch {
      /* yok say */
    }
  }

  if (!token) return sonuc("basarisiz");

  try {
    const result = await retrieveCheckoutForm(token);
    const orderId = result.conversationId || result.basketId || "";
    const basarili =
      result.status === "success" && result.paymentStatus === "SUCCESS";

    if (orderId) {
      const order = await getOrderById(orderId);
      if (order) {
        await setOrderPayment(
          orderId,
          basarili ? "odendi" : "basarisiz",
          result.paymentId
        );
      }
    }

    return sonuc(basarili ? "basarili" : "basarisiz", orderId || undefined);
  } catch {
    return sonuc("basarisiz");
  }
}

// iyzico bazen GET ile de yonlendirebilir; guvenli tarafta kalalim
export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/odeme/sonuc?durum=beklemede", origin(req)), 303);
}
