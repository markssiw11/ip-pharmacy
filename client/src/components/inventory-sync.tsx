import { useState } from "react";
import { RefreshCw, Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useInventory, useInventorySync, useInventoryStats, useSyncLogs } from "@/hooks/use-kiotviet-api";
import { formatCurrency, getRelativeTime, branches } from "@/lib/mock-data";

export function InventorySync() {
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const { toast } = useToast();
  
  const { data: inventory, isLoading: inventoryLoading } = useInventory(selectedBranch);
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: syncLogs } = useSyncLogs();
  const inventorySyncMutation = useInventorySync();

  const lastInventorySync = syncLogs?.find(log => log.type === "inventory");

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
            <h2 className="text-xl font-semibold text-gray-900">Inventory Synchronization</h2>
            <p className="text-sm text-gray-600 mt-1">
              Automatically syncs product lists and inventory levels by branch every 12 hours
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Last sync</p>
              <p className="text-sm font-medium text-gray-900">
                {lastInventorySync ? getRelativeTime(new Date(lastInventorySync.syncedAt!)) : "Never"}
              </p>
            </div>
            <Button
              onClick={handleManualSync}
              disabled={inventorySyncMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${inventorySyncMutation.isPending ? 'animate-spin' : ''}`} />
              {inventorySyncMutation.isPending ? "Syncing..." : "Manual Sync"}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700 mb-2">
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
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Product ID
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Product Name
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Unit
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Branch
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Stock Level
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Price
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : inventory?.map((item) => {
                const stockStatus = getStockStatus(item.stockLevel);
                const productStatus = getProductStatus(item.product.isActive);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-gray-900">
                      {item.product.productId}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {item.product.name}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.product.unit}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.branch}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">{item.stockLevel}</span>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatCurrency(item.product.price)}
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
