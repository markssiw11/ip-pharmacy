import {
  ShoppingCart,
  Package,
  Users,
  Settings,
  RefreshCw,
  Database,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Quản lý chính",
      items: [
        {
          id: "purchase-orders",
          title: "Đơn đặt hàng",
          icon: ShoppingCart,
          description: "Quản lý đơn đặt hàng từ nhà cung cấp",
        },
        {
          id: "suppliers",
          title: "Nhà cung cấp",
          icon: Users,
          description: "Quản lý thông tin nhà cung cấp",
        },
      ],
    },
    {
      title: "Tích hợp KiotViet",
      items: [
        {
          id: "connection-settings",
          title: "Cài đặt kết nối",
          icon: Settings,
          description: "Cấu hình API KiotViet",
        },
        {
          id: "order-sync",
          title: "Đồng bộ đơn hàng",
          icon: RefreshCw,
          description: "Đồng bộ đơn hàng với KiotViet",
          badge: "Tự động",
        },
        {
          id: "inventory-sync",
          title: "Đồng bộ kho",
          icon: Database,
          description: "Quản lý tồn kho từ KiotViet",
        },
        // {
        //   id: "branch-sync",
        //   title: "Đồng bộ chi nhánh",
        //   icon: Package,
        //   description: "Quản lý danh sách chi nhánh KiotViet",
        // },
        // {
        //   id: "sync-logs",
        //   title: "Nhật ký đồng bộ",
        //   icon: FileText,
        //   description: "Theo dõi quá trình đồng bộ",
        // },
      ],
    },
    {
      title: "Báo cáo",
      items: [
        {
          id: "reports",
          title: "Báo cáo thống kê",
          icon: BarChart3,
          description: "Thống kê đơn hàng và doanh thu",
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-3 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-cover" />
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  IB Pharmacy
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Seller Portal
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {menuItems.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="mb-3 px-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative group"
                    title={isCollapsed ? item.title : ""}
                  >
                    <button
                      className={cn(
                        "w-full text-left rounded-lg transition-all duration-200 group relative",
                        isCollapsed ? "p-3" : "p-3",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      )}
                      onClick={() => onTabChange(item.id)}
                    >
                      {isCollapsed ? (
                        // Collapsed view - only icon
                        <div className="flex justify-center">
                          <Icon
                            className={cn(
                              "h-5 w-5 transition-colors",
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                            )}
                          />
                          {item.badge && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      ) : (
                        // Expanded view - icon + text
                        <div className="flex items-start space-x-3">
                          <Icon
                            className={cn(
                              "h-5 w-5 mt-0.5 flex-shrink-0 transition-colors",
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "font-medium text-sm truncate",
                                  isActive
                                    ? "text-white"
                                    : "text-gray-900 dark:text-gray-100"
                                )}
                              >
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant={isActive ? "secondary" : "outline"}
                                  className={cn(
                                    "text-xs ml-2 flex-shrink-0 border-0",
                                    isActive
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                  )}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-xs mt-1 leading-relaxed",
                                isActive
                                  ? "text-blue-100"
                                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                              )}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-lg"></div>
                      )}
                    </button>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                          {item.description}
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Đang hoạt động
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Phiên bản 1.0.0
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              © 2025 Pharmacy Portal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
