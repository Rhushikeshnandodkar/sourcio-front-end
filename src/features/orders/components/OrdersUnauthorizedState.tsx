/**
 * OrdersUnauthorizedState Component
 * Single Responsibility: Displays unauthorized state when user is not logged in
 */
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function OrdersUnauthorizedState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-6" />
      <h2 className="text-2xl font-bold mb-2">Please Login</h2>
      <p className="text-muted-foreground mb-6">
        You need to be logged in to view your orders
      </p>
      <Link href="/login" className="text-primary hover:underline">
        Login
      </Link>
    </div>
  );
}

