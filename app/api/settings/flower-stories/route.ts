import { NextResponse } from "next/server";
import type { FlowerStory } from "@/lib/flower-stories";
import { getFlowerStories, setFlowerStories } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getFlowerStories());
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Bir dizi bekleniyor" }, { status: 400 });
  }
  const current = await getFlowerStories();
  const cleaned: FlowerStory[] = body.map((s: Record<string, unknown>, i: number) => {
    const eski = current[i];
    return {
      id: Number(s.id) || eski?.id || i + 1,
      category: String(s.category ?? eski?.category ?? "Atölye Serisi").slice(0, 60),
      name: String(s.name ?? "").slice(0, 60),
      description: String(s.description ?? "").slice(0, 300),
      origin: String(s.origin ?? "").slice(0, 60),
      family: String(s.family ?? "").slice(0, 60),
      story: String(s.story ?? "").slice(0, 400),
      image: String(s.image ?? eski?.image ?? "").slice(0, 300),
      thumbnail: String(s.thumbnail ?? eski?.thumbnail ?? s.image ?? "").slice(0, 300),
      model: String(s.model ?? eski?.model ?? "").slice(0, 300),
    };
  });
  if (cleaned.some((s) => !s.name || !s.image || !s.model)) {
    return NextResponse.json(
      { error: "Her çiçeğin adı, fotoğrafı ve 3D modeli olmalı" },
      { status: 400 }
    );
  }
  return NextResponse.json(await setFlowerStories(cleaned));
}
