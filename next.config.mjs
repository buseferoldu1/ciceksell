/** @type {import('next').NextConfig} */
const nextConfig = {
  // iyzipay SDK'si kaynaklarini fs.readdirSync + dinamik require ile
  // yukluyor; Turbopack bunu statik cozemedigi icin paket sunucu tarafinda
  // harici olarak (Node require ile) yuklenir.
  serverExternalPackages: ["iyzipay"],
};

export default nextConfig;
