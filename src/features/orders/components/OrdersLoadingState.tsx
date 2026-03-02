/**
 * OrdersLoadingState Component
 * Single Responsibility: Displays loading state while fetching orders
 */
"use client";

import { Loader2 } from "lucide-react";

export function OrdersLoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
      <div className="text-muted-foreground">Loading orders...</div>
    </div>
  );
}

