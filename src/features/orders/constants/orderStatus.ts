/**
 * Order status constants and mappings
 * Single Responsibility: Manages order status display configuration
 */

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/**
 * Get the color class for an order status
 */
export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status as OrderStatus] || "bg-gray-500";
}

/**
 * Get the display label for an order status
 */
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] || status;
}

