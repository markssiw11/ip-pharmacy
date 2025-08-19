import { useAuth } from "@/components/auth-provider";
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
  EventTracking,
  setMetadata,
  trackingEvent,
  updateProfile,
} from "@/helpers/tracking";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ILoginRequest } from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

type LoginCredentials = z.infer<typeof loginSchema>;

interface LoginFormProps {}

export function LoginForm({}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await login(form.getValues() as ILoginRequest);
      if (res) {
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng, ${res?.name}!`,
        });
        // fetch all data after login
        queryClient.invalidateQueries({ queryKey: ["import-orders"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        console.log("Login successful:", res);

        updateProfile({
          email: res.email,
          userId: res.id,
          name: res.name,
          phone: res.phone_number,
        });

        trackingEvent(EventTracking.USER_LOGIN, {
          email: res.email,
          userId: res.id,
          name: res.name,
          gender: res.gender?.toString(),
        });

        setMetadata({
          role: res.staff?.role,
        });
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
    <div className="min-h-screen flex bg-white">
      {/* Left side - Background Image */}
      <div className="relative hidden lg:flex lg:flex-1 items-center justify-center shrink-0">
        <img
          src="/auth-bg.jpg"
          alt="Authentication Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center  rounded-lg p-6 ">
            <div className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="IB Pharmacy Logo"
                className="w-20 h-20 mr-3"
              />
              <h1
                className="text-[60px] font-bold"
                style={{ color: "#015AA2" }}
              >
                IB Pharmacy
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex shrink-0 items-center justify-center">
        <div className="w-full max-w-md flex flex-col justify-between space-y-6">
          <div className="flex flex-col gap-1 text-center">
            <p className="text-2xl text-[#1C1C1E] font-semibold">
              Hệ thống quản lý nhà thuốc
            </p>
            <p className="text-base text-[#717176] ">
              Đăng nhập để truy cập hệ thống quản lý đơn hàng
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 justify-between space-y-6"
            >
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        Tên đăng nhập <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl className="h-12">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            {...field}
                            className="pl-10 h-12"
                            placeholder="Nhập tên đăng nhập"
                            disabled={isLoading}
                          />
                        </div>
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
                      <FormLabel className="text-sm font-normal">
                        Mật khẩu <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl className="h-12">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10 h-12"
                            placeholder="Nhập mật khẩu"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base disabled:bg-gray-400"
                disabled={isLoading || !form.formState.isDirty}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
