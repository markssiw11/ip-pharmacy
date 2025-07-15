export interface IProductInventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  on_hand: number;
  reserved: number;
  cost: number;
  actual_reserved: number;
  min_quantity: number;
  max_quantity: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // ISO date string or null
}

export interface IInventorySummary {
  totalOnHand: number;
  totalReserved: number;
  averageCost: number;
  availableStock: number;
  warehouseCount: number;
}

export interface IProduct {
  id: string;
  created_date: string; // ISO date string
  relative_id: string | null;
  retailer_id: string | null;
  code: string;
  name: string;
  full_name: string;
  category_id: string;
  category_name: string;
  allows_sale: boolean;
  type: string;
  has_variants: boolean;
  base_price: number;
  conversion_value: number;
  is_active: boolean;
  distributor_id: string;
  external_id: string;
  source: string;
  last_sync_at: string; // ISO date string
  description: string | null;
  barcode: string | null;
  unit: string;
  weight: number | null;
  manufacturer: string | null;
  country_of_origin: string | null;
  expiry_months: number | null;
  min_stock_level: number;
  max_stock_level: number | null;
  inventories: any[]; // Empty array in the provided data
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // ISO date string or null
  productInventories: IProductInventory[];
  inventorySummary: IInventorySummary;
}

export interface IProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  is_active?: boolean;
  distributor_id?: string;
  allows_sale?: boolean;
}

export interface IProductResponse {
  data: IProduct[];
  total: number;
}
