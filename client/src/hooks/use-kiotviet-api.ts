import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { mockOrders, mockInventory, mockProducts, mockSyncLogs, getInventoryWithProducts, getInventoryStats } from "@/lib/mock-data";
import { InsertApiCredentials } from "@shared/schema";

// Simulate API delays for realistic UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useApiConnection() {
  return useQuery({
    queryKey: ["/api/connection/status"],
    queryFn: async () => {
      await delay(500);
      return {
        isConnected: true,
        lastTested: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      };
    },
  });
}

export function useTestConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: InsertApiCredentials) => {
      await delay(2000);
      
      // Simulate connection test
      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error("Client ID and Client Secret are required");
      }
      
      return {
        success: true,
        message: "Connection test successful!",
        testedAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connection/status"] });
    },
  });
}

export function useToggleApiConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      await delay(500);
      return { enabled };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connection/status"] });
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      await delay(1000);
      return mockOrders;
    },
  });
}

export function useOrderSync() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await delay(3000);
      return {
        success: true,
        recordsCount: 47,
        syncedAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync-logs"] });
    },
  });
}

export function useInventory(selectedBranch?: string) {
  return useQuery({
    queryKey: ["/api/inventory", selectedBranch],
    queryFn: async () => {
      await delay(1000);
      return getInventoryWithProducts(selectedBranch);
    },
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ["/api/inventory/stats"],
    queryFn: async () => {
      await delay(500);
      return getInventoryStats();
    },
  });
}

export function useInventorySync() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await delay(3000);
      return {
        success: true,
        recordsCount: 1247,
        syncedAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync-logs"] });
    },
  });
}

export function useSyncLogs() {
  return useQuery({
    queryKey: ["/api/sync-logs"],
    queryFn: async () => {
      await delay(500);
      return mockSyncLogs;
    },
  });
}
