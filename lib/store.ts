import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { CATALOG, MODELS_3D, type Product } from "./products";

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
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
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
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // Ilk kurulumda katalogu tohumla
      const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM products`) as {
        count: number;
      }[];
      if (count === 0) {
        for (const p of seedProducts()) {
          await sql`
            INSERT INTO products (id, name, tag, price, image, model)
            VALUES (${p.id}, ${p.name}, ${p.tag}, ${p.price}, ${p.image}, ${p.model ?? null})
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
};

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    tag: r.tag,
    price: r.price,
    image: r.image,
    category: "katalog",
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
      SELECT id, name, tag, price, image, model FROM products ORDER BY seq ASC
    `) as ProductRow[];
    return rows.map(rowToProduct);
  }
  return readFileProducts();
}

export async function addProduct(
  data: Omit<Product, "id" | "category">
): Promise<Product> {
  const id = `p${Date.now().toString(36)}`;
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      INSERT INTO products (id, name, tag, price, image, model)
      VALUES (${id}, ${data.name}, ${data.tag}, ${data.price}, ${data.image}, ${data.model ?? null})
      RETURNING id, name, tag, price, image, model
    `) as ProductRow[];
    return rowToProduct(rows[0]);
  }
  const list = await readFileProducts();
  const product: Product = { ...data, id, category: "katalog" };
  list.push(product);
  await writeFileProducts(list);
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id" | "category">>
): Promise<Product | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      UPDATE products SET
        name  = COALESCE(${patch.name ?? null}, name),
        tag   = COALESCE(${patch.tag ?? null}, tag),
        price = COALESCE(${patch.price ?? null}, price),
        image = COALESCE(${patch.image ?? null}, image),
        -- model YALNIZCA acikca gonderildiyse degistirilir. Onceden
        -- gonderilmediginde NULL yaziliyordu: adini/fiyatini duzenledigin
        -- her 3D urun modelini kaybediyordu.
        model = CASE WHEN ${"model" in patch} THEN ${patch.model ?? null} ELSE model END
      WHERE id = ${id}
      RETURNING id, name, tag, price, image, model
    `) as ProductRow[];
    return rows[0] ? rowToProduct(rows[0]) : null;
  }
  const list = await readFileProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, id, category: "katalog" };
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
    total: r.total,
  };
}

export async function getOrders(): Promise<Order[]> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, created_at, status, payment_status, payment_method, payment_id,
             customer, items, subtotal, shipping, total
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
             customer, items, subtotal, shipping, total
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
      INSERT INTO orders (id, status, payment_status, payment_method, customer, items, subtotal, shipping, total)
      VALUES (
        ${id}, 'yeni', ${paymentStatus}, ${paymentMethod},
        ${JSON.stringify(data.customer)}::jsonb,
        ${JSON.stringify(data.items)}::jsonb,
        ${data.subtotal}, ${data.shipping}, ${data.total}
      )
      RETURNING id, created_at, status, payment_status, payment_method, payment_id,
                customer, items, subtotal, shipping, total
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
                customer, items, subtotal, shipping, total
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
                customer, items, subtotal, shipping, total
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
