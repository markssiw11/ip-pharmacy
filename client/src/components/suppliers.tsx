import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  Mail,
  MapPin,
  User,
  Building,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { Supplier } from "@shared/schema";
import { useDistributors } from "@/services";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  INACTIVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusIcons = {
  ACTIVE: CheckCircle,
  INACTIVE: XCircle,
};

const statusLabels = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Tạm dừng",
};

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading } = useDistributors();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Danh sách nhà cung cấp
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tổng cộng: {suppliers.length} nhà cung cấp
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => {
          const StatusIcon =
            statusIcons[supplier.status as keyof typeof statusIcons];
          const statusColor =
            statusColors[supplier.status as keyof typeof statusColors];
          const statusLabel =
            statusLabels[supplier.status as keyof typeof statusLabels];

          return (
            <Card
              key={supplier.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={supplier.avatar || ""}
                        alt={supplier.name}
                      />
                      <AvatarFallback className="text-sm font-medium">
                        {supplier.name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${statusColor} w-[120px]`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {supplier.contact_person && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {supplier.contact_person}
                      </span>
                    </div>
                  )}

                  {supplier.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {supplier.phone}
                      </span>
                    </div>
                  )}

                  {supplier.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {supplier.email}
                      </span>
                    </div>
                  )}

                  {supplier.address && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {supplier.address}
                      </span>
                    </div>
                  )}

                  {supplier.description && (
                    <>
                      <Separator />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {supplier.description}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Chưa có nhà cung cấp nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Danh sách nhà cung cấp hiện tại trống
          </p>
        </div>
      )}
    </div>
  );
}
