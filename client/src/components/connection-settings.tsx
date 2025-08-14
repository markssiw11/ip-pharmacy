import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useApiConfig,
  useConnectToKiotViet,
  useTestConnection,
  useToggleApiConnection,
  useUpdateApiConfig,
} from "@/services/connect";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApiCredentialsSchema } from "@shared/schema";
import { CheckCircle, Wifi, User, Key } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const credentialsSchema = insertApiCredentialsSchema.extend({
  clientId: z.string().min(1, "Vui lòng nhập Client ID"),
  clientSecret: z.string().min(1, "Vui lòng nhập Client Secret"),
  storeName: z.string().min(1, "Vui lòng nhập tên cửa hàng"),
});

const userCredentialsSchema = z.object({
  user_name: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  connectionName: z.string().min(1, "Vui lòng nhập tên kết nối"),
});

export function ConnectionSettings() {
  const [connectionType, setConnectionType] = useState<"api" | "user_password">(
    "api"
  );
  const [connectionEnabled, setConnectionEnabled] = useState(false);
  const { toast } = useToast();

  const testConnectionMutation = useTestConnection();
  const connectMutation = useConnectToKiotViet();
  const toggleApiMutation = useToggleApiConnection();
  const { data: config, refetch } = useApiConfig();
  const { mutate: updateConfig, isPending } = useUpdateApiConfig();

  console.log("config===================", config);

  const apiForm = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      clientId: config?.client_id || "",
      clientSecret: config?.secret_id || "",
      isEnabled: config?.is_active || false,
      storeName: config?.store_name || "",
    },
    mode: "onBlur",
  });

  const userForm = useForm<z.infer<typeof userCredentialsSchema>>({
    resolver: zodResolver(userCredentialsSchema),
    defaultValues: {
      user_name: "",
      password: "",
      connectionName: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (config) {
      setConnectionEnabled(config.is_active || false);
      if (config.is_active) {
        setConnectionType(config?.connection_type || "user_password");
        if (config.connection_type === "user_password") {
          userForm.reset({
            user_name: config?.user_name || "",
            password: config?.password || "",
            connectionName: config.store_name || "",
          });
        } else {
          apiForm.reset({
            clientId: config.client_id || "",
            clientSecret: config.secret_id || "",
            storeName: config.store_name || "",
            isEnabled: config.is_active || false,
          });
        }
      }
    }
  }, [config, apiForm]);

  const handleTestConnection = async () => {
    if (connectionType === "api") {
      const values = apiForm.getValues();
      if (!values.clientId || !values.clientSecret || !values.storeName) {
        apiForm.setError("root", {
          type: "manual",
          message: "Vui lòng điền đầy đủ thông tin kết nối",
        });
        return;
      }

      try {
        await testConnectionMutation.mutateAsync({
          client_id: values.clientId,
          secret_id: values.clientSecret,
          store_name: values.storeName,
          is_active: connectionEnabled,
          connection_type: "api",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Connection Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to connect to KiotViet API",
          variant: "destructive",
        });
      }
    } else {
      // User connection test
      const values = userForm.getValues();
      if (!values.user_name || !values.password || !values.connectionName) {
        userForm.setError("root", {
          type: "manual",
          message: "Vui lòng điền đầy đủ thông tin kết nối",
        });
        return;
      }
      try {
        await testConnectionMutation.mutateAsync({
          username: values.user_name,
          password: values.password,
          connection_type: "user_password",
          store_name: values.connectionName,
        });
      } catch (error) {
        toast({
          title: "Connection Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to connect to KiotViet API",
          variant: "destructive",
        });
      }
    }
  };

  const handleConnect = async () => {
    if (connectionType === "api") {
      const values = apiForm.getValues();
      if (!values.clientId || !values.clientSecret || !values.storeName) {
        apiForm.setError("root", {
          type: "manual",
          message: "Vui lòng điền đầy đủ thông tin kết nối",
        });
        return;
      }
      updateConfig({
        store_name: values.storeName,
        is_active: connectionEnabled,
        client_id: values.clientId,
        secret_id: values.clientSecret,
        connection_type: "api",
      });
    } else {
      // User connection logic
      const values = userForm.getValues();

      if (!values.user_name || !values.password || !values.connectionName) {
        userForm.setError("root", {
          type: "manual",
          message: "Vui lòng điền đầy đủ thông tin kết nối",
        });
        return;
      }
      connectMutation.mutate({
        store_name: values.connectionName,
        username: values.user_name,
        password: values.password,
      });
    }
    refetch();
  };

  const handleToggleConnection = async (enabled: boolean) => {
    setConnectionEnabled(enabled);

    if (connectionType === "api") {
      try {
        await toggleApiMutation.mutateAsync(enabled);
        toast({
          title: enabled ? "API Enabled" : "API Disabled",
          description: `KiotViet API connection ${
            enabled ? "enabled" : "disabled"
          }`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update API connection status",
          variant: "destructive",
        });
      }
    } else {
      // User connection toggle logic
      toast({
        title: enabled ? "User Connection Enabled" : "User Connection Disabled",
        description: `User connection ${enabled ? "enabled" : "disabled"}`,
      });
    }
  };

  const switchConnectionType = useCallback(() => {
    const newType = connectionType === "api" ? "user_password" : "api";
    console.log("Switching to:", newType);
    setConnectionType(newType);
    setConnectionEnabled(false); // Reset connection when switching types

    // Reset the appropriate form when switching
    if (newType === "user_password") {
      console.log("Resetting user form");
      userForm.reset({
        user_name: "",
        password: "",
        connectionName: "",
      });
      console.log("User form values after reset:", userForm.getValues());
    } else {
      console.log("Resetting API form");
      apiForm.reset({
        clientId: "",
        clientSecret: "",
        storeName: "",
        isEnabled: false,
      });
      console.log("API form values after reset:", apiForm.getValues());
    }
  }, [connectionType, userForm, apiForm]);

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Cài đặt kết nối
          </h2>
          <div className="flex items-center space-x-3">
            <Label className="text-sm text-gray-600">Loại kết nối</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={switchConnectionType}
              className={`flex items-center gap-2 ${
                connectionType === "api"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-green-50 border-green-500 text-green-700"
              }`}
            >
              {connectionType === "api" ? (
                <>
                  <Key className="h-4 w-4" />
                  API
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  User
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {connectionType === "api"
                ? "Kết nối API"
                : "Kết nối bằng tài khoản"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {connectionType === "api"
                ? "Sử dụng Client ID và Client Secret để kết nối"
                : "Nhập thông tin tài khoản để kết nối trực tiếp"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Label className="text-sm text-gray-600">Bật kết nối</Label>
            <Switch
              checked={connectionEnabled}
              onCheckedChange={handleToggleConnection}
              disabled={toggleApiMutation.isPending}
            />
            {connectionEnabled && (
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            )}
          </div>
        </div>

        {connectionType === "api" ? (
          <Form {...apiForm} key="api-form">
            <form
              autoComplete="off"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <FormField
                control={apiForm.control}
                name="clientId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCorrect="off"
                        autoComplete="off"
                        placeholder="Enter your Client ID"
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={apiForm.control}
                name="clientSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Secret</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={field?.value ? "password" : "text"}
                        autoComplete="off"
                        autoCorrect="off"
                        placeholder="Enter your Client Secret"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={apiForm.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên cửa hàng</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Nhập tên cửa hàng"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex gap-3">
                <Button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={
                    !connectionEnabled || testConnectionMutation.isPending
                  }
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Test kết nối
                </Button>
                <Button
                  type="button"
                  onClick={handleConnect}
                  disabled={
                    !connectionEnabled || testConnectionMutation.isPending
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {testConnectionMutation.isPending
                    ? "Đang kết nối..."
                    : "Kết nối"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...userForm} key="user-form">
            <form
              autoComplete="off"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <FormField
                control={userForm.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder="Nhập tên đăng nhập"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="off"
                        placeholder="Nhập mật khẩu"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userForm.control}
                name="connectionName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tên kết nối</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tên cho kết nối này"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex gap-3">
                <Button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={!connectionEnabled}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Test kết nối
                </Button>
                <Button
                  type="button"
                  onClick={handleConnect}
                  disabled={!connectionEnabled || isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Kết nối
                </Button>
              </div>
            </form>
          </Form>
        )}

        {connectionEnabled &&
          connectionType === "api" &&
          config?.connection && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Kết nối thành công với KiotViet API
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Lần cuối vào:{" "}
                    {config.last_sync
                      ? new Date(config.last_sync).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          )}

        {connectionEnabled && connectionType === "user_password" && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  User connection is enabled
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Ready to connect with user credentials
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
