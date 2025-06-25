import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useOrders, useOrderSync, useSyncLogs } from "@/hooks/use-kiotviet-api";
import { formatCurrency, formatDate, getRelativeTime } from "@/lib/mock-data";

export function OrderSync() {
  const { toast } = useToast();
  
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: syncLogs } = useSyncLogs();
  const orderSyncMutation = useOrderSync();

  const lastOrderSync = syncLogs?.find(log => log.type === "orders");

  const handleManualSync = async () => {
    try {
      await orderSyncMutation.mutateAsync();
      toast({
        title: "Success",
        description: "Orders synchronized successfully!",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize orders",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order Synchronization</h2>
            <p className="text-sm text-gray-600 mt-1">
              Automatically syncs orders from KiotViet every 12 hours
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Last sync</p>
              <p className="text-sm font-medium text-gray-900">
                {lastOrderSync ? getRelativeTime(new Date(lastOrderSync.syncedAt!)) : "Never"}
              </p>
            </div>
            <Button
              onClick={handleManualSync}
              disabled={orderSyncMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${orderSyncMutation.isPending ? 'animate-spin' : ''}`} />
              {orderSyncMutation.isPending ? "Syncing..." : "Manual Sync"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Order ID
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Date
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Total
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Status
                </TableHead>
                <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                  Branch
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-gray-900">
                    #{order.orderId}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(new Date(order.orderDate))}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {order.branch}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{orders?.length || 0}</span> of{" "}
            <span className="font-medium">47</span> results
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
