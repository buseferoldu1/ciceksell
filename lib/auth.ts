import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";

/**
 * Basit ama dogru kurgulanmis kimlik dogrulama.
 *
 * - Sifreler ASLA duz metin saklanmaz: scrypt + rastgele salt ile hash'lenir.
 * - Oturum, HMAC ile imzalanmis httpOnly cerezde tutulur (istemci JS'i okuyamaz).
 * - Uretimde SESSION_SECRET zorunludur; yoksa oturum acilamaz.
 *
 * Not: Coklu rol/2FA/sosyal giris gerekirse NextAuth (Auth.js) gibi olgun bir
 * cozume gecmek daha dogru olur.
 */

const scryptAsync = promisify(scrypt);

const IS_PROD = process.env.NODE_ENV === "production";
const ENV_SECRET = process.env.SESSION_SECRET?.trim();
const DEV_SECRET = "gelistirme-icin-gecici-oturum-anahtari";

export const SESSION_SECRET: string | null =
  ENV_SECRET && ENV_SECRET.length > 0 ? ENV_SECRET : IS_PROD ? null : DEV_SECRET;

export const SESSION_COOKIE = "ciceksel-oturum";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 gun

/* ------------------------------- Sifreler -------------------------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(keyBuf, derived);
}

/* ------------------------------- Oturum ---------------------------------- */

export function signSession(userId: string): string | null {
  if (!SESSION_SECRET) return null;
  const payload = `${userId}|${Date.now()}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

export function verifySession(token: string): string | null {
  if (!SESSION_SECRET) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  const expected = createHmac("sha256", SESSION_SECRET)
    .update(`${userId}|${ts}`)
    .digest("hex");
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Date.now() - Number(ts) > SESSION_MAX_AGE * 1000) return null;
  return userId;
}

export async function setSessionCookie(userId: string) {
  const token = signSession(userId);
  if (!token) return;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/* ------------------------------ Dogrulama -------------------------------- */

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** En az 8 karakter; cok basit sifreleri engeller. */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Şifre en az 8 karakter olmalı";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
    return "Şifre en az bir harf ve bir rakam içermeli";
  return null;
}
