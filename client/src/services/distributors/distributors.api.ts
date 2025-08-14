import request from "../axios";
import {
  IDistributor,
  ICreateDistributorRequest,
  IUpdateDistributorRequest,
  IDistributorResponse,
  IDistributorFilters,
} from "./distributors.type";

const getDistributors = async (filters?: IDistributorFilters) => {
  const res: IResponse<IDistributorResponse> = await request.get(
    "v1/distributors",
    {
      params: {
        ...filters,
        limit: filters?.limit || 99,
      },
    }
  );
  return res.data?.data;
};

const getDistributorById = async (id: number) => {
  const res: IResponse<IDistributor> = await request.get(
    `v1/distributors/${id}`
  );
  return res.data;
};

const createDistributor = async (data: ICreateDistributorRequest) => {
  const res: IResponse<IDistributor> = await request.post(
    "v1/distributors",
    data
  );
  return res.data;
};

const updateDistributor = async (data: IUpdateDistributorRequest) => {
  const { id, ...updateData } = data;
  const res: IResponse<IDistributor> = await request.put(
    `v1/distributors/${id}`,
    updateData
  );
  return res.data;
};

const deleteDistributor = async (id: number) => {
  const res: IResponse<{ message: string }> = await request.delete(
    `v1/distributors/${id}`
  );
  return res.data;
};

const toggleDistributorStatus = async (id: number) => {
  const res: IResponse<IDistributor> = await request.patch(
    `v1/distributors/${id}/status`
  );
  return res.data;
};

const syncToKiotviet = async (id: string, retailerName: string) => {
  const res: IResponse<IDistributor> = await request.post(
    `v1/distributors/sync-to-kiotviet/${id}`,
    {
      retailer: retailerName,
    },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const DistributorsApi = {
  getDistributors,
  getDistributorById,
  createDistributor,
  updateDistributor,
  deleteDistributor,
  toggleDistributorStatus,
  syncToKiotviet,
};
