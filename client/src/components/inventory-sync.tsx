import { useMemo, useState } from "react";
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
import {
  useInventorySync,
  useInventoryStats,
  useSyncLogs,
} from "@/hooks/use-kiotviet-api";
import { formatCurrency, getRelativeTime, branches } from "@/lib/mock-data";
import { useInventory } from "@/services/inventory";
import { cn } from "@/lib/utils";

export function InventorySync() {
  const [conditions, setConditions] = useState({
    page: 1,
    limit: 10,
    status: undefined,
    purchase_date: undefined,
  });
  const { toast } = useToast();

  const { data: inventory, isLoading: inventoryLoading } =
    useInventory(conditions);
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: syncLogs } = useSyncLogs();
  const inventorySyncMutation = useInventorySync();

  const lastInventorySync = syncLogs?.find((log) => log.type === "inventory");

  const inventoryData = useMemo(() => {
    return (inventory?.data || []).map((item) => ({
      ...item,
      //convert something
    }));
  }, [inventory?.data]);

  console.log("Inventory Data:", inventoryData);

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
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    } else if (stockLevel <= 10) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const getProductStatus = (isActive: boolean) => {
    return isActive
      ? { label: "Active", color: "bg-green-100 text-green-800" }
      : { label: "Inactive", color: "bg-gray-100 text-gray-800" };
  };

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
                {lastInventorySync
                  ? getRelativeTime(new Date(lastInventorySync.syncedAt!))
                  : "Never"}
              </p>
            </div>
            <Button
              onClick={handleManualSync}
              disabled={inventorySyncMutation.isPending}
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
        {/* 
        <div className="mb-6">
          <label
            htmlFor="branch-filter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by Branch
          </label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.value} value={branch.value}>
                  {branch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

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
                          <Badge className={productStatus.color}>
                            {productStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
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
        </div>
      </CardContent>
    </Card>
  );
}
