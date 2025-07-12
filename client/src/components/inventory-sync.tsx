import { useCallback, useMemo, useState } from "react";
import {
  RefreshCw,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useInventoryStats, useSyncLogs } from "@/hooks/use-kiotviet-api";
import { formatCurrency, getRelativeTime, branches } from "@/lib/mock-data";
import {
  IInventoryQueryParams,
  useInventory,
  useInventorySync,
} from "@/services/inventory";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Input } from "./ui/input";
import debounce from "lodash.debounce";
import { useApiConfig } from "@/services/connect";

export function InventorySync() {
  const [conditions, setConditions] = useState<IInventoryQueryParams>({
    page: 1,
    limit: 10,
    status: undefined,
    purchase_date: undefined,
    search: "",
    is_active: undefined,
  });
  const { toast } = useToast();

  const { data: inventory, isLoading: inventoryLoading } =
    useInventory(conditions);
  const inventorySyncMutation = useInventorySync();
  const { data: config } = useApiConfig();

  const inventoryData = useMemo(() => {
    return (inventory?.data || []).map((item) => ({
      ...item,
      //convert something
    }));
  }, [inventory?.data]);

  console.log("Inventory Data:", inventoryData);

  const total = useMemo(() => {
    return inventory?.total || 0;
  }, [inventory?.total]);

  const isDisabled = useMemo(() => {
    return (
      !config?.connection ||
      inventorySyncMutation.isPending ||
      !config?.is_active
    );
  }, [inventorySyncMutation?.isPending, config?.connection, config?.is_active]);

  const handleManualSync = async () => {
    try {
      await inventorySyncMutation.mutateAsync();
      toast({
        title: "Success",
        description: "Inventory synchronized successfully!",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize inventory",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (stockLevel: number) => {
    if (stockLevel === 0) {
      return { label: "Hết hàng", color: "bg-red-100 text-red-800" };
    } else if (stockLevel <= 10) {
      return { label: "Còn ít", color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "Còn hàng", color: "bg-green-100 text-green-800" };
  };

  const getProductStatus = (isActive: boolean) => {
    return isActive
      ? { label: "Hoạt động", color: "bg-green-100 text-green-800" }
      : { label: "Ngưng hoạt động", color: "bg-gray-100 text-gray-800" };
  };

  const totalPages = Math.ceil(total / conditions.limit);

  const onSearchDebounce = useCallback(
    debounce(
      (search?: string) =>
        setConditions((prev) => ({ ...prev, search: search || "" })),
      300
    ),
    []
  );

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Đồng Bộ Kho</h2>
            <p className="text-sm text-gray-600 mt-1">
              Kho sẽ tự động cập nhật sau 12 giờ
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Lần cuối cập nhật</p>
              <p className="text-sm font-medium text-gray-900">
                {inventoryData.length > 0
                  ? getRelativeTime(new Date(inventoryData[0]?.created_at))
                  : "Never"}
              </p>
            </div>
            <Button
              onClick={handleManualSync}
              disabled={isDisabled}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  inventorySyncMutation.isPending ? "animate-spin" : ""
                }`}
              />
              {inventorySyncMutation.isPending
                ? "Đang đồng bộ..."
                : "Đồng Bộ Thủ Công"}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <Input
            className=" w-[300px]"
            placeholder="Nhập mã hàng, tên hàng"
            inputMode="text"
            onChange={(e) => onSearchDebounce(e.target.value)}
          />
          <Select
            value={
              conditions.is_active === undefined
                ? "all"
                : String(conditions.is_active)
            }
            onValueChange={(value) => {
              setConditions((prev) => ({
                ...prev,
                is_active: value === "all" ? undefined : value === "true",
              }));
            }}
          >
            <SelectTrigger className="w-[160px] ml-4">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Hoạt động</SelectItem>
              <SelectItem value="false">Ngưng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Mã Sản Phẩm
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Tên Sản Phẩm
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Chi nhánh
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Nhóm hàng
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Tồn kho
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Giá
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Trạng Thái
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                : inventoryData?.map((item) => {
                    const inventory = (item.inventories || [])[0];
                    const stockLevel = inventory?.on_hand || 0;

                    const stockStatus = getStockStatus(stockLevel);
                    const productStatus = getProductStatus(
                      item?.is_active || false
                    );

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-gray-900">
                          {item.code}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {inventory?.branch_name}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {item?.category_name}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2">{stockLevel}</span>
                            <Badge
                              className={cn(stockStatus.color, " text-[8px]")}
                            >
                              {stockStatus.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {formatCurrency(item.base_price || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(productStatus.color, " text-[8px]")}
                          >
                            {productStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-blue-600">Total Products</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-800">
                      {stats?.totalProducts.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-green-600">In Stock</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-green-800">
                      {stats?.inStockProducts.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-yellow-600">Low Stock</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-yellow-800">
                      {stats?.lowStockProducts.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-red-600">Out of Stock</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-red-800">
                      {stats?.outOfStockProducts.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            <span className="font-medium">
              {conditions.page * inventoryData.length - inventoryData.length}
            </span>{" "}
            đến{" "}
            <span className="font-medium">
              {conditions.page * inventoryData.length}
            </span>{" "}
            của <span className="font-medium">{total}</span> kết quả
          </div>
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setConditions((prev) => ({
                      ...prev,
                      page: Math.max(prev.page - 1, 1),
                    }))
                  }
                  isActive={conditions.page <= 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={index + 1 === conditions.page}
                    onClick={() =>
                      setConditions((prev) => ({
                        ...prev,
                        page: index + 1,
                      }))
                    }
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setConditions((prev) => ({
                      ...prev,
                      page: Math.min(prev.page + 1, totalPages),
                    }))
                  }
                  isActive={conditions.page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
