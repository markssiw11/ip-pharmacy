import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderApi } from "./order.api";
import { IOrderQueryParams } from "./order.type";
import { is } from "drizzle-orm";

export const useOrders = (params: IOrderQueryParams) => {
  return useQuery({
    queryKey: ["/api/orders", params],
    queryFn: async () => {
      return OrderApi.getOrders(params);
    },
  });
};

export function useOrderSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const total = await OrderApi.syncOrders();

      return {
        success: true,
        recordsCount: total,
        syncedAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}
