import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConnectApi } from "./connect.api";
import { IConnectSettingsForm } from "./connect.type";

export const useApiConfig = () => {
  return useQuery({
    queryKey: ["/connection/config"],
    queryFn: async () => {
      const res = await ConnectApi.getConnect();
      return res.data;
    },
    retry: 3,
  });
};

export function useTestConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: IConnectSettingsForm) => {
      const res = await ConnectApi.checkConnect(credentials);
      console.log("Connection test response:", res.data);
      if (!res.data.connection) {
        throw new Error("Connection failed. Please check your credentials.");
      }
      return {
        success: true,
        message: "Connection test successful!",
        testedAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection/status"] });
    },
  });
}

export function useToggleApiConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await ConnectApi.updateIsActive(enabled);
      return { enabled };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/connection/isActive"] });
    },
  });
}
