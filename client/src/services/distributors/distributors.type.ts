export interface IDistributor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  is_synced: boolean;
  external_id?: string;
  tax_code?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  status: "active" | "inactive";
  description?: string;
  created_at: string;
  updated_at: string;
  synced_at?: string;
  deleted_at?: string;
  avatar?: string;
}

export interface ICreateDistributorRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_code?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
}

export interface IUpdateDistributorRequest
  extends Partial<ICreateDistributorRequest> {
  id: number;
  status?: "active" | "inactive";
}

export interface IDistributorResponse {
  data: IDistributor[];
  total: number;
  page: number;
  limit: number;
}

export interface IDistributorFilters {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}
