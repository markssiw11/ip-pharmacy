import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConnectApi } from "./connect.api";
import { IConnectSettingsForm } from "./connect.type";
import { toast } from "@/hooks/use-toast";

export const useApiConfig = () => {
  return useQuery({
    queryKey: ["/connection/config"],
    queryFn: async () => {
      const res = await ConnectApi.getConnect();
      return res.data;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: IConnectSettingsForm) => {
      const res = await ConnectApi.createConnection(credentials);
      return res.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection/status"] });
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      config,
    }: {
      id: string;
      config: Partial<IConnectSettingsForm>;
    }) => {
      const res = await ConnectApi.updateConnection(id, config);
      return res.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/connection/config"] });
    },
  });
}

export function useToggleApiConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await ConnectApi.updateIsActive(id, enabled);
      return res.settings;
    },
    onSuccess: ({ is_active }) => {
      toast({
        title: is_active ? "Connection Enabled" : "Connection Disabled",
        description: `KiotViet API connection ${
          is_active ? "enabled" : "disabled"
        }`,
      });
      queryClient.invalidateQueries({ queryKey: ["/connection/config"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update API connection status",
        variant: "destructive",
      });
    },
  });
}

export function useTestConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      config,
    }: {
      id?: string;
      config?: Partial<IConnectSettingsForm>;
    }) => {
      const res = await ConnectApi.testConnection({
        id,
        config,
      });
      if (!res.data) {
        throw new Error(
          "Connection test failed. Please check your credentials."
        );
      }
      return {
        success: true,
        message: "Connection test successful!",
        testedAt: new Date(),
      };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connection test successful!",
      });
      queryClient.invalidateQueries({ queryKey: ["/connection/config"] });
    },
  });
}

export function useConnectToKiotViet() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const data = await ConnectApi.connectToKiotViet(id);

      return data;
    },
    onSuccess: ({ success, message }) => {
      toast({
        title: success ? "Success" : "Error",
        description: success ? "Connected to KiotViet successfully" : message,
        variant: success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect to KiotViet",
        variant: "destructive",
      });
    },
  });
}
