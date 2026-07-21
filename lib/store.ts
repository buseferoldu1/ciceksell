import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { CATALOG, MODELS_3D, type Product } from "./products";
import { DEFAULT_CONTACT, type ContactSettings } from "./site";
import { DEFAULT_FLOWER_OPTIONS, type FlowerOption } from "./bouquet";
import { DEFAULT_FLOWER_STORIES, type FlowerStory } from "./flower-stories";

/**
 * Veri deposu iki modda calisir:
 *  - Postgres (DATABASE_URL tanimliysa): Vercel/uretim icin. Kalicidir.
 *  - Dosya sistemi (aksi halde): yerel gelistirme icin, data/*.json.
 * Vercel'de dosya sistemi salt-okunur oldugundan uretimde DATABASE_URL
 * mutlaka tanimli olmalidir.
 */

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
export const usingDatabase = Boolean(DATABASE_URL);

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

export type OrderStatus =
  | "yeni"
  | "hazirlaniyor"
  | "yolda"
  | "teslim-edildi"
  | "iptal";

/** Odeme durumu — iyzico ile online tahsilat icin. */
export type PaymentStatus = "beklemede" | "odendi" | "basarisiz";

/** Odeme yontemi: kredi/banka karti (iyzico), havale/EFT, kapida odeme. */
export type PaymentMethod = "kart" | "havale" | "kapida";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  /** Ozel buketlerde dal dal icerik (orn. "5 Şakayık Pembe, 3 Kazablanka — Kraft Ambalaj") */
  detail?: string;
}

/** Sifre hash'i asla istemciye gonderilmez. */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  /** Online odeme durumu. Eski/demo kayitlarda "odendi" varsayilir. */
  paymentStatus: PaymentStatus;
  /** Odeme yontemi. Eski kayitlarda "kart" varsayilir. */
  paymentMethod: PaymentMethod;
  /** iyzico tarafindan donen odeme kimligi (basarili tahsilatlarda). */
  paymentId?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    email?: string;
    note?: string;
    /** Musterinin sectigi teslimat tarihi (ISO, yyyy-MM-dd) */
    deliveryDate?: string;
    /** Cicegin teslim edilecegi kisi (siparisi veren farkli olabilir) */
    recipientName?: string;
    /** Teslimat ilcesi (Ankara ici) */
    district?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  /** Kupon indirimi (TL). Kupon uygulanmadiysa 0. */
  discount: number;
  /** Uygulanan kupon kodu (varsa). */
  couponCode?: string;
  total: number;
}

function seedProducts(): Product[] {
  return [...CATALOG.katalog, ...MODELS_3D];
}

/* ---------------------------------- SQL ---------------------------------- */

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          tag TEXT NOT NULL DEFAULT '',
          price INTEGER NOT NULL,
          image TEXT NOT NULL,
          model TEXT,
          seq SERIAL
        )
      `;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'karisik'`;
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          status TEXT NOT NULL DEFAULT 'yeni',
          customer JSONB NOT NULL,
          items JSONB NOT NULL,
          subtotal INTEGER NOT NULL,
          shipping INTEGER NOT NULL,
          total INTEGER NOT NULL
        )
      `;
      // Odeme alanlari sonradan eklendi: mevcut kayitlar "odendi" sayilir
      // (eski/demo siparisler), yeni online siparisler acikca "beklemede".
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'odendi'`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'kart'`;
      // Kupon kodu indirimi
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 0`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT`;
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // Genel amacli anahtar-deger ayar deposu: iletisim bilgileri, banka
      // hesabi, atolye icerigi (cicek hikayeleri, buket cicekleri) gibi
      // admin panelinden duzenlenebilir icerikler burada JSON olarak tutulur.
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // Ilk kurulumda katalogu tohumla
      const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM products`) as {
        count: number;
      }[];
      if (count === 0) {
        for (const p of seedProducts()) {
          await sql`
            INSERT INTO products (id, name, tag, price, image, model, category)
            VALUES (${p.id}, ${p.name}, ${p.tag}, ${p.price}, ${p.image}, ${p.model ?? null}, ${p.category})
            ON CONFLICT (id) DO NOTHING
          `;
        }
      }
    })();
  }
  return schemaReady;
}

