import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, getRelativeTime } from "@/lib/mock-data";
import { useOrders, useOrderSync } from "@/services/order";
import { useMemo, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export function OrderSync() {
  const { toast } = useToast();
  const [conditions, setConditions] = useState({
    page: 1,
    limit: 10,
    status: undefined,
    purchase_date: undefined,
  });

  const { data: orders, isLoading: ordersLoading } = useOrders({
    page: conditions?.page,
    limit: conditions?.limit,
  });
  const orderSyncMutation = useOrderSync();

  console.log("Orders Data:", orders);
  const orderData = useMemo(() => {
    return (orders?.data || []).map((order) => ({
      id: order.id,
      code: order.code,
      customerName: order.customer_name,
      orderDate: new Date(order.purchase_date),
      total: formatCurrency(order.total),
      status: order.status_value,
      branch: order.branch_name,
      updatedAt: new Date(order.updated_at),
    }));
  }, [orders]);

  const ordersCount = useMemo(() => {
    return orders?.total || 0;
  }, [orders]);

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
    switch (status) {
      case "Hoàn thành":
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

  const totalPages = Math.ceil(ordersCount / conditions.limit);

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Đồng bộ đơn hàng
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Hệ thống sẽ tự động đồng bộ đơn hàng sau 12 giờ
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Lần cuối cập nhật</p>
              <p className="text-sm font-medium text-gray-900">
                {orderData.length > 0
                  ? getRelativeTime(new Date(orderData[0]?.updatedAt!))
                  : "Never"}
              </p>
            </div>
            <Button
              onClick={handleManualSync}
              disabled={orderSyncMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  orderSyncMutation.isPending ? "animate-spin" : ""
                }`}
              />
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
              {ordersLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                : orderData?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-primary">
                        #{order.code}
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
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
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
            Showing{" "}
            <span className="font-medium">
              {conditions.page * orderData.length - orderData.length}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {conditions.page * orderData.length}
            </span>{" "}
            of <span className="font-medium">{ordersCount}</span> results
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
