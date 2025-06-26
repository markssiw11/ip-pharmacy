import {
  getInventoryStats,
  getInventoryWithProducts,
  mockOrders,
  mockSyncLogs,
} from "@/lib/mock-data";
import { InsertApiCredentials } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Simulate API delays for realistic UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

export function useOrders() {
  return useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      await delay(1000);
      return mockOrders;
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

export function useSyncLogs() {
  return useQuery({
    queryKey: ["/api/sync-logs"],
    queryFn: async () => {
      await delay(500);
      return mockSyncLogs;
    },
  });
}