type ProductRow = {
  id: string;
  name: string;
  tag: string;
  price: number;
  image: string;
  model: string | null;
  category: string;
};

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    tag: r.tag,
    price: r.price,
    image: r.image,
    category: (r.category as Product["category"]) ?? "karisik",
    ...(r.model ? { model: r.model } : {}),
  };
}

/* ----------------------------- Dosya sistemi ----------------------------- */

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PRODUCTS_FILE);
  } catch {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(seedProducts(), null, 2), "utf8");
  }
  try {
    await fs.access(ORDERS_FILE);
  } catch {
    await fs.writeFile(ORDERS_FILE, "[]", "utf8");
  }
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]", "utf8");
  }
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.writeFile(SETTINGS_FILE, "{}", "utf8");
  }
}

async function readFileProducts(): Promise<Product[]> {
  await ensureFiles();
  return JSON.parse(await fs.readFile(PRODUCTS_FILE, "utf8")) as Product[];
}

async function writeFileProducts(list: Product[]) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(list, null, 2), "utf8");
}

async function readFileOrders(): Promise<Order[]> {
  await ensureFiles();
  return JSON.parse(await fs.readFile(ORDERS_FILE, "utf8")) as Order[];
}

async function writeFileOrders(list: Order[]) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(list, null, 2), "utf8");
}

/* ------------------------------- Urunler --------------------------------- */

export async function getProducts(): Promise<Product[]> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, name, tag, price, image, model, category FROM products ORDER BY seq ASC
    `) as ProductRow[];
    return rows.map(rowToProduct);
  }
  return readFileProducts();
}

export async function addProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  const id = `p${Date.now().toString(36)}`;
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      INSERT INTO products (id, name, tag, price, image, model, category)
      VALUES (${id}, ${data.name}, ${data.tag}, ${data.price}, ${data.image}, ${data.model ?? null}, ${data.category ?? "karisik"})
      RETURNING id, name, tag, price, image, model, category
    `) as ProductRow[];
    return rowToProduct(rows[0]);
  }
  const list = await readFileProducts();
  const product: Product = { ...data, id, category: data.category ?? "karisik" };
  list.push(product);
  await writeFileProducts(list);
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id">>
): Promise<Product | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      UPDATE products SET
        name  = COALESCE(${patch.name ?? null}, name),
        tag   = COALESCE(${patch.tag ?? null}, tag),
        price = COALESCE(${patch.price ?? null}, price),
        image = COALESCE(${patch.image ?? null}, image),
        category = COALESCE(${patch.category ?? null}, category),
        -- model YALNIZCA acikca gonderildiyse degistirilir. Onceden
        -- gonderilmediginde NULL yaziliyordu: adini/fiyatini duzenledigin
        -- her 3D urun modelini kaybediyordu.
        model = CASE WHEN ${"model" in patch} THEN ${patch.model ?? null} ELSE model END
      WHERE id = ${id}
      RETURNING id, name, tag, price, image, model, category
    `) as ProductRow[];
    return rows[0] ? rowToProduct(rows[0]) : null;
  }
  const list = await readFileProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, id };
  await writeFileProducts(list);
  return list[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      DELETE FROM products WHERE id = ${id} RETURNING id
    `) as { id: string }[];
    return rows.length > 0;
  }
  const list = await readFileProducts();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  await writeFileProducts(next);
  return true;
}

/* ------------------------------ Siparisler ------------------------------- */

type OrderRow = {
  id: string;
  created_at: string | Date;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_id: string | null;
  customer: Order["customer"];
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  coupon_code: string | null;
  total: number;
};

