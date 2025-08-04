import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Search,
  RefreshCw,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useBranches, Branch } from "@/services/branches";
import { useAuth } from "./auth-provider";

export function BranchSync() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const pharmacyId = useMemo(() => {
    return user?.pharmacies?.[0]?.id;
  }, [user?.pharmacies]);

  const {
    branches,
    stats,
    isLoading,
    isInitialLoading,
    syncBranch,
    syncAllBranches,
    filterBranches,
  } = useBranches({
    pharmacyId,
    source: "KIOTVIET",
  });

  const filteredBranches = filterBranches(searchTerm);

  const getStatusBadge = (status: Branch["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Hoạt động
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 border-red-200"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Không hoạt động
          </Badge>
        );
      case "syncing":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Đang đồng bộ
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatLastSync = (lastSync: string) => {
    const date = new Date(lastSync);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Đồng bộ chi nhánh
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý và đồng bộ danh sách chi nhánh từ KiotViet
          </p>
        </div>
        <Button
          onClick={syncAllBranches}
          disabled={isLoading || isInitialLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Đồng bộ tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tổng chi nhánh
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hoạt động
                </p>
                <p className="text-xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đang đồng bộ
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {stats.syncing}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chi nhánh</CardTitle>
          <CardDescription>
            Quản lý thông tin và trạng thái đồng bộ của các chi nhánh
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInitialLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Đang tải danh sách chi nhánh...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm chi nhánh theo tên hoặc địa chỉ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chi nhánh</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Nguồn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Lần đồng bộ cuối</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {branch.name}
                              </div>
                              {branch.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  Chi nhánh chính
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                            {branch.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{branch.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {branch.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(branch.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatLastSync(branch.lastSync)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncBranch(branch.id)}
                            disabled={branch.status === "syncing"}
                            className="h-8"
                          >
                            {branch.status === "syncing" ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {stats.total === 0 && !isInitialLoading && (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Chưa có chi nhánh nào được đồng bộ từ KiotViet.
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Nhấn "Đồng bộ tất cả" để tải chi nhánh từ KiotViet.
                  </p>
                </div>
              )}

              {filteredBranches.length === 0 && stats.total > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Không tìm thấy chi nhánh nào phù hợp với từ khóa tìm kiếm.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
