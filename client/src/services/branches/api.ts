import request from "../axios";
import {
  BranchResponse,
  BranchesApiResponse,
  BranchSyncRequest,
} from "./types";

export const branchesApi = {
  getBranches: async (
    params: BranchSyncRequest
  ): Promise<BranchesApiResponse> => {
    const searchParams = new URLSearchParams({
      pharmacy_id: params.pharmacy_id,
      ...(params.source && { source: params.source }),
    });

    const response = await request.get(`/branches?${searchParams}`);
    return response as unknown as BranchesApiResponse;
  },

  syncBranches: async (): Promise<BranchesApiResponse> => {
    const response = await request.post("kiotviet/sync-branches");
    return response as unknown as BranchesApiResponse;
  },

  syncBranch: async (
    branchId: string,
    params: BranchSyncRequest
  ): Promise<BranchResponse> => {
    const response = await request.post(`/branches/${branchId}/sync`, params);
    return response as unknown as BranchResponse;
  },

  getBranch: async (branchId: string): Promise<BranchResponse> => {
    const response = await request.get(`/branches/${branchId}`);
    return response as unknown as BranchResponse;
  },

  updateBranch: async (
    branchId: string,
    data: Partial<BranchResponse>
  ): Promise<BranchResponse> => {
    const response = await request.put(`/branches/${branchId}`, data);
    return response as unknown as BranchResponse;
  },

  // Delete a branch
  deleteBranch: async (branchId: string): Promise<{ success: boolean }> => {
    const response = await request.delete(`/branches/${branchId}`);
    return response as unknown as { success: boolean };
  },

  // Get branches statistics
  getBranchesStats: async (
    params: BranchSyncRequest
  ): Promise<{
    total: number;
    active: number;
    inactive: number;
    by_source: Record<string, number>;
  }> => {
    const searchParams = new URLSearchParams({
      pharmacy_id: params.pharmacy_id,
      ...(params.source && { source: params.source }),
    });

    const response = await request.get(`/branches/stats?${searchParams}`);
    return response as unknown as {
      total: number;
      active: number;
      inactive: number;
      by_source: Record<string, number>;
    };
  },
};
