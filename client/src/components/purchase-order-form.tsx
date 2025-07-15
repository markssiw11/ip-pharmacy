import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SupplierSelector } from "./supplier-selector";
import { ProductSelector } from "./product-selector";

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

export function PurchaseOrderForm({
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
  const queryClient = useQueryClient();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplierId: undefined,
      deliveryDate: "",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData & { items: any[] }) => {
      const response = await apiRequest("POST", "/api/purchase-orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Tạo đơn hàng thành công",
        description: "Đơn hàng mới đã được tạo và lưu vào hệ thống",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi khi tạo đơn hàng",
        description: error.message || "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => {
      return sum + parseInt(product.price) * product.quantity;
    }, 0);
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

    const orderData = {
      ...data,
      totalAmount: calculateTotal().toString(),
      items: selectedProducts.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
        unitPrice: product.price,
        totalPrice: (parseInt(product.price) * product.quantity).toString(),
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhà cung cấp *</FormLabel>
                <FormControl>
                  <SupplierSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Chọn nhà cung cấp"
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
                <FormLabel>Ngày giao hàng *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="h-12"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product Selection */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chọn sản phẩm
          </h3>
          <ProductSelector
            supplierId={form.watch("supplierId")}
            selectedProducts={selectedProducts}
            onProductsChange={setSelectedProducts}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={
              createOrderMutation.isPending || selectedProducts.length === 0
            }
          >
            {createOrderMutation.isPending ? "Đang tạo..." : "Tạo đơn hàng"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
