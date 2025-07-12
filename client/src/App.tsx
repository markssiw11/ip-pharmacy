import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { LoginForm } from "@/components/login-form";
import { DashboardHeader } from "@/components/dashboard-header";
import { AppSidebar } from "@/components/app-sidebar";
import { PurchaseOrderList } from "@/components/purchase-order-list";
import { ConnectionSettings } from "@/components/connection-settings";
import { OrderSync } from "@/components/order-sync";
import { InventorySync } from "@/components/inventory-sync";

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState("purchase-orders");

  const renderContent = () => {
    switch (activeTab) {
      case "purchase-orders":
        return <PurchaseOrderList />;
      case "connection-settings":
        return <ConnectionSettings />;
      case "order-sync":
        return <OrderSync />;
      case "inventory-sync":
        return <InventorySync />;
      case "sync-logs":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Nhật ký đồng bộ
              </h1>
              <p className="text-muted-foreground">
                Theo dõi quá trình đồng bộ dữ liệu với KiotViet
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </div>
          </div>
        );
      case "suppliers":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quản lý nhà cung cấp
              </h1>
              <p className="text-muted-foreground">
                Quản lý thông tin nhà cung cấp và đối tác
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Báo cáo thống kê
              </h1>
              <p className="text-muted-foreground">
                Thống kê đơn hàng và doanh thu
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </div>
          </div>
        );
      default:
        return <PurchaseOrderList />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-6 max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
