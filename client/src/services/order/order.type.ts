export interface IOrderDetail {
  product_id: number;
  product_code: string;
  product_name: string;
  category_id: number;
  category_name: string;
  quantity: number;
  price: number;
  discount: number;
  sub_total: number;
  return_quantity: number;
}

export interface IOrderData {
  id: string;
  code: string;
  pos_id: number;
  purchase_date: string;
  branch_id: number;
  branch_name: string;
  sold_by_id: number;
  sold_by_name: string;
  customer_id: number;
  customer_code: string;
  customer_name: string;
  order_code: string | null;
  total: number;
  total_payment: number;
  status: number;
  status_value: string;
  using_cod: boolean;
  created_date: string;
  invoice_details: IOrderDetail[];
  pos: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface IOrderResponse {
  data: IOrderData[];
  total: number;
  page: number;
  limit: number;
}

export interface IOrderQueryParams {
  page?: number;
  limit?: number;
  status?: number;
  purchase_date?: string;
  end_date?: string;
  search?: string;
}
