import { Dispatch, SetStateAction } from "react";

export interface BranchResponse {
  id: string;
  external_id: string;
  name: string;
  address: string;
  contact_number: string;
  email: string | null;
  is_active: boolean;
  location_name: string | null;
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
  source: string;
  owner_type: string;
  last_sync_at: string;
  created_at: string;
  updated_at: string;
}

export interface BranchesApiResponse {
  statusCode: number;
  data: {
    status: string;
    total_branches: number;
    branches: BranchResponse[];
  };
}

export interface BranchSyncRequest {
  pharmacy_id: string;
  source?: string;
}

export interface Branch {
  id: string;
  external_id: string;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  status: "active" | "inactive" | "syncing";
  lastSync: string;
  source: string;
  isDefault?: boolean;
}

export interface BranchStats {
  total: number;
  active: number;
  inactive: number;
  syncing: number;
}

export interface UseBranchesOptions {
  pharmacyId: string;
  source?: string;
  autoLoad?: boolean;
}

export interface UseBranchesReturn {
  branches: Branch[];
  stats: BranchStats;
  error: string | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  loadBranches: () => Promise<void>;
  syncBranch: (branchId: string) => Promise<void>;
  syncAllBranches: () => Promise<void>;
  filterBranches: (searchTerm: string) => Branch[];
  setBranches: Dispatch<SetStateAction<Branch[]>>;
}
