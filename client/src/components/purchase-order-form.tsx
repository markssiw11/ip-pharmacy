import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  createMockPurchaseOrder,
  getMockSuppliers,
} from "@/lib/mock-purchase-orders";

const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
  orderDate: z.date({
    required_error: "Vui lòng chọn ngày đặt hàng",
  }),
  deliveryDate: z.date({
    required_error: "Vui lòng chọn ngày giao hàng",
  }),
  totalAmount: z.string().min(1, "Tổng tiền không hợp lệ"),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;

interface PurchaseOrderItem {
  id: string;
  productId: string;
  supplierProductName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  supplierProductId?: string;
  kiotVietProductId?: string;
}

interface PurchaseOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PurchaseOrderForm({
  onSuccess,
  onCancel,
}: PurchaseOrderFormProps) {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const suppliers = getMockSuppliers();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplierId: "",
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalAmount: "0",
      notes: "",
    },
  });

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      productId: "",
      supplierProductName: "",
      quantity: 1,
      unitPrice: "0",
      totalPrice: "0",
      supplierProductId: "",
      kiotVietProductId: "",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    updateTotalAmount(newItems);
  };

  const updateItem = (
    id: string,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Auto-calculate total price when quantity or unit price changes
        if (field === "quantity" || field === "unitPrice") {
          const quantity = field === "quantity" ? value : updatedItem.quantity;
          const unitPrice =
            field === "unitPrice" ? value : updatedItem.unitPrice;
          updatedItem.totalPrice = (
            quantity * parseFloat(unitPrice || "0")
          ).toString();
        }

        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
    updateTotalAmount(newItems);
  };

  const updateTotalAmount = (newItems: PurchaseOrderItem[]) => {
    const totalAmount = newItems.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice || "0"),
      0
    );
    form.setValue("totalAmount", totalAmount.toString());
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (items.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một sản phẩm vào đơn hàng",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const orderData = {
        supplierId: parseInt(data.supplierId),
        orderDate: data.orderDate,
        deliveryDate: data.deliveryDate,
        totalAmount: data.totalAmount,
        notes: data.notes,
        items: items.map((item) => ({
          productId: item.productId || item.supplierProductName,
          supplierProductName: item.supplierProductName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          supplierProductId: item.supplierProductId,
          kiotVietProductId: item.kiotVietProductId,
        })),
        createdBy: user?.id || 1,
      };

      createMockPurchaseOrder(orderData);

      toast({
        title: "Tạo đơn hàng thành công",
        description: "Đơn đặt hàng đã được tạo và lưu vào hệ thống",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseInt(amount || "0"));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhà cung cấp</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id.toString()}
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày đặt hàng</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(Date.now() - 24 * 60 * 60 * 1000)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày giao hàng</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tổng tiền</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="0"
                    disabled
                    className="font-semibold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Đơn giá</TableHead>
                    <TableHead>Thành tiền</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.supplierProductName}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "supplierProductName",
                              e.target.value
                            )
                          }
                          placeholder="Nhập tên sản phẩm"
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.id, "unitPrice", e.target.value)
                          }
                          placeholder="0"
                          min="0"
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Nhập ghi chú cho đơn hàng..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <div className="text-lg font-semibold">
            Tổng tiền: {formatCurrency(form.watch("totalAmount"))}
          </div>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
