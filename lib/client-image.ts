/**
 * Yuklemeden once fotografi tarayicida JPEG'e cevirip kucultur.
 *
 * Neden gerekli: telefon galerisinden secilen fotograflar (ozellikle
 * iPhone) genellikle HEIC formatinda gelir; sunucu bu formati kabul
 * etmiyordu ve yukleme sessizce basarisiz oluyordu. `createImageBitmap`
 * tarayicinin kendi kod cozucusunu kullandigi icin HEIC dahil hemen
 * hemen her formati acabilir; canvas'a cizip JPEG olarak yeniden
 * kodlamak hem format sorununu hem de telefon kameralarinin urettigi
 * cok buyuk dosya boyutunu (mobil baglantida zaman asimina yol acabilir)
 * cozer. Tarayici cozemezse (nadir), dosya oldugu gibi gonderilir.
 */
export async function gorseliHazirla(file: File): Promise<File> {
  if (typeof createImageBitmap === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const MAX_KENAR = 1600;
    const olcek = Math.min(1, MAX_KENAR / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * olcek));
    const h = Math.max(1, Math.round(bitmap.height * olcek));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) return file;
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
