import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { branchesApi } from "./api";
import { branchesQueryKeys } from "./hooks";
import { BranchResponse } from "./types";

// Hook for getting a single branch
export function useBranch(branchId: string) {
  return useQuery({
    queryKey: branchesQueryKeys.detail(branchId),
    queryFn: () => branchesApi.getBranch(branchId),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting branch statistics
export function useBranchesStats(pharmacyId: string, source = "KIOTVIET") {
  return useQuery({
    queryKey: branchesQueryKeys.stats(pharmacyId, source),
    queryFn: () =>
      branchesApi.getBranchesStats({ pharmacy_id: pharmacyId, source }),
    enabled: !!pharmacyId,
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    gcTime: 5 * 60 * 1000,
  });
}

// Hook for updating branch data
export function useUpdateBranch() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      data,
    }: {
      branchId: string;
      data: Partial<BranchResponse>;
    }) => branchesApi.updateBranch(branchId, data),
    onSuccess: (updatedBranch) => {
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin chi nhánh đã được cập nhật.",
      });

      // Update the single branch cache
      queryClient.setQueryData(
        branchesQueryKeys.detail(updatedBranch.id),
        updatedBranch
      );

      // Invalidate all branch lists to refresh them
      queryClient.invalidateQueries({
        queryKey: branchesQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error updating branch:", error);
      toast({
        title: "Lỗi cập nhật",
        description:
          "Không thể cập nhật thông tin chi nhánh. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });
}

// Hook for deleting a branch
export function useDeleteBranch() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: branchesApi.deleteBranch,
    onSuccess: (data, branchId) => {
      toast({
        title: "Xóa thành công",
        description: "Chi nhánh đã được xóa.",
      });

      // Remove from single branch cache
      queryClient.removeQueries({
        queryKey: branchesQueryKeys.detail(branchId),
      });

      // Invalidate all branch lists to refresh them
      queryClient.invalidateQueries({
        queryKey: branchesQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error deleting branch:", error);
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa chi nhánh. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });
}

// Hook for prefetching branch data
export function usePrefetchBranch() {
  const queryClient = useQueryClient();

  return (branchId: string) => {
    queryClient.prefetchQuery({
      queryKey: branchesQueryKeys.detail(branchId),
      queryFn: () => branchesApi.getBranch(branchId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// Hook for invalidating all branch queries
export function useInvalidateBranches() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: branchesQueryKeys.all,
    });
  };
}
