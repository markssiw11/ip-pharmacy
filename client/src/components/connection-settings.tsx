import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
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
  IConnectSettingsForm,
  useApiConfig,
  useConnectToKiotViet,
  useCreateConnection,
  useTestConnection,
  useToggleApiConnection,
  useUpdateConnection,
} from "@/services/connect";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Edit, User, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// const credentialsSchema = insertApiCredentialsSchema.extend({
//   clientId: z.string().min(1, "Vui lòng nhập Client ID"),
//   clientSecret: z.string().min(1, "Vui lòng nhập Client Secret"),
//   storeName: z.string().min(1, "Vui lòng nhập tên cửa hàng"),
// });

const accountConnectionSchema = z.object({
  id: z.string().optional(),
  user_name: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  connection_name: z.string().min(1, "Vui lòng nhập tên kết nối"),
});

export function ConnectionSettings() {
  const [connectionType, setConnectionType] = useState<"api" | "user_password">(
    "user_password"
  );
  const [connectionEnabled, setConnectionEnabled] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>(
    {}
  );
  const userNameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const connectionNameInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: config } = useApiConfig();
  const { mutateAsync: testConnection } = useTestConnection();
  const { mutateAsync: connectToKiotViet } = useConnectToKiotViet();
  const {
    mutateAsync: createConnection,
    isSuccess: createConnectionSuccess,
    isPending: createConnectionPending,
  } = useCreateConnection();
  const {
    mutateAsync: updateConnection,
    isSuccess: updateConnectionSuccess,
    isPending: updateConnectionPending,
  } = useUpdateConnection();

  const toggleApiMutation = useToggleApiConnection();

  const userForm = useForm<z.infer<typeof accountConnectionSchema>>({
    resolver: zodResolver(accountConnectionSchema),
    defaultValues: {
      id: "",
      user_name: "",
      password: "",
      connection_name: "",
    },
    mode: "onBlur",
  });

  const {
    formState: { isDirty },
  } = userForm;

  // const apiForm = useForm<z.infer<typeof credentialsSchema>>({
  //   resolver: zodResolver(credentialsSchema),
  //   defaultValues: {
  //     clientId: config?.client_id || "",
  //     clientSecret: config?.secret_id || "",
  //     isEnabled: config?.is_active || false,
  //     storeName: config?.store_name || "",
  //   },
  //   mode: "onBlur",
  // });

  useEffect(() => {
    setConnectionEnabled(config?.is_active || false);
    setConnectionType(config?.connection_type || "user_password");
    if (!!config?.id) {
      userForm.reset({
        id: config?.id || "",
        user_name: config?.username || "",
        password: config?.password || "",
        connection_name: config?.store_name || "",
      });
    }
  }, [config, setConnectionEnabled, setConnectionType, userForm]);

  useEffect(() => {
    if (
      createConnectionPending ||
      updateConnectionPending ||
      (!config?.is_active && !!config?.id)
    ) {
      return;
    }

    if ((createConnectionSuccess || updateConnectionSuccess) && !!config?.id) {
      connectToKiotViet({
        id: config?.id,
      });
    }
  }, [
    createConnectionSuccess,
    updateConnectionSuccess,
    config,
    connectToKiotViet,
  ]);

  const handleTestConnection = async () => {
    const values = userForm.getValues();
    if (!values.user_name || !values.password || !values.connection_name) {
      userForm.setError("root", {
        type: "manual",
        message: "Vui lòng điền đầy đủ thông tin kết nối",
      });
      return;
    }

    if (!isDirty && values.id) {
      try {
        await testConnection({
          id: values.id,
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
      return;
    }

    let payload: {
      id?: string;
      config?: Partial<IConnectSettingsForm>;
    } = {
      config: {
        username:
          values.user_name !== config?.username ? values.user_name : undefined,
        password:
          values.password !== config?.password ? values.password : undefined,
        connection_type: "user_password",
        store_name:
          values.connection_name !== config?.store_name
            ? values.connection_name
            : undefined,
      },
    };

    if (!!values.id) {
      payload.id = values.id;
    }

    try {
      await testConnection(payload);
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

    // if (connectionType === "api") {
    //   const values = apiForm.getValues();
    //   if (!values.clientId || !values.clientSecret || !values.storeName) {
    //     apiForm.setError("root", {
    //       type: "manual",
    //       message: "Vui lòng điền đầy đủ thông tin kết nối",
    //     });
    //     return;
    //   }

    //   try {
    //     await testConnectionMutation.mutateAsync({
    //       client_id: values.clientId,
    //       secret_id: values.clientSecret,
    //       store_name: values.storeName,
    //       is_active: connectionEnabled,
    //       connection_type: "api",
    //     });
    //     refetch();
    //   } catch (error) {
    //     toast({
    //       title: "Connection Failed",
    //       description:
    //         error instanceof Error
    //           ? error.message
    //           : "Failed to connect to KiotViet API",
    //       variant: "destructive",
    //     });
    //   }
    // }
  };

  const handleConnect = async () => {
    const values = userForm.getValues();

    if (!values.user_name || !values.password || !values.connection_name) {
      userForm.setError("root", {
        type: "manual",
        message: "Vui lòng điền đầy đủ thông tin kết nối",
      });
      return;
    }

    if (!values.id) {
      await createConnection({
        store_name: values.connection_name,
        username: values.user_name,
        password: values.password,
        connection_type: "user_password",
      });
    } else {
      await updateConnection({
        id: values.id,
        config: {
          username:
            values.user_name !== config?.username
              ? values.user_name
              : undefined,
          password:
            values.password !== config?.password ? values.password : undefined,
          connection_type: "user_password",
          store_name:
            values.connection_name !== config?.store_name
              ? values.connection_name
              : undefined,
        },
      });
    }

    // if (connectionType === "api") {
    //   const values = apiForm.getValues();
    //   if (!values.clientId || !values.clientSecret || !values.storeName) {
    //     apiForm.setError("root", {
    //       type: "manual",
    //       message: "Vui lòng điền đầy đủ thông tin kết nối",
    //     });
    //     return;
    //   }
    //   updateConfig({
    //     store_name: values.storeName,
    //     is_active: connectionEnabled,
    //     client_id: values.clientId,
    //     secret_id: values.clientSecret,
    //     connection_type: "api",
    //   });
    // }
  };

  const handleStartEditing = (fieldName: string, currentValue: string) => {
    setOriginalValues((prev) => ({ ...prev, [fieldName]: currentValue }));
    userForm.setValue(fieldName as any, "");
    setEditingField(fieldName);

    // Focus the input field after a small delay to ensure it's rendered
    setTimeout(() => {
      if (fieldName === "user_name" && userNameInputRef.current) {
        userNameInputRef.current.focus();
      } else if (fieldName === "password" && passwordInputRef.current) {
        passwordInputRef.current.focus();
      } else if (
        fieldName === "connection_name" &&
        connectionNameInputRef.current
      ) {
        connectionNameInputRef.current.focus();
      }
    }, 0);
  };

  const handleEndEditing = (fieldName: string) => {
    const currentValue = userForm.getValues(fieldName as any);
    const originalValue = originalValues[fieldName] || "";

    if (currentValue === "" && originalValue) {
      // If field is empty, restore original value
      userForm.setValue(fieldName as any, originalValue);
    }
    setEditingField(null);
  };

  const handleToggleConnection = async (enabled: boolean) => {
    setConnectionEnabled(enabled);
    await toggleApiMutation.mutateAsync({ id: config?.id || "", enabled });
  };

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
              className={`flex items-center gap-2 ${
                connectionType === "api"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-green-50 border-green-500 text-green-700"
              }`}
            >
              <User className="h-4 w-4" />
              User
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
          {!!config?.id && (
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
          )}
        </div>

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
                  <div className="relative">
                    <Input
                      {...field}
                      ref={userNameInputRef}
                      autoComplete="off"
                      placeholder="Nhập tên đăng nhập"
                      disabled={
                        !!config?.id &&
                        (!connectionEnabled ||
                          (!!field.value && editingField !== "user_name"))
                      }
                      className={
                        !!config?.id &&
                        (!connectionEnabled ||
                          (!!field.value && editingField !== "user_name"))
                          ? "pr-10"
                          : ""
                      }
                      onBlur={() => handleEndEditing("user_name")}
                    />
                    {connectionEnabled &&
                      field.value &&
                      editingField !== "user_name" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            handleStartEditing("user_name", field.value)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
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
                  <div className="relative">
                    <Input
                      {...field}
                      ref={passwordInputRef}
                      type={editingField === "password" ? "text" : "password"}
                      autoComplete="off"
                      placeholder="Nhập mật khẩu"
                      disabled={
                        !!config?.id &&
                        (!connectionEnabled ||
                          (!!field.value && editingField !== "password"))
                      }
                      className={
                        !!config?.id &&
                        (!connectionEnabled ||
                          (!!field.value && editingField !== "password"))
                          ? "pr-10"
                          : ""
                      }
                      onBlur={() => handleEndEditing("password")}
                    />
                    {connectionEnabled &&
                      field.value &&
                      editingField !== "password" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            handleStartEditing("password", field.value)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={userForm.control}
              name="connection_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Tên kết nối</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      ref={connectionNameInputRef}
                      placeholder="Nhập tên cho kết nối này"
                      disabled={
                        !!config?.id &&
                        (!connectionEnabled ||
                          (!!field.value && editingField !== "connection_name"))
                      }
                      className={
                        !!config?.id &&
                        (!connectionEnabled ||
                          (!!field.value && editingField !== "connection_name"))
                          ? "pr-10"
                          : ""
                      }
                      onBlur={() => handleEndEditing("connection_name")}
                    />
                    {connectionEnabled &&
                      field.value &&
                      editingField !== "connection_name" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            handleStartEditing("connection_name", field.value)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex gap-3">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={!connectionEnabled && !!config?.id}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Test kết nối
              </Button>
              <Button
                type="button"
                onClick={handleConnect}
                disabled={
                  (!connectionEnabled && !!config?.id) ||
                  updateConnectionPending
                }
                className="bg-green-600 hover:bg-green-700"
              >
                <User className="h-4 w-4 mr-2" />
                Kết nối
              </Button>
            </div>
          </form>
        </Form>

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

        {/* API Connection For Next Version */}
        {/* {connectionType === "api" ? (
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
        ) : null} */}

        {/* {connectionEnabled &&
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
          )} */}
      </CardContent>
    </Card>
  );
}
