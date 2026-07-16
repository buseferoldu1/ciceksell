import crypto from "crypto";

/**
 * iyzico Ödeme Formu (Checkout Form) entegrasyonu.
 *
 * iyzipay npm SDK'si `fs.readdirSync` + dinamik `require` ve agir bir
 * `postman-request` bagimliligi kullaniyor; bu, Vercel/Turbopack serverless
 * paketlemesinde cozulemiyordu. Bu yuzden SDK'ya hic bagli kalmadan
 * iyzico REST API'sini dogrudan `fetch` + Node `crypto` (HMAC-SHA256,
 * IYZWSv2 imzasi) ile cagiriyoruz. Imza uretimi SDK ile birebir aynidir.
 *
 * Akis:
 *  1. /api/payment/init  -> initCheckoutForm -> paymentPageUrl doner, musteri
 *     iyzico'nun guvenli sayfasina gider (kart bilgisi BIZDE tutulmaz).
 *  2. Musteri odeyince iyzico callbackUrl'i POST eder (token ile).
 *  3. /api/payment/callback -> retrieveCheckoutForm -> paymentStatus SUCCESS
 *     ise siparis "odendi" olarak isaretlenir.
 *
 * Anahtarlar YALNIZCA ortam degiskenlerinden okunur:
 *  - IYZICO_API_KEY
 *  - IYZICO_SECRET_KEY
 *  - IYZICO_URI (varsayilan canli: https://api.iyzipay.com;
 *                test icin: https://sandbox-api.iyzipay.com)
 */

const API_KEY = process.env.IYZICO_API_KEY;
const SECRET_KEY = process.env.IYZICO_SECRET_KEY;
const URI = (process.env.IYZICO_URI || "https://api.iyzipay.com").replace(/\/+$/, "");

const INIT_PATH = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const RETRIEVE_PATH = "/payment/iyzipos/checkoutform/auth/ecom/detail";

export function isIyzicoConfigured(): boolean {
  return Boolean(API_KEY && SECRET_KEY);
}

/** SDK ile ayni: rastgele, tahmin edilemez kisa dizge (iyzico geri yansitir) */
function randomKey(): string {
  return Date.now().toString() + crypto.randomBytes(8).toString("hex");
}

/**
 * IYZWSv2 Authorization basligini uretir. Imza, tam olarak govdeye
 * gonderilen JSON dizgesi uzerinden alinir; bu yuzden imzalanan string ile
 * istek govdesi ayni olmali (asagida bodyStr bir kez uretilip kullaniliyor).
 */
function authHeader(uriPath: string, bodyStr: string, rnd: string): string {
  const signature = crypto
    .createHmac("sha256", SECRET_KEY!)
    .update(rnd + uriPath + bodyStr)
    .digest("hex");
  const params = [
    `apiKey:${API_KEY}`,
    `randomKey:${rnd}`,
    `signature:${signature}`,
  ].join("&");
  return "IYZWSv2 " + Buffer.from(params).toString("base64");
}

async function call<T>(path: string, body: unknown): Promise<T> {
  if (!isIyzicoConfigured()) {
    throw new Error("iyzico yapilandirilmamis (IYZICO_API_KEY/SECRET eksik)");
  }
  const rnd = randomKey();
  // Imza ile govde AYNI dizge olmali
  const bodyStr = JSON.stringify(body);
  const res = await fetch(URI + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-iyzi-rnd": rnd,
      "x-iyzi-client-version": "ciceksel-1.0",
      Authorization: authHeader(path, bodyStr, rnd),
    },
    body: bodyStr,
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`iyzico beklenmeyen yanit (${res.status}): ${text.slice(0, 200)}`);
  }
}

export interface IyzicoBuyer {
  id: string;
  name: string;
  surname: string;
  gsmNumber?: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  ip: string;
}

export interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  itemType: string;
  price: string;
}

interface IyzicoAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
}

export interface InitCheckoutParams {
  conversationId: string;
  basketId: string;
  price: string;
  paidPrice: string;
  callbackUrl: string;
  buyer: IyzicoBuyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: IyzicoBasketItem[];
}

interface InitResult {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  conversationId?: string;
}

export function initCheckoutForm(params: InitCheckoutParams): Promise<InitResult> {
  const body = {
    locale: "tr",
    conversationId: params.conversationId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: "TRY",
    basketId: params.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: params.buyer,
    shippingAddress: params.shippingAddress,
    billingAddress: params.billingAddress,
    basketItems: params.basketItems,
  };
  return call<InitResult>(INIT_PATH, body);
}

interface RetrieveResult {
  status: string;
  paymentStatus?: string;
  errorMessage?: string;
  conversationId?: string;
  basketId?: string;
  paymentId?: string;
  paidPrice?: number | string;
}

export function retrieveCheckoutForm(token: string): Promise<RetrieveResult> {
  return call<RetrieveResult>(RETRIEVE_PATH, { locale: "tr", token });
}
