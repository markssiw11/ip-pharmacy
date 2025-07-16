import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useImportOrders } from "@/services/order";
import type {
  Product,
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
} from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { PurchaseOrderFormImproved } from "./purchase-order-form-improved";

interface PurchaseOrderWithSupplier extends PurchaseOrder {
  supplier?: Supplier;
  items?: Array<{
    id: number;
    supplierProductName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  approved:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",

  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusIcons: Record<string, any> = {
  pending: Package,
  approved: CheckCircle,
  cancelled: XCircle,
  delivered: CheckCircle,
};

const mapStatusLabel: Record<string, any> = {
  pending: "Đã tạo",
  approved: "Đã xử lý",
  cancelled: "Huỷ",
  delivered: "Hoàn tất",
};

export function PurchaseOrderList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<
    PurchaseOrderWithSupplier | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const limit = 10;
  const offset = (currentPage - 1) * limit || 0;

  const { data: ordersData, isLoading } = useImportOrders({
    limit,
    page: currentPage,
  });

  const orders = ordersData?.data || [];
  const total = ordersData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/purchase-orders/${id}/status`,
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Cập nhật trạng thái thành công",
        description: "Trạng thái đơn hàng đã được cập nhật",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi khi cập nhật trạng thái",
        description: error.message || "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    },
  });

  const { data: orderItems = [] } = useQuery<PurchaseOrderItem[]>({
    queryKey: ["/api/purchase-orders", selectedOrder?.id, "items"],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const response = await fetch(
        `/api/purchase-orders/${selectedOrder?.id}/items`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch order items");
      }
      return response.json();
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    setCurrentPage(1);
    toast({
      title: "Tạo đơn hàng thành công",
      description: "Đơn hàng mới đã được tạo và lưu vào hệ thống",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(typeof amount === "number" ? amount : parseFloat(amount));
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách đơn đặt hàng</CardTitle>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo đơn hàng mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo đơn đặt hàng mới</DialogTitle>
                </DialogHeader>
                <PurchaseOrderFormImproved
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Tổng cộng {total} đơn hàng - Trang {currentPage} / {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Ngày giao</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {/* <TableHead>Thao tác</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const StatusIcon = statusIcons[order.status || "pending"];
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.order_number}
                      </TableCell>
                      <TableCell>{order.distributor?.name || "N/A"}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        {order.actual_delivery_date
                          ? formatDate(order.actual_delivery_date)
                          : "Chưa cập nhật"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order?.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[order.status || "pending"]}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {mapStatusLabel[order.status]}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === "Đã tạo" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "Đang xử lý")
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              Xử lý
                            </Button>
                          )}
                          {order.status === "Đang xử lý" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "Hoàn thành")
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              Hoàn thành
                            </Button>
                          )}
                        </div>
                      </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {total > limit && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {offset + 1} đến {Math.min(offset + limit, total)} trên
                tổng {total} đơn hàng
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, currentPage + 2);
                      return page >= start && page <= end;
                    })
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Tiếp
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(undefined)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Thông tin đơn hàng</h4>
                  <p className="text-sm text-muted-foreground">
                    Nhà cung cấp: {selectedOrder.supplier?.name || "N/A"}
                  </p>
                  {selectedOrder.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      Ngày đặt: {formatDate(selectedOrder.createdAt)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Ngày giao: {formatDate(selectedOrder.deliveryDate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Trạng thái & Tổng tiền</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {(() => {
                      const StatusIcon =
                        statusIcons[selectedOrder.status || "Đã tạo"];
                      return (
                        <Badge
                          className={
                            statusColors[selectedOrder.status || "Đã tạo"]
                          }
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {selectedOrder.status}
                        </Badge>
                      );
                    })()}
                  </div>
                  <p className="text-lg font-semibold mt-2">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Danh sách sản phẩm</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      );
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{product?.name || "N/A"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.totalPrice)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold">Ghi chú</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
