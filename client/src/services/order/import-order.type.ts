export interface IImportOrder {
  id: string;
  order_number: string;
  pharmacy_id: string;
  distributor_id: string;
  created_by: string;
  status: string;
  total_amount: number;
  notes: any;
  expected_delivery_date: any;
  actual_delivery_date: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  distributor: Distributor;
  createdBy: CreatedBy;
  items: Item[];
}

export interface Distributor {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  avatar: any;
  description: string;
  contact_person: string;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
}

export interface CreatedBy {
  id: string;
  email: string;
  name: string;
}

export interface Item {
  id: string;
  import_order_id: string;
  product_code: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  total_price: number;
  expiry_date: any;
  batch_number: any;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
}

/**
 * {
  "distributor_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "items": [
    {
      "product_code": "string",
      "product_name": "string",
      "quantity_ordered": 1,
      "unit_price": 0,
      "notes": "string"
    }
  ],
  "notes": "string",
  "expected_delivery_date": "2025-07-14T08:37:05.008Z"
}
 */
export interface IImportOrderCreateRequest {
  distributor_id: string;
  items: Array<{
    product_code: string;
    product_name: string;
    quantity_ordered: number;
    unit_price: number;
    notes?: string;
  }>;
  notes?: string;
  expected_delivery_date?: string;
}
