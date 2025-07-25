import request from "../axios";
import { IImportOrder, IImportOrderCreateRequest } from "./import-order.type";
import { IOrderData, IOrderQueryParams, IOrderResponse } from "./order.type";

const getOrders = async (params: IOrderQueryParams) => {
  const res: { data: IOrderResponse } = await request.get("/orders", {
    params,
  });
  return res?.data || [];
};

const syncOrders = async () => {
  const res: { data: number } = await request.post("/pos-settings/sync-orders");
  console.log("Sync Orders Response:", res);
  return res?.data || 0;
};

const getOrderById = async (id: string) => {
  const res: { data: IOrderData } = await request.get(`/orders/${id}`);
  console.log("Get Order By ID Response:", res);
  return res?.data || {};
};

const getImportOrders = async (params: IOrderQueryParams) => {
  const res: IResponse<{ data: IImportOrder[]; total: number }> =
    await request.get("/import-orders", {
      params,
    });
  return (
    res?.data || {
      data: [],
      total: 0,
    }
  );
};

const importOrder = async (data: IImportOrderCreateRequest) => {
  const res: { data: IImportOrder } = await request.post(
    "/import-orders",
    data
  );
  return res?.data;
};

export const OrderApi = {
  getOrders,
  syncOrders,
  getOrderById,
  getImportOrders,
  importOrder,
};
