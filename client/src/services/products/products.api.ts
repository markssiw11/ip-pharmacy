import request from "../axios";
import {
  IProduct,
  IProductQueryParams,
  IProductResponse,
} from "./products.type";

const getProducts = async (params: IProductQueryParams = {}) => {
  console.log("Fetching products with params:", params);
  const res: IResponse<IProductResponse> = await request.get("/products", {
    params,
  });
  console.log("Products fetched:", res.data);
  return res?.data;
};

const getProductById = async (id: string) => {
  const res: {
    data: IProduct;
  } = await request.get(`/products/${id}`);
  return res?.data;
};

const createProduct = async (productData: Partial<IProduct>) => {
  const res: {
    data: IProduct;
  } = await request.post("/products", productData);
  return res?.data;
};

const updateProduct = async (id: string, productData: Partial<IProduct>) => {
  const res: {
    data: IProduct;
  } = await request.put(`/products/${id}`, productData);
  return res?.data;
};

const deleteProduct = async (id: string) => {
  const res: {
    data: boolean;
  } = await request.delete(`/products/${id}`);
  return res?.data;
};

const syncProducts = async () => {
  const res: { data: number } = await request.post(
    "/pos-settings/sync-products"
  );
  console.log("Sync Products Response:", res);
  return res?.data || 0;
};

export const ProductsApi = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  syncProducts,
};
