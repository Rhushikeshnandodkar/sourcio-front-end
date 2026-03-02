/**
 * OrdersList Component
 * Single Responsibility: Displays a grid of order cards
 */
"use client";

import { OrderSummary } from "@/lib/orders-api";
import { OrderCard } from "./OrderCard";

interface OrdersListProps {
  orders: OrderSummary[];
}

export function OrdersList({ orders }: OrdersListProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

