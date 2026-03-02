"use client";

import { ProductPageWrapper } from "@/components/products/ProductPageWrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  useOrdersPage,
  OrdersList,
  OrdersEmptyState,
  OrdersLoadingState,
  OrdersUnauthorizedState,
} from "@/features/orders";

export default function OrdersPage() {
  const { orders, loading, isAuthenticated } = useOrdersPage();

  if (!isAuthenticated) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <OrdersUnauthorizedState />
        </div>
      </ProductPageWrapper>
    );
  }

  return (
    <ProductPageWrapper>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Orders" },
          ]}
        />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-medium">My Orders</h1>
          </div>

          {loading && orders.length === 0 ? (
            <OrdersLoadingState />
          ) : orders.length === 0 ? (
            <OrdersEmptyState />
          ) : (
            <OrdersList orders={orders} />
          )}
        </div>
      </div>
    </ProductPageWrapper>
  );
}

