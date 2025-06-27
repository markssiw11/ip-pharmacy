import { IOrderData } from "@/services/order";
import React from "react";

interface OrderDetailProps extends IOrderData {}
const OrderDetail: React.FC<OrderDetailProps> = ({
  id,
  code,
  pos_id,
  purchase_date,
  branch_name,
  sold_by_name,
  customer_name,
  customer_code,
  total = 0,
  status_value,
  invoice_details,
}) => {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-primary">
        Chi tiết đơn hàng
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium">Mã đơn hàng:</p>
          <p>{code}</p>
        </div>
        <div>
          <p className="font-medium">Ngày mua:</p>
          <p>{new Date(purchase_date).toLocaleDateString("vi-VN")}</p>
        </div>
        <div>
          <p className="font-medium">Chi nhánh:</p>
          <p>{branch_name}</p>
        </div>
        <div>
          <p className="font-medium">Nhân viên bán hàng:</p>
          <p>{sold_by_name}</p>
        </div>
        <div>
          <p className="font-medium">Khách hàng:</p>
          <p>
            {customer_name} (Mã KH: {customer_code})
          </p>
        </div>
        <div>
          <p className="font-medium">Tổng tiền:</p>
          <p>
            {total.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
        </div>
        <div>
          <p className="font-medium">Trạng thái:</p>
          <p>{status_value}</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3 text-primary">
          Chi tiết sản phẩm
        </h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Mã SP
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Tên sản phẩm
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Danh mục
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Số lượng
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Giá
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Giảm giá
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {(invoice_details || []).map((item) => (
                <tr key={item.product_id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.product_code}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.product_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.category_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {item.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {item.discount}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {item.sub_total.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
