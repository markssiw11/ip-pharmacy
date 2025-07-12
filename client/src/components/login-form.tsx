import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { authenticateUser, MockUser } from "@/lib/mock-auth";
import { useAuth } from "@/components/auth-provider";
import { Info } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

type LoginCredentials = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess: (user: MockUser) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = authenticateUser(data.username, data.password);

      if (user) {
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng, ${user.fullName}!`,
        });
        login(user);
        onLoginSuccess(user);
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi đăng nhập",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Hệ thống quản lý nhà thuốc
            </CardTitle>
            <CardDescription>
              Đăng nhập để truy cập hệ thống quản lý đơn hàng
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập tên đăng nhập"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Nhập mật khẩu"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm">
              <p className="font-medium mb-2">Tài khoản thử nghiệm:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="bg-muted p-2 rounded">
                  <strong>admin</strong> / admin123 - Quản trị viên
                </div>
                <div className="bg-muted p-2 rounded">
                  <strong>pharmacist</strong> / duoc123 - Dược sĩ
                </div>
                <div className="bg-muted p-2 rounded">
                  <strong>manager</strong> / quan123 - Quản lý
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
