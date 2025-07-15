import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCreateDistributor,
  useUpdateDistributor,
  IDistributor,
} from "@/services/distributors";

const distributorFormSchema = z.object({
  name: z.string().min(1, "Tên nhà phân phối là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  tax_code: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z
    .string()
    .email("Email liên hệ không hợp lệ")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

type DistributorFormData = z.infer<typeof distributorFormSchema>;

interface DistributorFormProps {
  distributor?: IDistributor;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DistributorForm({
  distributor,
  onSuccess,
  onCancel,
}: DistributorFormProps) {
  const isEditing = !!distributor;

  const createMutation = useCreateDistributor();
  const updateMutation = useUpdateDistributor();

  const form = useForm<DistributorFormData>({
    resolver: zodResolver(distributorFormSchema),
    defaultValues: {
      name: distributor?.name || "",
      email: distributor?.email || "",
      phone: distributor?.phone || "",
      address: distributor?.address || "",
      tax_code: distributor?.tax_code || "",
      contact_person: distributor?.contact_person || "",
      contact_phone: distributor?.contact_phone || "",
      contact_email: distributor?.contact_email || "",
      description: distributor?.description || "",
      status: distributor?.status || "active",
    },
  });

  const onSubmit = async (data: DistributorFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          ...data,
          id: distributor.id,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Chỉnh sửa nhà phân phối" : "Thêm nhà phân phối mới"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên nhà phân phối *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên nhà phân phối" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập mã số thuế" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Nhập địa chỉ email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập số điện thoại" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập địa chỉ nhà phân phối"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người liên hệ</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Tên người liên hệ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SĐT người liên hệ</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Số điện thoại liên hệ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email liên hệ</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Email liên hệ"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">
                              Không hoạt động
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập mô tả về nhà phân phối (tùy chọn)"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Đang xử lý..."
                  : isEditing
                  ? "Cập nhật"
                  : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
