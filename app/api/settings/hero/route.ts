import { NextResponse } from "next/server";
import { getHeroSettings, setHeroSettings } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";
import { HERO_MAX_SLIDES, type HeroSettings, type HeroSlide } from "@/lib/hero";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getHeroSettings());
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Partial<HeroSettings> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const cur = await getHeroSettings();
  let slides = cur.slides;
  if (Array.isArray(body.slides)) {
    slides = body.slides.slice(0, HERO_MAX_SLIDES).map((s: Partial<HeroSlide>) => ({
      headlineTop: String(s?.headlineTop ?? "").slice(0, 30),
      headlineBottom: String(s?.headlineBottom ?? "").slice(0, 30),
      productId: String(s?.productId ?? "").slice(0, 60),
      heroImage: String(s?.heroImage ?? "").slice(0, 400),
    }));
    if (slides.some((s) => !s.productId)) {
      return NextResponse.json({ error: "Her slayt için bir ürün seçin" }, { status: 400 });
    }
    if (slides.length === 0) {
      return NextResponse.json({ error: "En az bir slayt olmalı" }, { status: 400 });
    }
  }
  const next: HeroSettings = {
    badge: String(body.badge ?? cur.badge).slice(0, 80),
    slides,
  };
  return NextResponse.json(await setHeroSettings(next));
}