function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    createdAt: new Date(r.created_at).toISOString(),
    status: r.status,
    paymentStatus: r.payment_status ?? "odendi",
    paymentMethod: r.payment_method ?? "kart",
    ...(r.payment_id ? { paymentId: r.payment_id } : {}),
    customer: r.customer,
    items: r.items,
    subtotal: r.subtotal,
    shipping: r.shipping,
    discount: r.discount ?? 0,
    ...(r.coupon_code ? { couponCode: r.coupon_code } : {}),
    total: r.total,
  };
}

export async function getOrders(): Promise<Order[]> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, created_at, status, payment_status, payment_method, payment_id,
             customer, items, subtotal, shipping, discount, coupon_code, total
      FROM orders ORDER BY created_at DESC
    `) as OrderRow[];
    return rows.map(rowToOrder);
  }
  return readFileOrders();
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, created_at, status, payment_status, payment_method, payment_id,
             customer, items, subtotal, shipping, discount, coupon_code, total
      FROM orders WHERE id = ${id}
    `) as OrderRow[];
    return rows[0] ? rowToOrder(rows[0]) : null;
  }
  const orders = await readFileOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function addOrder(
  data: Omit<
    Order,
    "id" | "createdAt" | "status" | "paymentStatus" | "paymentMethod" | "paymentId"
  > & {
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
  }
): Promise<Order> {
  const id = `CS-${Date.now().toString().slice(-8)}`;
  const paymentStatus: PaymentStatus = data.paymentStatus ?? "odendi";
  const paymentMethod: PaymentMethod = data.paymentMethod ?? "kart";
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      INSERT INTO orders (id, status, payment_status, payment_method, customer, items, subtotal, shipping, discount, coupon_code, total)
      VALUES (
        ${id}, 'yeni', ${paymentStatus}, ${paymentMethod},
        ${JSON.stringify(data.customer)}::jsonb,
        ${JSON.stringify(data.items)}::jsonb,
        ${data.subtotal}, ${data.shipping}, ${data.discount ?? 0}, ${data.couponCode ?? null}, ${data.total}
      )
      RETURNING id, created_at, status, payment_status, payment_method, payment_id,
                customer, items, subtotal, shipping, discount, coupon_code, total
    `) as OrderRow[];
    return rowToOrder(rows[0]);
  }
  const orders = await readFileOrders();
  const order: Order = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    status: "yeni",
    paymentStatus,
    paymentMethod,
  };
  orders.unshift(order);
  await writeFileOrders(orders);
  return order;
}

/** iyzico callback'i sonrasi odeme durumunu gunceller. */
export async function setOrderPayment(
  id: string,
  paymentStatus: PaymentStatus,
  paymentId?: string
): Promise<Order | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      UPDATE orders
      SET payment_status = ${paymentStatus},
          payment_id = ${paymentId ?? null}
      WHERE id = ${id}
      RETURNING id, created_at, status, payment_status, payment_method, payment_id,
                customer, items, subtotal, shipping, discount, coupon_code, total
    `) as OrderRow[];
    return rows[0] ? rowToOrder(rows[0]) : null;
  }
  const orders = await readFileOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].paymentStatus = paymentStatus;
  if (paymentId) orders[idx].paymentId = paymentId;
  await writeFileOrders(orders);
  return orders[idx];
}

/* ----------------------------- Kullanicilar ------------------------------ */

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string | Date;
};

function rowToUserRecord(r: UserRow): UserRecord {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

/** Sifre hash'ini disari sizdirmamak icin herkese acik gorunum. */
export function toPublicUser(u: UserRecord): User {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt };
}

