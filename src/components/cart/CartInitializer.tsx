"use client";

import { useCartInit } from "@/hooks/useCartInit";
import { useCartSync } from "@/hooks/useCartSync";

/**
 * Component to initialize cart and handle sync
 * Should be placed at the root of the app
 */
export function CartInitializer() {
  // Initialize cart on app load
  useCartInit();
  
  // Handle debounced sync
  useCartSync();
  
  return null;
}
