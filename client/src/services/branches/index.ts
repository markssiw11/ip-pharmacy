// Export types
export type {
  BranchResponse,
  BranchesApiResponse,
  BranchSyncRequest,
  Branch,
  BranchStats,
  UseBranchesOptions,
  UseBranchesReturn,
} from "./types";

// Export API functions
export { branchesApi } from "./api";

// Export hooks
export { useBranches, branchesQueryKeys } from "./hooks";
export {
  useBranch,
  useBranchesStats,
  useUpdateBranch,
  useDeleteBranch,
  usePrefetchBranch,
  useInvalidateBranches,
} from "./queries";

// Re-export for backward compatibility
export * from "./api";
export * from "./types";
export * from "./hooks";
export * from "./queries";
