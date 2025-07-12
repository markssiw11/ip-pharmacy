// Mock purchase order data
export interface MockSupplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface MockPurchaseOrderItem {
  id: number;
  productId: string;
  supplierProductName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  supplierProductId?: string;
  kiotVietProductId?: string;
}

export interface MockPurchaseOrder {
  id: number;
  supplierId: number;
  supplierName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: string;
  totalAmount: string;
  notes?: string;
  items: MockPurchaseOrderItem[];
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock suppliers data
export const mockSuppliers: MockSupplier[] = [
  {
    id: 1,
    name: "Công ty TNHH Dược phẩm ABC",
    contactPerson: "Nguyễn Văn A",
    phone: "0123456789",
    email: "contact@abc-pharma.com",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  },
  {
    id: 2,
    name: "Công ty CP Dược Phẩm XYZ",
    contactPerson: "Trần Thị B",
    phone: "0987654321",
    email: "info@xyz-pharma.com",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
  },
  {
    id: 3,
    name: "Nhà phân phối thuốc DEF",
    contactPerson: "Lê Văn C",
    phone: "0369852147",
    email: "sales@def-pharma.com",
    address: "789 Đường DEF, Quận 5, TP.HCM",
  },
];

// Mock purchase orders data
let mockPurchaseOrders: MockPurchaseOrder[] = [
  {
    id: 1,
    supplierId: 1,
    supplierName: "Công ty TNHH Dược phẩm ABC",
    orderDate: new Date("2024-12-20"),
    deliveryDate: new Date("2024-12-25"),
    status: "Đã tạo",
    totalAmount: "2500000",
    notes: "Đơn hàng khẩn cấp cho thuốc cảm cúm",
    items: [
      {
        id: 1,
        productId: "PARACETAMOL_500",
        supplierProductName: "Paracetamol 500mg",
        quantity: 100,
        unitPrice: "15000",
        totalPrice: "1500000",
        supplierProductId: "ABC_PARA_500",
        kiotVietProductId: "KV_PARA_500",
      },
      {
        id: 2,
        productId: "AMOXICILLIN_250",
        supplierProductName: "Amoxicillin 250mg",
        quantity: 50,
        unitPrice: "20000",
        totalPrice: "1000000",
        supplierProductId: "ABC_AMOX_250",
        kiotVietProductId: "KV_AMOX_250",
      },
    ],
    createdBy: 1,
    createdAt: new Date("2024-12-20T09:00:00"),
    updatedAt: new Date("2024-12-20T09:00:00"),
  },
  {
    id: 2,
    supplierId: 2,
    supplierName: "Công ty CP Dược Phẩm XYZ",
    orderDate: new Date("2024-12-21"),
    deliveryDate: new Date("2024-12-28"),
    status: "Đang xử lý",
    totalAmount: "1800000",
    notes: "Đơn hàng thuốc tim mạch",
    items: [
      {
        id: 3,
        productId: "ASPIRIN_100",
        supplierProductName: "Aspirin 100mg",
        quantity: 200,
        unitPrice: "8000",
        totalPrice: "1600000",
        supplierProductId: "XYZ_ASP_100",
        kiotVietProductId: "KV_ASP_100",
      },
      {
        id: 4,
        productId: "ATORVASTATIN_20",
        supplierProductName: "Atorvastatin 20mg",
        quantity: 10,
        unitPrice: "20000",
        totalPrice: "200000",
        supplierProductId: "XYZ_ATOR_20",
        kiotVietProductId: "KV_ATOR_20",
      },
    ],
    createdBy: 2,
    createdAt: new Date("2024-12-21T10:30:00"),
    updatedAt: new Date("2024-12-21T14:15:00"),
  },
];

let nextOrderId = 3;
let nextItemId = 5;

// Mock API functions
export function getMockSuppliers(): MockSupplier[] {
  return mockSuppliers;
}

export function getMockPurchaseOrders(): MockPurchaseOrder[] {
  return [...mockPurchaseOrders].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function createMockPurchaseOrder(orderData: {
  supplierId: number;
  orderDate: Date;
  deliveryDate: Date;
  totalAmount: string;
  notes?: string;
  items: Array<{
    productId: string;
    supplierProductName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    supplierProductId?: string;
    kiotVietProductId?: string;
  }>;
  createdBy: number;
}): MockPurchaseOrder {
  const supplier = mockSuppliers.find((s) => s.id === orderData.supplierId);
  if (!supplier) {
    throw new Error("Supplier not found");
  }

  const newOrder: MockPurchaseOrder = {
    id: nextOrderId++,
    supplierId: orderData.supplierId,
    supplierName: supplier.name,
    orderDate: orderData.orderDate,
    deliveryDate: orderData.deliveryDate,
    status: "Đã tạo",
    totalAmount: orderData.totalAmount,
    notes: orderData.notes,
    items: orderData.items.map((item) => ({
      id: nextItemId++,
      ...item,
    })),
    createdBy: orderData.createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockPurchaseOrders.push(newOrder);
  return newOrder;
}

export function updateMockPurchaseOrderStatus(
  orderId: number,
  status: string
): MockPurchaseOrder | null {
  const order = mockPurchaseOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date();
    return order;
  }
  return null;
}

export function getMockPurchaseOrder(
  orderId: number
): MockPurchaseOrder | null {
  return mockPurchaseOrders.find((o) => o.id === orderId) || null;
}
