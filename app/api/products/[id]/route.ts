import { NextResponse } from "next/server";
import { deleteProduct, updateProduct } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";
import { CATEGORIES, type CategoryKey } from "@/lib/products";

const GECERLI_KATEGORILER = new Set(CATEGORIES.map((c) => c.key));

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.tag !== undefined) patch.tag = String(body.tag);
  if (body.price !== undefined) patch.price = Number(body.price);
  if (body.image !== undefined) patch.image = String(body.image);
  if (body.model !== undefined)
    patch.model = body.model ? String(body.model) : undefined;
  if (GECERLI_KATEGORILER.has(body.category as CategoryKey))
    patch.category = body.category as CategoryKey;
  const updated = await updateProduct(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
