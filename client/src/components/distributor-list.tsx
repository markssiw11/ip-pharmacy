import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDistributors,
  useDeleteDistributor,
  useToggleDistributorStatus,
  IDistributor,
} from "@/services/distributors";
import { useDebounce } from "@/hooks/use-debounce";

interface DistributorListProps {
  onCreateNew?: () => void;
  onEdit?: (distributor: IDistributor) => void;
}

export function DistributorList({ onCreateNew, onEdit }: DistributorListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] =
    useState<IDistributor | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, error } = useDistributors({
    search: debouncedSearch || undefined,
    status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as "active" | "inactive"),
    page,
    limit: 20,
  });

  const deleteDistributorMutation = useDeleteDistributor();
  const toggleStatusMutation = useToggleDistributorStatus();

  const distributors = data?.distributors || [];
  const total = data?.total || 0;

  const handleDelete = async () => {
    if (selectedDistributor) {
      await deleteDistributorMutation.mutateAsync(selectedDistributor.id);
      setDeleteDialogOpen(false);
      setSelectedDistributor(null);
    }
  };

  const handleToggleStatus = async (distributor: IDistributor) => {
    await toggleStatusMutation.mutateAsync(distributor.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Có lỗi xảy ra khi tải danh sách nhà phân phối
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách nhà phân phối</CardTitle>
            {onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm mới
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nhà phân phối</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Người liên hệ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : distributors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Không có nhà phân phối nào
                    </TableCell>
                  </TableRow>
                ) : (
                  distributors.map((distributor) => (
                    <TableRow key={distributor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{distributor.name}</div>
                          {distributor.tax_code && (
                            <div className="text-sm text-gray-500">
                              MST: {distributor.tax_code}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{distributor.email}</div>
                          <div className="text-gray-500">
                            {distributor.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[200px] truncate">
                          {distributor.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {distributor.contact_person && (
                            <div>{distributor.contact_person}</div>
                          )}
                          {distributor.contact_phone && (
                            <div className="text-gray-500">
                              {distributor.contact_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            distributor.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {distributor.status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(distributor.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(distributor)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(distributor)}
                              disabled={toggleStatusMutation.isPending}
                            >
                              <Power className="w-4 h-4 mr-2" />
                              {distributor.status === "active"
                                ? "Vô hiệu hóa"
                                : "Kích hoạt"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDistributor(distributor);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Hiển thị {(page - 1) * 20 + 1} - {Math.min(page * 20, total)}{" "}
                của {total} kết quả
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * 20 >= total}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhà phân phối "
              {selectedDistributor?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteDistributorMutation.isPending}
            >
              {deleteDistributorMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
