import { useQuery } from "@tanstack/react-query";
import { IInventoryQueryParams } from "./inventory.type";
import { InventoryApi } from "./inventory.api";

export function useInventory(params: IInventoryQueryParams) {
  return useQuery({
    queryKey: ["/api/inventory", params],
    queryFn: async () => {
      return InventoryApi.getInventories(params);
    },
  });
}
