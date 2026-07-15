import { NextResponse } from "next/server";
import { getUserByEmail, toPublicUser } from "@/lib/store";
import { setSessionCookie, verifyPassword, SESSION_SECRET } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!SESSION_SECRET) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (SESSION_SECRET)" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  const user = await getUserByEmail(email);
  // Hesabin var olup olmadigini sizdirmamak icin ayni mesaj
  const invalid = NextResponse.json(
    { error: "E-posta veya şifre hatalı" },
    { status: 401 }
  );
  if (!user) return invalid;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return invalid;

  await setSessionCookie(user.id);
  return NextResponse.json({ user: toPublicUser(user) });
}
