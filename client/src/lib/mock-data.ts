import { Order, Product, Inventory, SyncLog } from "@shared/schema";

export const mockOrders: Order[] = [
  {
    id: 1,
    orderId: "KV-001234",
    customerName: "Nguyen Van A",
    orderDate: new Date("2024-01-15"),
    total: "2500000",
    status: "completed",
    branch: "Ho Chi Minh",
    syncedAt: new Date(),
  },
  {
    id: 2,
    orderId: "KV-001235",
    customerName: "Tran Thi B",
    orderDate: new Date("2024-01-15"),
    total: "1200000",
    status: "processing",
    branch: "Ha Noi",
    syncedAt: new Date(),
  },
  {
    id: 3,
    orderId: "KV-001236",
    customerName: "Le Van C",
    orderDate: new Date("2024-01-14"),
    total: "850000",
    status: "shipped",
    branch: "Da Nang",
    syncedAt: new Date(),
  },
  {
    id: 4,
    orderId: "KV-001237",
    customerName: "Pham Thi D",
    orderDate: new Date("2024-01-14"),
    total: "3750000",
    status: "completed",
    branch: "Ho Chi Minh",
    syncedAt: new Date(),
  },
];

export const mockProducts: Product[] = [
  {
    id: 1,
    productId: "PRD-001",
    name: "iPhone 15 Pro Max",
    unit: "Unit",
    price: "32990000",
    isActive: true,
    syncedAt: new Date(),
  },
  {
    id: 2,
    productId: "PRD-002",
    name: "Samsung Galaxy S24",
    unit: "Unit",
    price: "22990000",
    isActive: true,
    syncedAt: new Date(),
  },
  {
    id: 3,
    productId: "PRD-003",
    name: "MacBook Pro 14\"",
    unit: "Unit",
    price: "55990000",
    isActive: false,
    syncedAt: new Date(),
  },
  {
    id: 4,
    productId: "PRD-004",
    name: "AirPods Pro 2",
    unit: "Unit",
    price: "6490000",
    isActive: true,
    syncedAt: new Date(),
  },
];

export const mockInventory: Inventory[] = [
  {
    id: 1,
    productId: "PRD-001",
    branch: "Ho Chi Minh",
    stockLevel: 25,
    syncedAt: new Date(),
  },
  {
    id: 2,
    productId: "PRD-002",
    branch: "Ha Noi",
    stockLevel: 5,
    syncedAt: new Date(),
  },
  {
    id: 3,
    productId: "PRD-003",
    branch: "Da Nang",
    stockLevel: 0,
    syncedAt: new Date(),
  },
  {
    id: 4,
    productId: "PRD-004",
    branch: "Ho Chi Minh",
    stockLevel: 150,
    syncedAt: new Date(),
  },
];

export const mockSyncLogs: SyncLog[] = [
  {
    id: 1,
    type: "orders",
    status: "success",
    recordsCount: 47,
    errorMessage: null,
    syncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    type: "inventory",
    status: "success",
    recordsCount: 1247,
    errorMessage: null,
    syncedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
];

export const branches = [
  { value: "hcm", label: "Ho Chi Minh" },
  { value: "hn", label: "Ha Noi" },
  { value: "dn", label: "Da Nang" },
];

export function getInventoryWithProducts(selectedBranch?: string) {
  return mockInventory
    .filter(inv => !selectedBranch || inv.branch.toLowerCase().includes(selectedBranch))
    .map(inv => {
      const product = mockProducts.find(p => p.productId === inv.productId);
      return {
        ...inv,
        product: product!,
      };
    });
}

export function getInventoryStats() {
  const totalProducts = mockProducts.length;
  const inStockCount = mockInventory.filter(inv => inv.stockLevel > 10).length;
  const lowStockCount = mockInventory.filter(inv => inv.stockLevel > 0 && inv.stockLevel <= 10).length;
  const outOfStockCount = mockInventory.filter(inv => inv.stockLevel === 0).length;

  return {
    totalProducts: 1247,
    inStockProducts: 1189,
    lowStockProducts: 42,
    outOfStockProducts: 16,
  };
}

export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(numAmount).replace('₫', '₫');
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}
