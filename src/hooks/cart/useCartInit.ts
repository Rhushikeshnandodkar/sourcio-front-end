"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux";
import { useAuth } from "../auth";
import { fetchCartFromBackend, mergeCarts, syncCartToBackend } from "@/features/cart/cartThunks";
import { setCart } from "@/features/cart/cartSlice";

/**
 * Hook to initialize cart on app load
 * Fetches cart from backend if user is authenticated and merges with local cart
 */
export function useCartInit() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const localCart = useAppSelector((state) => state.cart.items);
  const lastSyncedAt = useAppSelector((state) => state.cart.lastSyncedAt);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Only fetch if we haven't synced recently (avoid duplicate fetches)
    // If lastSyncedAt is null, we haven't fetched yet
    if (lastSyncedAt !== null) {
      return;
    }

    // Fetch cart from backend
    const fetchAndMergeCart = async () => {
      try {
        const backendCart = await dispatch(fetchCartFromBackend()).unwrap();

        // If we have local cart items, merge them
        if (localCart.length > 0) {
          const mergedCart = mergeCarts(localCart, backendCart);
          dispatch(setCart(mergedCart));

          // Sync merged cart back to backend
          await dispatch(syncCartToBackend()).unwrap();
        } else {
          // No local cart, just use backend cart
          dispatch(setCart(backendCart));
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
        // Keep local cart if fetch fails
      }
    };

    fetchAndMergeCart();
  }, [isAuthenticated, authLoading, dispatch, localCart.length, lastSyncedAt]);
}
