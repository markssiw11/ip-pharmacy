import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { IProductQueryParams } from "./products.type";
import { ProductsApi } from "./products.api";

export function useProducts(params: IProductQueryParams = {}) {
  return useQuery({
    queryKey: ["/api/products", params],
    queryFn: async () => {
      return ProductsApi.getProducts(params);
    },
    // enabled: !!params.distributor_id,
  });
}

export const useInfiniteProducts = (query: IProductQueryParams) => {
  const LIMIT = 50;
  return useInfiniteQuery({
    queryKey: ["products-infinite", query],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await ProductsApi.getProducts({
        ...query,
        page: pageParam,
        limit: LIMIT,
      });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, page) => sum + (page?.data?.length || 0),
        0
      );
      const totalAvailable = lastPage?.total || 0;
      return totalFetched < totalAvailable ? allPages.length + 1 : undefined;
    },
    initialPageParam: query.page,
  });
};

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      return ProductsApi.getProductById(id);
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProductsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: any }) =>
      ProductsApi.updateProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProductsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useProductsSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const total = await ProductsApi.syncProducts();
      return {
        success: true,
        recordsCount: total,
        syncedAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}
