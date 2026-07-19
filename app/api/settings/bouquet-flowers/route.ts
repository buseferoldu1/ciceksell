import { NextResponse } from "next/server";
import type { FlowerCategory, FlowerOption } from "@/lib/bouquet";

const GECERLI_KATEGORILER: FlowerCategory[] = ["saksi", "orkide", "gul", "kesme"];
import { getBouquetFlowers, setBouquetFlowers } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getBouquetFlowers());
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Bir dizi bekleniyor" }, { status: 400 });
  }
  const current = await getBouquetFlowers();
  const cleaned: FlowerOption[] = body.map((f: Record<string, unknown>, i: number) => {
    const eski = current.find((x) => x.id === f.id) ?? current[i];
    return {
      id: String(f.id ?? eski?.id ?? `cicek-${i}`).slice(0, 60),
      name: String(f.name ?? "").slice(0, 60),
      price: Math.max(0, Number(f.price) || 0),
      image: String(f.image ?? eski?.image ?? "").slice(0, 300),
      note: String(f.note ?? "").slice(0, 120),
      color: String(f.color ?? eski?.color ?? "#d9594c").slice(0, 20),
      category: GECERLI_KATEGORILER.includes(f.category as FlowerCategory)
        ? (f.category as FlowerCategory)
        : (eski?.category ?? "kesme"),
      // 3D model dosyasi (GLB) admin panelinden degistirilemez; mevcut
      // kaydin modelini korur (yeni bir cicek eklenirse bos kalir, 3D
      // onizleme o cicek icin devre disi gorunur).
      model: String(eski?.model ?? "").slice(0, 300),
    };
  });
  if (cleaned.some((f) => !f.id || !f.name || f.price <= 0 || !f.image)) {
    return NextResponse.json(
      { error: "Her çiçeğin adı, fotoğrafı ve geçerli bir fiyatı olmalı" },
      { status: 400 }
    );
  }
  return NextResponse.json(await setBouquetFlowers(cleaned));
}
