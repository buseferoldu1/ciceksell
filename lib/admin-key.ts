// DEMO yonetici anahtari: yalnizca yerel gelistirme icindir.
// Canliya cikista gercek bir kimlik dogrulama (orn. NextAuth) kullanin
// ve bu anahtari ortam degiskenine tasiyin.
export const ADMIN_KEY = process.env.ADMIN_KEY ?? "ciceksel2026";

export function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}
