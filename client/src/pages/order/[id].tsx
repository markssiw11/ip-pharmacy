import { Header } from "@/components/header";
import OrderDetail from "@/components/OrderDetail";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useOrderById } from "@/services/order";
import React from "react";
import { useRoute } from "wouter";

const OrderDetailsPage = () => {
  const [_, params] = useRoute("/order/:id");
  const { data: order } = useOrderById(params?.id || "");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb className="mb-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>123333</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <OrderDetail {...(order as any)} />
      </main>
    </div>
  );
};

export default OrderDetailsPage;
