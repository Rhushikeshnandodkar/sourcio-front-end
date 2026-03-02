/**
 * OrdersEmptyState Component
 * Single Responsibility: Displays empty state when user has no orders
 */
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-6" />
      <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
      <p className="text-muted-foreground mb-6">
        Place an order from an approved quote to get started
      </p>
      <Link href="/quotes" className="text-primary hover:underline">
        View Quotes
      </Link>
    </div>
  );
}

