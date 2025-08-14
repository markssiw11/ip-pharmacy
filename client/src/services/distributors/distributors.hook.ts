import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DistributorsApi } from "./distributors.api";
import {
  ICreateDistributorRequest,
  IUpdateDistributorRequest,
  IDistributorFilters,
} from "./distributors.type";
import { useToast } from "@/hooks/use-toast";

// Query Keys
export const distributorsKeys = {
  all: ["distributors"] as const,
  lists: () => [...distributorsKeys.all, "list"] as const,
  list: (filters?: IDistributorFilters) =>
    [...distributorsKeys.lists(), filters] as const,
  details: () => [...distributorsKeys.all, "detail"] as const,
  detail: (id: number) => [...distributorsKeys.details(), id] as const,
};

// Hooks
export const useDistributors = (filters?: IDistributorFilters) => {
  return useQuery({
    queryKey: ["distributors", filters],
    queryFn: () => DistributorsApi.getDistributors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDistributor = (id: number) => {
  return useQuery({
    queryKey: distributorsKeys.detail(id),
    queryFn: () => DistributorsApi.getDistributorById(id),
    enabled: !!id,
  });
};

export const useCreateDistributor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ICreateDistributorRequest) =>
      DistributorsApi.createDistributor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distributorsKeys.all });
      toast({
        title: "Thành công",
        description: "Nhà phân phối đã được tạo thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo nhà phân phối",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDistributor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: IUpdateDistributorRequest) =>
      DistributorsApi.updateDistributor(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: distributorsKeys.all });
      queryClient.invalidateQueries({
        queryKey: distributorsKeys.detail(data.id),
      });
      toast({
        title: "Thành công",
        description: "Nhà phân phối đã được cập nhật thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi cập nhật nhà phân phối",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteDistributor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => DistributorsApi.deleteDistributor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distributorsKeys.all });
      toast({
        title: "Thành công",
        description: "Nhà phân phối đã được xóa thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi xóa nhà phân phối",
        variant: "destructive",
      });
    },
  });
};

export const useSyncDistributorToKiotviet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, retailerName }: { id: string; retailerName: string }) =>
      DistributorsApi.syncToKiotviet(id, retailerName),
    onSuccess: (data) => {
      // Invalidate and refetch the distributors list and the specific distributor
      queryClient.invalidateQueries({ queryKey: distributorsKeys.all });
      queryClient.invalidateQueries({
        queryKey: distributorsKeys.detail(Number(data.id)),
      });

      toast({
        title: "Thành công",
        description: "Đồng bộ nhà cung cấp lên KiotViet thành công",
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi đồng bộ lên KiotViet",
        variant: "destructive",
      });
      throw error;
    },
  });
};

export const useToggleDistributorStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => DistributorsApi.toggleDistributorStatus(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: distributorsKeys.all });
      queryClient.invalidateQueries({
        queryKey: distributorsKeys.detail(data.id),
      });
      toast({
        title: "Thành công",
        description: `Trạng thái nhà phân phối đã được ${
          data.status === "active" ? "kích hoạt" : "vô hiệu hóa"
        }`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error.message ||
          "Có lỗi xảy ra khi thay đổi trạng thái nhà phân phối",
        variant: "destructive",
      });
    },
  });
};
