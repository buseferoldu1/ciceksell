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

export type OrderStatus =
  | "yeni"
  | "hazirlaniyor"
  | "yolda"
  | "teslim-edildi"
  | "iptal";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: string;
    note?: string;
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
        model = ${patch.model === undefined ? null : patch.model}
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
      SELECT id, created_at, status, customer, items, subtotal, shipping, total
      FROM orders ORDER BY created_at DESC
    `) as OrderRow[];
    return rows.map(rowToOrder);
  }
  return readFileOrders();
}

export async function addOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const id = `CS-${Date.now().toString().slice(-8)}`;
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      INSERT INTO orders (id, status, customer, items, subtotal, shipping, total)
      VALUES (
        ${id}, 'yeni',
        ${JSON.stringify(data.customer)}::jsonb,
        ${JSON.stringify(data.items)}::jsonb,
        ${data.subtotal}, ${data.shipping}, ${data.total}
      )
      RETURNING id, created_at, status, customer, items, subtotal, shipping, total
    `) as OrderRow[];
    return rowToOrder(rows[0]);
  }
  const orders = await readFileOrders();
  const order: Order = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    status: "yeni",
  };
  orders.unshift(order);
  await writeFileOrders(orders);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      UPDATE orders SET status = ${status} WHERE id = ${id}
      RETURNING id, created_at, status, customer, items, subtotal, shipping, total
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
