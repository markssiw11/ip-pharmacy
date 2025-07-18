import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderApi } from "./order.api";
import { IOrderQueryParams } from "./order.type";
import { IImportOrderCreateRequest } from "./import-order.type";
import { toast } from "@/hooks/use-toast";

export const useOrders = (params: IOrderQueryParams) => {
  return useQuery({
    queryKey: ["orders", params],
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

export function useOrderById(id: string) {
  return useQuery({
    queryKey: ["/api/orders", id],
    queryFn: async () => {
      return OrderApi.getOrderById(id);
    },
    enabled: !!id && id.length > 0,
  });
}

export function useImportOrders(params: IOrderQueryParams) {
  return useQuery({
    queryKey: ["import-orders", params],
    queryFn: async () => {
      return OrderApi.getImportOrders(params);
    },
  });
}

export function mutateImportOrder({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IImportOrderCreateRequest) => {
      return OrderApi.importOrder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-orders"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi khi cập nhật trạng thái",
        description: error.message || "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    },
  });
}
