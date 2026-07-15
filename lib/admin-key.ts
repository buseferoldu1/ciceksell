/**
 * Yonetici anahtari.
 *
 * Uretimde ADMIN_KEY ortam degiskeni ZORUNLUDUR. Tanimli degilse admin
 * API'si tamamen kapalidir (varsayilan bir sifreye dusmez) — aksi halde
 * herkesin bildigi sabit bir sifreyle panel ele gecirilebilirdi.
 *
 * Yerel gelistirmede kolaylik olsun diye varsayilan bir anahtar kullanilir.
 *
 * Not: Bu tek anahtarli basit bir korumadir. Coklu kullanici/rol gerekirse
 * NextAuth gibi gercek bir kimlik dogrulamaya gecilmelidir.
 */

const ENV_KEY = process.env.ADMIN_KEY?.trim();
const IS_PROD = process.env.NODE_ENV === "production";
const DEV_FALLBACK = "ciceksel2026";

export const ADMIN_KEY: string | null =
  ENV_KEY && ENV_KEY.length > 0 ? ENV_KEY : IS_PROD ? null : DEV_FALLBACK;

export function isAdmin(req: Request): boolean {
  if (!ADMIN_KEY) return false;
  const provided = req.headers.get("x-admin-key");
  if (!provided || provided.length !== ADMIN_KEY.length) return false;
  // Sabit sureli karsilastirma (zamanlama sizintisini onler)
  let diff = 0;
  for (let i = 0; i < ADMIN_KEY.length; i++) {
    diff |= ADMIN_KEY.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}
