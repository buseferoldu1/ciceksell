import { NextResponse } from "next/server";
import { getTeachersDay, setTeachersDay } from "@/lib/store";
import { isAdmin } from "@/lib/admin-key";
import type { TeachersDaySettings, TeachersDayVisibility } from "@/lib/teachers-day";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getTeachersDay());
}

const GECERLI: TeachersDayVisibility[] = ["auto", "on", "off"];

export async function PUT(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Partial<TeachersDaySettings> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const cur = await getTeachersDay();
  const s = (v: unknown, fallback: string, max: number) =>
    String(v ?? fallback).slice(0, max);
  // Yalnizca site ici yol veya http(s) baglantisina izin ver
  const href = s(body.ctaHref, cur.ctaHref, 300);
  const next: TeachersDaySettings = {
    visibility: GECERLI.includes(body.visibility as TeachersDayVisibility)
      ? (body.visibility as TeachersDayVisibility)
      : cur.visibility,
    eyebrow: s(body.eyebrow, cur.eyebrow, 80),
    title: s(body.title, cur.title, 140),
    message: s(body.message, cur.message, 2000),
    quote: s(body.quote, cur.quote, 200),
    quoteAuthor: s(body.quoteAuthor, cur.quoteAuthor, 80),
    photo: s(body.photo, cur.photo, 400),
    ctaLabel: s(body.ctaLabel, cur.ctaLabel, 60),
    ctaHref: /^(\/|https?:\/\/)/.test(href) ? href : "/katalog",
    promo: s(body.promo, cur.promo, 160),
  };
  return NextResponse.json(await setTeachersDay(next));
}
