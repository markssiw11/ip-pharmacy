import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { branchesApi } from "./api";
import {
  Branch,
  BranchResponse,
  BranchStats,
  UseBranchesOptions,
  UseBranchesReturn,
} from "./types";

export const branchesQueryKeys = {
  all: ["branches"] as const,
  lists: () => [...branchesQueryKeys.all, "list"] as const,
  list: (pharmacyId: string, source?: string) =>
    [...branchesQueryKeys.lists(), { pharmacyId, source }] as const,
  detail: (id: string) => [...branchesQueryKeys.all, "detail", id] as const,
  stats: (pharmacyId: string, source?: string) =>
    [...branchesQueryKeys.all, "stats", { pharmacyId, source }] as const,
};

const transformBranchResponse = (apiResponse: BranchResponse): Branch => ({
  id: apiResponse.id,
  external_id: apiResponse.external_id,
  name: apiResponse.name,
  address: apiResponse.address || "Chưa có địa chỉ",
  phone: apiResponse.contact_number || "Chưa có số điện thoại",
  email: apiResponse.email,
  status: apiResponse.is_active ? "active" : "inactive",
  lastSync: apiResponse.last_sync_at,
  source: apiResponse.source,
  isDefault: apiResponse.external_id === "1000005382", // Assuming main branch has this ID
});

export function useBranches({
  pharmacyId,
  source = "KIOTVIET",
  autoLoad = true,
}: UseBranchesOptions): UseBranchesReturn {
  const [syncingBranches, setSyncingBranches] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: branchesData,
    isLoading: isInitialLoading,
    error: queryError,
    refetch: loadBranches,
  } = useQuery({
    queryKey: branchesQueryKeys.list(pharmacyId, source),
    queryFn: async (): Promise<Branch[]> => {
      const response = await branchesApi.getBranches({
        pharmacy_id: pharmacyId,
        source,
      });

      if (response.data.status === "success") {
        return response.data.branches.map(transformBranchResponse);
      } else {
        throw new Error("API returned unsuccessful status");
      }
    },
    enabled: autoLoad && !!pharmacyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (queryError) {
      console.error("Error loading branches:", queryError);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách chi nhánh. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [queryError, toast]);

  const syncBranchMutation = useMutation({
    mutationFn: async (branchId: string) => {
      return branchesApi.syncBranch(branchId, {
        pharmacy_id: pharmacyId,
        source,
      });
    },
    onMutate: async (branchId: string) => {
      setSyncingBranches((prev) => new Set(prev).add(branchId));

      await queryClient.cancelQueries({
        queryKey: branchesQueryKeys.list(pharmacyId, source),
      });

      const previousBranches = queryClient.getQueryData(
        branchesQueryKeys.list(pharmacyId, source)
      );

      queryClient.setQueryData(
        branchesQueryKeys.list(pharmacyId, source),
        (old: Branch[] | undefined) => {
          if (!old) return old;
          return old.map((branch) =>
            branch.id === branchId
              ? { ...branch, status: "syncing" as const }
              : branch
          );
        }
      );

      return { previousBranches };
    },
    onSuccess: () => {
      toast({
        title: "Đồng bộ thành công",
        description: "Chi nhánh đã được đồng bộ thành công.",
      });
      queryClient.invalidateQueries({
        queryKey: branchesQueryKeys.list(pharmacyId, source),
      });
    },
    onError: (error: Error, branchId: string, context: any) => {
      console.error("Error syncing branch:", error);
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể đồng bộ chi nhánh. Vui lòng thử lại.",
        variant: "destructive",
      });

      if (context?.previousBranches) {
        queryClient.setQueryData(
          branchesQueryKeys.list(pharmacyId, source),
          context.previousBranches
        );
      }
    },
    onSettled: (data: any, error: Error | null, branchId: string) => {
      setSyncingBranches((prev) => {
        const newSet = new Set(prev);
        newSet.delete(branchId);
        return newSet;
      });
    },
  });

  const syncAllBranchesMutation = useMutation({
    mutationFn: async () => {
      return branchesApi.syncBranches();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: branchesQueryKeys.list(pharmacyId, source),
      });

      const previousBranches = queryClient.getQueryData(
        branchesQueryKeys.list(pharmacyId, source)
      );

      queryClient.setQueryData(
        branchesQueryKeys.list(pharmacyId, source),
        (old: Branch[] | undefined) => {
          if (!old) return old;
          return old.map((branch) => ({
            ...branch,
            status: "syncing" as const,
          }));
        }
      );

      return { previousBranches };
    },
    onSuccess: () => {
      toast({
        title: "Đồng bộ thành công",
        description: "Tất cả chi nhánh đã được đồng bộ thành công.",
      });
      queryClient.invalidateQueries({
        queryKey: branchesQueryKeys.list(pharmacyId, source),
      });
    },
    onError: (error: Error, variables: any, context: any) => {
      console.error("Error syncing all branches:", error);
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể đồng bộ tất cả chi nhánh. Vui lòng thử lại.",
        variant: "destructive",
      });

      if (context?.previousBranches) {
        queryClient.setQueryData(
          branchesQueryKeys.list(pharmacyId, source),
          context.previousBranches
        );
      }
    },
  });

  const branches: Branch[] = ((branchesData as Branch[]) || []).map(
    (branch) => ({
      ...branch,
      status: syncingBranches.has(branch.id) ? "syncing" : branch.status,
    })
  );

  const filterBranches = (searchTerm: string): Branch[] => {
    if (!searchTerm.trim()) return branches;

    const term = searchTerm.toLowerCase();
    return branches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(term) ||
        branch.address.toLowerCase().includes(term) ||
        branch.phone.toLowerCase().includes(term)
    );
  };

  const getStats = (): BranchStats => ({
    total: branches.length,
    active: branches.filter((b) => b.status === "active").length,
    inactive: branches.filter((b) => b.status === "inactive").length,
    syncing: branches.filter((b) => b.status === "syncing").length,
  });

  const syncBranch = async (branchId: string): Promise<void> => {
    await syncBranchMutation.mutateAsync(branchId);
  };

  const syncAllBranches = async (): Promise<void> => {
    await syncAllBranchesMutation.mutateAsync(undefined);
  };

  const manualLoadBranches = async (): Promise<void> => {
    await loadBranches();
  };

  return {
    branches,
    stats: getStats(),
    error: queryError ? "Có lỗi xảy ra khi tải dữ liệu" : null,

    isLoading: syncAllBranchesMutation.isPending,
    isInitialLoading,

    loadBranches: manualLoadBranches,
    syncBranch,
    syncAllBranches,
    filterBranches,

    setBranches: () => {
      console.warn(
        "setBranches is not available when using React Query. Use mutations instead."
      );
    },
  };
}
