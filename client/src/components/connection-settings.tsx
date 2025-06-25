import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wifi, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTestConnection, useToggleApiConnection, useApiConnection } from "@/hooks/use-kiotviet-api";
import { insertApiCredentialsSchema } from "@shared/schema";

const credentialsSchema = insertApiCredentialsSchema.extend({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
});

export function ConnectionSettings() {
  const [apiEnabled, setApiEnabled] = useState(true);
  const { toast } = useToast();
  
  const { data: connectionStatus } = useApiConnection();
  const testConnectionMutation = useTestConnection();
  const toggleApiMutation = useToggleApiConnection();

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
      isEnabled: true,
    },
  });

  const handleTestConnection = async () => {
    const values = form.getValues();
    
    try {
      await testConnectionMutation.mutateAsync(values);
      toast({
        title: "Success",
        description: "Connection test successful!",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to KiotViet API",
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
        description: `KiotViet API connection ${enabled ? 'enabled' : 'disabled'}`,
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
          <h2 className="text-xl font-semibold text-gray-900">API Connection Settings</h2>
          <div className="flex items-center space-x-3">
            <Label htmlFor="api-toggle" className="text-sm text-gray-600">
              Enable API Connection
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
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Client ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Client Secret"
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
                {testConnectionMutation.isPending ? "Testing..." : "Send Test"}
              </Button>
            </div>
          </form>
        </Form>

        {connectionStatus?.isConnected && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Connection Successful</h3>
                <p className="text-sm text-green-700 mt-1">
                  Last tested: {connectionStatus.lastTested ? 
                    new Date(connectionStatus.lastTested).toLocaleString() : 
                    'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
