import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calculator,
  Calendar,
  FileText,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductSelector } from "./product-selector";
import { SupplierSelector } from "./supplier-selector";
import { IImportOrderCreateRequest, mutateImportOrder } from "@/services";
import { on } from "events";

const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
  deliveryDate: z.string().min(1, "Vui lòng chọn ngày giao hàng"),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;

interface PurchaseOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PurchaseOrderFormImproved({
  onSuccess,
  onCancel,
}: PurchaseOrderFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      id: string;
      name: string;
      price: string;
      quantity: number;
      code: string;
    }>
  >([]);

  const { toast } = useToast();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplierId: undefined,
      deliveryDate: "",
      notes: "",
    },
  });

  const createOrderMutation = mutateImportOrder({
    onSuccess: () => {
      onSuccess();
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseInt(amount));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => {
      return sum + parseInt(product.price) * product.quantity;
    }, 0);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity } : p))
    );
  };

  const onSubmit = (data: PurchaseOrderFormData) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Vui lòng chọn sản phẩm",
        description: "Bạn cần chọn ít nhất một sản phẩm cho đơn hàng",
        variant: "destructive",
      });
      return;
    }

    const orderData: IImportOrderCreateRequest = {
      distributor_id: data.supplierId,
      items: selectedProducts.map((product) => ({
        product_code: product.code,
        product_name: product.name,
        quantity_ordered: product.quantity,
        unit_price: Number(product.price),
        notes: "",
      })),
      notes: data.notes || "",
      expected_delivery_date: data.deliveryDate,
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Side - Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin đơn hàng
            </CardTitle>
            <CardDescription>
              Điền thông tin cơ bản cho đơn đặt hàng mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nhà cung cấp
                      </FormLabel>
                      <FormControl>
                        <SupplierSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Chọn nhà cung cấp..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Ngày giao dự kiến
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ghi chú thêm về đơn hàng..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Chọn sản phẩm
            </CardTitle>
            <CardDescription>
              Tìm kiếm và chọn sản phẩm cho đơn hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSelector
              supplierId={form.watch("supplierId")}
              selectedProducts={selectedProducts}
              onProductsChange={setSelectedProducts}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Tóm tắt đơn hàng
            </CardTitle>
            <CardDescription>
              {selectedProducts.length} sản phẩm đã chọn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có sản phẩm nào được chọn</p>
                <p className="text-sm">
                  Vui lòng chọn nhà cung cấp và sản phẩm
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-5">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(product.price)} / sản phẩm
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateProductQuantity(
                              product.id,
                              product.quantity - 1
                            )
                          }
                          disabled={product.quantity <= 1}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 min-w-[2rem] text-center text-sm">
                          {product.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateProductQuantity(
                              product.id,
                              product.quantity + 1
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(
                            (
                              parseInt(product.price) * product.quantity
                            ).toString()
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedProducts.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Tổng số sản phẩm:
                    </span>
                    <span className="font-medium">
                      {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng giá trị:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(calculateTotal().toString())}
                    </span>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={
                  selectedProducts.length === 0 || createOrderMutation.isPending
                }
                className="w-full"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Tạo đơn hàng
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={createOrderMutation.isPending}
                className="w-full"
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
