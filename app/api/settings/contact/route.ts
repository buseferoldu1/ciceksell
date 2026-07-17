import { NextResponse } from "next/server";
import type { ContactSettings } from "@/lib/site";
import { getContactSettings, setContactSettings } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getContactSettings());
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Partial<ContactSettings> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const current = await getContactSettings();
  const next: ContactSettings = {
    phone: String(body.phone ?? current.phone).slice(0, 40),
    email: String(body.email ?? current.email).slice(0, 120),
    addressLine1: String(body.addressLine1 ?? current.addressLine1).slice(0, 200),
    addressLine2: String(body.addressLine2 ?? current.addressLine2).slice(0, 200),
    addressShort: String(body.addressShort ?? current.addressShort).slice(0, 80),
    instagram: String(body.instagram ?? current.instagram).slice(0, 200),
    instagramHandle: String(body.instagramHandle ?? current.instagramHandle).slice(0, 60),
    responseTime: String(body.responseTime ?? current.responseTime).slice(0, 120),
    bankHolder: String(body.bankHolder ?? current.bankHolder).slice(0, 100),
    bankIban: String(body.bankIban ?? current.bankIban).slice(0, 40),
    bankName: String(body.bankName ?? current.bankName).slice(0, 60),
  };
  return NextResponse.json(await setContactSettings(next));
}
