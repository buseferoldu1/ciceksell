import { NextResponse } from "next/server";
import { createUser, getUserByEmail, toPublicUser } from "@/lib/store";
import {
  hashPassword,
  setSessionCookie,
  validateEmail,
  validatePassword,
  SESSION_SECRET,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!SESSION_SECRET) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (SESSION_SECRET)" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Adınızı girin" }, { status: 400 });
  }
  if (!validateEmail(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin" }, { status: 400 });
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Bu e-posta ile bir hesap zaten var" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash });
  await setSessionCookie(user.id);

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
