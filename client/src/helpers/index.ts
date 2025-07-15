export const formatCurrency = (amount?: string | number) => {
  if (amount === undefined || amount === null) {
    return "0 VND";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(typeof amount === "string" ? parseInt(amount) : amount || 0);
};
