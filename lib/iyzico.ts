import Iyzipay from "iyzipay";

/**
 * iyzico Ödeme Formu (Checkout Form) entegrasyonu.
 *
 * Akis:
 *  1. /api/payment/init  -> checkoutFormInitialize -> paymentPageUrl doner,
 *     musteri iyzico'nun guvenli sayfasina yonlendirilir (kart bilgisi
 *     BIZDE hic tutulmaz).
 *  2. Musteri odemeyi yapinca iyzico callbackUrl'i POST eder (token ile).
 *  3. /api/payment/callback -> checkoutForm retrieve -> paymentStatus SUCCESS
 *     ise siparis "odendi" olarak isaretlenir.
 *
 * Anahtarlar YALNIZCA ortam degiskenlerinden okunur; koda gomulmez.
 *  - IYZICO_API_KEY
 *  - IYZICO_SECRET_KEY
 *  - IYZICO_URI  (varsayilan: https://api.iyzipay.com — canli.
 *                 Test icin: https://sandbox-api.iyzipay.com)
 */

const API_KEY = process.env.IYZICO_API_KEY;
const SECRET_KEY = process.env.IYZICO_SECRET_KEY;
const URI = process.env.IYZICO_URI || "https://api.iyzipay.com";

export function isIyzicoConfigured(): boolean {
  return Boolean(API_KEY && SECRET_KEY);
}

let _client: Iyzipay | null = null;
function client(): Iyzipay {
  if (!isIyzicoConfigured()) {
    throw new Error("iyzico yapilandirilmamis (IYZICO_API_KEY/SECRET eksik)");
  }
  if (!_client) {
    _client = new Iyzipay({ apiKey: API_KEY!, secretKey: SECRET_KEY!, uri: URI });
  }
  return _client;
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

export interface InitCheckoutParams {
  conversationId: string;
  basketId: string;
  price: string;
  paidPrice: string;
  callbackUrl: string;
  buyer: IyzicoBuyer;
  shippingAddress: { contactName: string; city: string; country: string; address: string };
  billingAddress: { contactName: string; city: string; country: string; address: string };
  basketItems: IyzicoBasketItem[];
}

/** @types/iyzipay paymentPageUrl'i belirtmiyor; genisletiyoruz. */
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
  const iyzipay = client();
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: params.conversationId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: params.basketId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: params.buyer,
    shippingAddress: params.shippingAddress,
    billingAddress: params.billingAddress,
    basketItems: params.basketItems,
  };
  return new Promise((resolve, reject) => {
    // @ts-expect-error — SDK request tipi gevsek; alanlar dogru gonderiliyor
    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) reject(err);
      else resolve(result as unknown as InitResult);
    });
  });
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
  const iyzipay = client();
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(
      { locale: Iyzipay.LOCALE.TR, token },
      (err, result) => {
        if (err) reject(err);
        else resolve(result as unknown as RetrieveResult);
      }
    );
  });
}
