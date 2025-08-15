import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  IImportOrder,
  useImportOrders,
  useSyncOrderToKiotViet,
} from "@/services/order";
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
  RefreshCw,
  XCircle,
  Building,
  CalendarDays,
  Truck,
  FileText,
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
  const [selectedOrder, setSelectedOrder] = useState<IImportOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const syncOrderMutation = useSyncOrderToKiotViet();

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

  const handleSyncToKiotViet = (orderId: string) => {
    syncOrderMutation.mutate(orderId);
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
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const StatusIcon = statusIcons[order.status || "pending"];
                  return (
                    <TableRow
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
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
                      <TableCell>
                        {order.status === "delivered" &&
                        !order?.is_synced_to_kiotviet ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSyncToKiotViet(order.id)}
                                  disabled={syncOrderMutation.isPending}
                                  className="h-8 w-8 p-0"
                                >
                                  <RefreshCw
                                    className={`h-4 w-4 ${
                                      syncOrderMutation.isPending
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Đồng bộ đơn hàng lên KiotViet</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <div>Đã đồng bộ</div>
                        )}
                      </TableCell>
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

      {/* Order Details Drawer */}
      <Drawer
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        direction="right"
      >
        <DrawerContent className="h-full max-w-2xl ml-auto">
          <div className="mx-auto w-full max-w-4xl p-6">
            {selectedOrder && (
              <>
                <DrawerHeader className="px-0 pt-0">
                  <DrawerTitle className="flex items-center gap-2">
                    #{selectedOrder.order_number || "N/A"}
                    <Badge
                      className={
                        statusColors[selectedOrder.status || "pending"]
                      }
                    >
                      {mapStatusLabel[selectedOrder.status || "pending"]}
                    </Badge>
                  </DrawerTitle>
                </DrawerHeader>

                {/* Order Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Thông tin đơn hàng</h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>Nhà cung cấp</span>
                      </div>
                      <span className="font-medium uppercase">
                        {selectedOrder.distributor?.name || "N/A"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>Ngày đặt hàng</span>
                      </div>
                      <span className="font-medium uppercase">
                        {formatDate(selectedOrder.created_at) || "N/A"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Ngày giao hàng</span>
                      </div>
                      <span className="font-medium uppercase">
                        {selectedOrder.actual_delivery_date
                          ? formatDate(selectedOrder.actual_delivery_date)
                          : "CHƯA CẬP NHẬT"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start pt-2">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mt-0.5" />
                        <span>Ghi chú</span>
                      </div>
                      <div className="w-2/3 text-right">
                        <p className="font-medium uppercase break-words">
                          {selectedOrder.notes || "KHÔNG CÓ GHI CHÚ"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product List Section */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">
                      Danh sách sản phẩm
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã sản phẩm</TableHead>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead className="text-right">SL</TableHead>
                            <TableHead className="text-right">
                              Đơn giá
                            </TableHead>
                            <TableHead className="text-right">
                              Thành tiền
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.product_code || "N/A"}
                              </TableCell>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell className="text-right">
                                {item.quantity_ordered}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.unit_price)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.total_price)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Total Row */}
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={4} className="text-right font-medium">
                              TỔNG TIỀN:
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(selectedOrder.total_amount || 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
