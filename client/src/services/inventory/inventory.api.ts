import { is } from "drizzle-orm";
import request from "../axios";
import { IInventoryQueryParams, IPosProduct } from "./inventory.type";
import { stringToBoolean } from "@/lib/utils";

const getInventories = async (params: IInventoryQueryParams) => {
  const res: {
    data: {
      data: IPosProduct[];
      total: number;
    };
  } = await request.get("/products/kiotviet", {
    params,
  });
  return res?.data || [];
};

const syncInventory = async () => {
  const res: { data: number } = await request.post(
    "/pos-settings/sync-inventory"
  );
  console.log("Sync Orders Response:", res);
  return res?.data || 0;
};

export const InventoryApi = {
  syncInventory,
  getInventories,
};
