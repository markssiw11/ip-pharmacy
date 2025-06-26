import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useInventorySync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const total = await InventoryApi.syncInventory();
      return {
        success: true,
        recordsCount: total,
        syncedAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
  });
}
