export interface IInventory {
  product_id: number;
  product_code: string;
  product_name: string;
  branch_id: number;
  branch_name: string;
  cost: number;
  on_hand: number;
  reserved: number;
  actual_reserved: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  on_order: number;
}

export interface IPosProduct {
  id: string;
  created_date: string; // ISO date string
  relative_id: number;
  retailer_id: number;
  code: string;
  name: string;
  full_name: string;
  category_id: number;
  category_name: string;
  allows_sale: boolean;
  type: number;
  has_variants: boolean;
  base_price: number;
  conversion_value: number;
  is_active: boolean;
  productInventories: IInventory[];
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // ISO date string or null
  inventory_summary: {
    total_on_hand: number;
    total_reserved: number;
    total_available: number;
    warehouses_count: number;
    cost: number;
  };
}

export interface IInventoryQueryParams {
  page: number;
  limit: number;
  status?: number;
  purchase_date?: string;
  end_date?: string;
  search?: string;
  is_active?: boolean;
}
