import { useState } from "react";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import { PurchaseOrderForm } from "./purchase-order-form";
import {
  getMockPurchaseOrders,
  MockPurchaseOrder,
  updateMockPurchaseOrderStatus,
} from "@/lib/mock-purchase-orders";

const statusColors: Record<string, string> = {
  "Đã tạo": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Đang xử lý":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "Hoàn thành":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Đã hủy": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusIcons: Record<string, any> = {
  "Đã tạo": Package,
  "Đang xử lý": Clock,
  "Hoàn thành": CheckCircle,
  "Đã hủy": XCircle,
};

export function PurchaseOrderList() {
  const [orders, setOrders] = useState<MockPurchaseOrder[]>(
    getMockPurchaseOrders()
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MockPurchaseOrder | null>(
    null
  );
  const { toast } = useToast();

  const handleStatusChange = (orderId: number, newStatus: string) => {
    const updatedOrder = updateMockPurchaseOrderStatus(orderId, newStatus);
    if (updatedOrder) {
      setOrders(getMockPurchaseOrders());
      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Đơn hàng #${orderId} đã được cập nhật thành "${newStatus}"`,
      });
    }
  };

  const handleCreateSuccess = () => {
    setOrders(getMockPurchaseOrders());
    setIsCreateDialogOpen(false);
    toast({
      title: "Tạo đơn hàng thành công",
      description: "Đơn hàng mới đã được tạo và lưu vào hệ thống",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseInt(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý đơn đặt hàng
          </h1>
          <p className="text-muted-foreground">
            Quản lý đơn đặt hàng từ nhà cung cấp
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <PurchaseOrderForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn đặt hàng</CardTitle>
          <CardDescription>Tổng cộng {orders.length} đơn hàng</CardDescription>
        </CardHeader>
        <CardContent>
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
                const StatusIcon = statusIcons[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                          >
                            Hoàn thành
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
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
                    Nhà cung cấp: {selectedOrder.supplierName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ngày đặt: {formatDate(selectedOrder.orderDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ngày giao: {formatDate(selectedOrder.deliveryDate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Trạng thái & Tổng tiền</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {(() => {
                      const StatusIcon = statusIcons[selectedOrder.status];
                      return (
                        <Badge className={statusColors[selectedOrder.status]}>
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
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.supplierProductName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
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
