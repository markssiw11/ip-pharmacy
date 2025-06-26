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
  useTestConnection,
  useToggleApiConnection,
} from "@/services/connect";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApiCredentialsSchema } from "@shared/schema";
import { CheckCircle, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const credentialsSchema = insertApiCredentialsSchema.extend({
  clientId: z.string().min(1, "Vui lòng nhập Client ID"),
  clientSecret: z.string().min(1, "Vui lòng nhập Client Secret"),
  storeName: z.string().min(1, "Vui lòng nhập tên cửa hàng"),
});

export function ConnectionSettings() {
  const [apiEnabled, setApiEnabled] = useState(true);
  const { toast } = useToast();
  const [showSecretId, setShowSecretId] = useState(true);

  const testConnectionMutation = useTestConnection();
  const toggleApiMutation = useToggleApiConnection();
  const { data: config, refetch } = useApiConfig();

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      clientId: config?.client_id || "",
      clientSecret: config?.secret_id || "",
      isEnabled: config?.is_active || false,
      storeName: config?.store_name || "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (config) {
      form.reset({
        clientId: config.client_id || "",
        clientSecret: config.secret_id || "",
        storeName: config.store_name || "",
        isEnabled: config.is_active || false,
      });
      setApiEnabled(config.is_active || false);
    }
  }, [config]);

  const handleTestConnection = async () => {
    const values = form.getValues();
    if (!values.clientId || !values.clientSecret || !values.storeName) {
      form.setError("root", {
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
        is_active: apiEnabled,
      });
      refetch();
      toast({
        title: "Success",
        description: "Connection test successful!",
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
  };

  const handleToggleApi = async (enabled: boolean) => {
    setApiEnabled(enabled);

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
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">API Kết nối</h2>
          <div className="flex items-center space-x-3">
            <Label htmlFor="api-toggle" className="text-sm text-gray-600">
              Bật kết nối API
            </Label>
            <Switch
              id="api-toggle"
              checked={apiEnabled}
              onCheckedChange={handleToggleApi}
              disabled={toggleApiMutation.isPending}
            />
          </div>
        </div>

        <Form {...form}>
          <form
            autoComplete="off"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <FormField
              control={form.control}
              name="clientId"
              key={"clientId"}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoCorrect="off"
                      autoComplete="off"
                      placeholder="Enter your Client ID"
                      autoFocus={false}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientSecret"
              key={"clientSecret"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={field?.value ? "password" : "text"}
                      autoComplete="off"
                      autoCorrect="off"
                      inputMode="none"
                      autoFocus={false}
                      placeholder="Enter your Client Secret"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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

            <div className="md:col-span-2">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Wifi className="h-4 w-4 mr-2" />
                {testConnectionMutation.isPending
                  ? "Đang kiểm tra kết nối..."
                  : "Kết nối"}
              </Button>
            </div>
          </form>
        </Form>

        {config?.connection && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Kết nối thành công với KiotViet API
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Lần cuối vào :{" "}
                  {config.last_sync
                    ? new Date(config.last_sync).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