async function readFileUsers(): Promise<UserRecord[]> {
  await ensureFiles();
  return JSON.parse(await fs.readFile(USERS_FILE, "utf8")) as UserRecord[];
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const key = email.trim().toLowerCase();
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, email, name, password_hash, created_at FROM users WHERE email = ${key}
    `) as UserRow[];
    return rows[0] ? rowToUserRecord(rows[0]) : null;
  }
  const list = await readFileUsers();
  return list.find((u) => u.email === key) ?? null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, email, name, password_hash, created_at FROM users WHERE id = ${id}
    `) as UserRow[];
    return rows[0] ? rowToUserRecord(rows[0]) : null;
  }
  const list = await readFileUsers();
  return list.find((u) => u.id === id) ?? null;
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const email = data.email.trim().toLowerCase();
  const id = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (${id}, ${email}, ${data.name}, ${data.passwordHash})
      RETURNING id, email, name, password_hash, created_at
    `) as UserRow[];
    return rowToUserRecord(rows[0]);
  }
  const list = await readFileUsers();
  const user: UserRecord = {
    id,
    email,
    name: data.name,
    passwordHash: data.passwordHash,
    createdAt: new Date().toISOString(),
  };
  list.push(user);
  await fs.writeFile(USERS_FILE, JSON.stringify(list, null, 2), "utf8");
  return user;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      UPDATE orders SET status = ${status} WHERE id = ${id}
      RETURNING id, created_at, status, payment_status, payment_method, payment_id,
                customer, items, subtotal, shipping, discount, coupon_code, total
    `) as OrderRow[];
    return rows[0] ? rowToOrder(rows[0]) : null;
  }
  const orders = await readFileOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  await writeFileOrders(orders);
  return orders[idx];
}

/* ----------------------------- Genel ayarlar ------------------------------ */
/**
 * Anahtar-deger bazli genel ayar deposu: iletisim bilgileri, banka hesabi,
 * atolye icerigi (cicek hikayeleri, buket cicekleri) gibi admin panelinden
 * duzenlenebilir icerikler burada tutulur. Deger her zaman JSON'a
 * serilestirilebilir olmalidir; cagiran taraf tipini bilir (generic).
 */

export async function getSetting<T>(key: string): Promise<T | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT value FROM settings WHERE key = ${key}
    `) as { value: T }[];
    return rows[0] ? rows[0].value : null;
  }
  await ensureFiles();
  const all = JSON.parse(await fs.readFile(SETTINGS_FILE, "utf8")) as Record<
    string,
    unknown
  >;
  return key in all ? (all[key] as T) : null;
}

export async function setSetting<T>(key: string, value: T): Promise<T> {
  if (sql) {
    await ensureSchema();
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}::jsonb, updated_at = now()
    `;
    return value;
  }
  await ensureFiles();
  const all = JSON.parse(await fs.readFile(SETTINGS_FILE, "utf8")) as Record<
    string,
    unknown
  >;
  all[key] = value;
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(all, null, 2), "utf8");
  return value;
}

/* ------------------- Iletisim / Atolye ozel ayar okuma/yazma ------------------- */
/**
 * Bu fonksiyonlar bilerek burada (store.ts, Node-only "fs" kullanan
 * dosyada) tutulur: DEFAULT_* sabitleri client bilesenlerinden de
 * kullanildigi icin lib/site.ts, lib/bouquet.ts, lib/flower-stories.ts
 * client-safe kalmali (fs/store'a bagimli olmamali).
 */

export async function getContactSettings(): Promise<ContactSettings> {
  const saved = await getSetting<Partial<ContactSettings>>("contact");
  return { ...DEFAULT_CONTACT, ...saved };
}

export async function setContactSettings(
  data: ContactSettings
): Promise<ContactSettings> {
  return setSetting("contact", data);
}

export async function getBouquetFlowers(): Promise<FlowerOption[]> {
  return (await getSetting<FlowerOption[]>("bouquet-flowers")) ?? DEFAULT_FLOWER_OPTIONS;
}

export async function setBouquetFlowers(
  flowers: FlowerOption[]
): Promise<FlowerOption[]> {
  return setSetting("bouquet-flowers", flowers);
}

export async function getFlowerStories(): Promise<FlowerStory[]> {
  return (
    (await getSetting<FlowerStory[]>("flower-stories")) ?? DEFAULT_FLOWER_STORIES
  );
}

export async function setFlowerStories(
  stories: FlowerStory[]
): Promise<FlowerStory[]> {
  return setSetting("flower-stories", stories);
}
