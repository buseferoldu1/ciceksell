import { NextResponse } from "next/server";
import { addProduct, getProducts } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  if (!body?.name || typeof body.price !== "number") {
    return NextResponse.json(
      { error: "name ve price zorunludur" },
      { status: 400 }
    );
  }
  const product = await addProduct({
    name: String(body.name),
    tag: String(body.tag ?? ""),
    price: body.price,
    image: String(body.image ?? "/flowers/katalog/41-gul.jpg"),
    model: body.model ? String(body.model) : undefined,
  });
  return NextResponse.json(product, { status: 201 });
}
