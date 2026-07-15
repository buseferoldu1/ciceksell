import { promises as fs } from "fs";
import path from "path";
import { CATALOG, MODELS_3D, type Product } from "./products";

// Basit dosya tabanli veri deposu (data/*.json). Yerel calisma icin
// tasarlandi; canliya cikista gercek bir veritabanina tasinmalidir.

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

async function ensureData() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PRODUCTS_FILE);
  } catch {
    const seed: Product[] = [...CATALOG.katalog, ...MODELS_3D];
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
  try {
    await fs.access(ORDERS_FILE);
  } catch {
    await fs.writeFile(ORDERS_FILE, "[]", "utf8");
  }
}

export async function getProducts(): Promise<Product[]> {
  await ensureData();
  const raw = await fs.readFile(PRODUCTS_FILE, "utf8");
  return JSON.parse(raw) as Product[];
}

async function saveProducts(list: Product[]) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function addProduct(
  data: Omit<Product, "id" | "category">
): Promise<Product> {
  const list = await getProducts();
  const product: Product = {
    ...data,
    id: `p${Date.now().toString(36)}`,
    category: "katalog",
  };
  list.push(product);
  await saveProducts(list);
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id" | "category">>
): Promise<Product | null> {
  const list = await getProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, id, category: "katalog" };
  await saveProducts(list);
  return list[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const list = await getProducts();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  await saveProducts(next);
  return true;
}

export async function getOrders(): Promise<Order[]> {
  await ensureData();
  const raw = await fs.readFile(ORDERS_FILE, "utf8");
  return JSON.parse(raw) as Order[];
}

export async function addOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const orders = await getOrders();
  const order: Order = {
    ...data,
    id: `CS-${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString(),
    status: "yeni",
  };
  orders.unshift(order);
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  return orders[idx];
}
