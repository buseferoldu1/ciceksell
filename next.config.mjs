/** @type {import('next').NextConfig} */
const nextConfig = {
  // iyzipay SDK'si kaynaklarini fs.readdirSync + dinamik require ile
  // yukluyor; Turbopack bunu statik cozemedigi icin paket sunucu tarafinda
  // harici olarak (Node require ile) yuklenir.
  serverExternalPackages: ["iyzipay"],

  // Dinamik require nedeniyle Vercel'in dosya izleyicisi iyzipay/lib
  // altindaki kaynaklari (resources, requests) kacirir ve calisma aninda
  // "ENOENT ... /iyzipay/lib/resources" hatasi verir. Odeme rotalarina
  // tum iyzipay paketini acikca dahil ediyoruz.
  outputFileTracingIncludes: {
    "/api/payment/init": ["./node_modules/iyzipay/**/*"],
    "/api/payment/callback": ["./node_modules/iyzipay/**/*"],
  },
};

export default nextConfig;
