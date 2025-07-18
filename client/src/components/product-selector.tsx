import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { IProduct, useProducts } from "@/services";
import { Minus, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ProductSelectorProps {
  supplierId?: string;
  selectedProducts: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    code: string;
  }>;
  onProductsChange: (
    products: Array<{
      id: string;
      name: string;
      price: string;
      quantity: number;
      code: string;
    }>
  ) => void;
}

export function ProductSelector({
  supplierId,
  selectedProducts,
  onProductsChange,
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [offset, setOffset] = useState(0);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const limit = 50;
  const {
    data: products,
    isLoading,
    isFetching,
  } = useProducts({
    limit,
    page: Math.floor(offset / limit) + 1,
    distributor_id: supplierId,
    search: debouncedSearchTerm,
  });
  useEffect(() => {
    const productData = products?.data || [];
    if (offset === 0) {
      setAllProducts(productData);
      setHasMore(productData?.length < (products?.total || 0));
    } else {
      setAllProducts((prev) => [...prev, ...(productData || [])]);
      setHasMore(productData?.length < (products?.total || 0));
    }
  }, [products, offset, debouncedSearchTerm, searchTerm, supplierId]);

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
  }, [supplierId]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseInt(amount));
  };

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  const handleProductToggle = (product: IProduct) => {
    const isSelected = isProductSelected(product.id);

    if (isSelected) {
      onProductsChange(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      onProductsChange([
        ...selectedProducts,
        {
          id: product.id,
          name: product.name,
          price: product.base_price?.toString() || "0",
          quantity: 1,
          code: product.code || "",
        },
      ]);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) return;

    onProductsChange(
      selectedProducts.map((p) => (p.id === productId ? { ...p, quantity } : p))
    );
  };

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setOffset((prev) => prev + limit);
    }
  };

  const totalValue = useMemo(() => {
    return selectedProducts.reduce((sum, product) => {
      return sum + parseInt(product.price) * product.quantity;
    }, 0);
  }, [selectedProducts]);

  if (!supplierId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Vui lòng chọn nhà cung cấp trước để xem danh sách sản phẩm
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product List */}
      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        {isLoading && offset === 0 ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {allProducts.map((product) => {
              const selectedProduct = selectedProducts.find(
                (p) => p.id?.toString() === product.id?.toString()
              );
              const isSelected = !!selectedProduct;

              return (
                <div
                  key={product.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleProductToggle(product)}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Mã: {product.code} | Kho:{" "}
                          {product.inventorySummary?.totalOnHand} sản phẩm
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.base_price?.toString() || "0")}
                      </p>
                      {isSelected && (
                        <div className="flex items-center mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                selectedProduct.quantity - 1
                              )
                            }
                            disabled={selectedProduct.quantity <= 1}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 min-w-[2rem] text-center text-sm">
                            {selectedProduct.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                selectedProduct.quantity + 1
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isFetching && offset > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              </div>
            )}

            {hasMore && !isFetching && (
              <div className="p-4 text-center border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Tải thêm sản phẩm...
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Sản phẩm đã chọn</h4>
          <div className="space-y-2 mb-3">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">{product.name}</span>
                <span className="font-medium">
                  {product.quantity} x {formatCurrency(product.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng số sản phẩm:</span>
            <span className="font-medium">
              {selectedProducts.length} sản phẩm
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng giá trị:</span>
            <span className="font-bold text-lg text-blue-600">
              {formatCurrency(totalValue.toString())}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
