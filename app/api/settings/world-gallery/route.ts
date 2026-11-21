import { NextResponse } from "next/server";
import { getWorldGallery, setWorldGallery } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";
import { WORLD_GALLERY_MAX, type WorldGallerySettings } from "@/lib/world-gallery";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getWorldGallery());
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Partial<WorldGallerySettings> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const cur = await getWorldGallery();
  const ids = Array.isArray(body.productIds)
    ? [...new Set(body.productIds.map((x) => String(x).slice(0, 60)))].slice(0, WORLD_GALLERY_MAX)
    : cur.productIds;
  const next: WorldGallerySettings = {
    enabled: typeof body.enabled === "boolean" ? body.enabled : cur.enabled,
    title: String(body.title ?? cur.title).slice(0, 80),
    subtitle: String(body.subtitle ?? cur.subtitle).slice(0, 140),
    productIds: ids,
  };
  return NextResponse.json(await setWorldGallery(next));
}
