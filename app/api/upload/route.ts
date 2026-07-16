import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/admin-key";

export const dynamic = "force-dynamic";

// Bilinen tipler icin duzgun uzantiya cevrilir; taniyamadigimiz ama
// "image/" ile baslayan her tip de kabul edilir (orn. HEIC/HEIC gonderen
// eski tarayicilar) — istemci genelde JPEG'e cevirip gonderir, bu sadece
// ek guvence.
const KNOWN_EXT = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/heic", ".heic"],
  ["image/heif", ".heif"],
  ["image/gif", ".gif"],
]);
const MAX_SIZE = 15 * 1024 * 1024; // 15 MB (istemci genelde kucultup gonderir)

// Uretimde (Vercel) dosya sistemi salt-okunurdur; gorseller Blob'a
// yuklenir. Yerelde token yoksa public/uploads klasorune yazilir.
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file alanı zorunlu" }, { status: 400 });
  }

  // Bazi mobil tarayicilar galeriden secilen dosya icin bos MIME tipi
  // gonderir; dosya adindaki uzantiya da bakiyoruz ki yukleme reddedilmesin.
  const adUzantisi = (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? "").toLowerCase();
  const bilinenUzantilar = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".gif"];
  const ext =
    KNOWN_EXT.get(file.type) ??
    (file.type.startsWith("image/") ? ".jpg" : null) ??
    (!file.type && bilinenUzantilar.includes(adUzantisi) ? adUzantisi : null);
  if (!ext) {
    return NextResponse.json(
      { error: "Yalnızca fotoğraf dosyaları yüklenebilir" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Dosya 15 MB'den büyük olamaz" },
      { status: 400 }
    );
  }

  // Dosya adi tamamen sunucuda uretilir (path traversal onlemi)
  const name = `urun-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}${ext}`;

  if (BLOB_TOKEN) {
    const blob = await put(`urunler/${name}`, file, {
      access: "public",
      contentType: file.type || "image/jpeg",
      token: BLOB_TOKEN,
    });
    return NextResponse.json({ path: blob.url }, { status: 201 });
  }

  // Yerel gelistirme yedegi
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), buf);
  return NextResponse.json({ path: `/uploads/${name}` }, { status: 201 });
}
