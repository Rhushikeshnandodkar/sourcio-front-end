"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux";
import { useAuth } from "../auth";
import { syncCartToBackend } from "@/features/cart/cartThunks";
import { setPendingSync } from "@/features/cart/cartSlice";
import { toast } from "sonner";

/**
 * Hook to sync cart to backend with debouncing
 * Watches cart changes and syncs when user is authenticated
 * Only syncs when cart changes come from local actions, not API responses
 */
export function useCartSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isSyncing = useAppSelector((state) => state.cart.isSyncing);
  const lastSyncedAt = useAppSelector((state) => state.cart.lastSyncedAt);
  const pendingSync = useAppSelector((state) => state.cart.pendingSync);
  const syncError = useAppSelector((state) => state.cart.syncError);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousCartRef = useRef<string>("");
  const lastSyncedAtRef = useRef<number | null>(null);

  // Serialize cart items for comparison
  const cartKey = JSON.stringify(
    cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }))
  );

  // Update previousCartRef immediately when lastSyncedAt changes
  // This prevents syncing when cart changes come from API responses
  useEffect(() => {
    if (lastSyncedAt && lastSyncedAt !== lastSyncedAtRef.current && !syncError) {
      // Cart was just synced from API, update the reference to prevent duplicate sync
      previousCartRef.current = cartKey;
      lastSyncedAtRef.current = lastSyncedAt;
    }
  }, [lastSyncedAt, syncError, cartKey]);

  useEffect(() => {
    // Only sync if user is authenticated
    if (!isAuthenticated) {
      // Reset reference when user logs out
      previousCartRef.current = "";
      lastSyncedAtRef.current = null;
      return;
    }

    // Don't sync if already syncing
    if (isSyncing) {
      return;
    }

    // Check if cart has changed
    if (cartKey === previousCartRef.current) {
      return;
    }

    // If lastSyncedAt was just updated in the previous effect, don't sync
    // This prevents syncing when cart changes come from API responses
    if (lastSyncedAt && lastSyncedAt === lastSyncedAtRef.current) {
      // The first effect should have updated previousCartRef, but if it hasn't run yet,
      // update it here to prevent duplicate sync
      if (previousCartRef.current !== cartKey) {
        previousCartRef.current = cartKey;
      }
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set pending sync
    dispatch(setPendingSync(true));

    // Debounce sync (500ms delay)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await dispatch(syncCartToBackend()).unwrap();
        // previousCartRef will be updated by the lastSyncedAt effect
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to sync cart";
        console.error("Cart sync error:", errorMessage);
        // Don't show toast for every sync error to avoid spam
        // Only show if it's a persistent error
        if (pendingSync) {
          toast.error("Failed to sync cart. Changes will be saved when you're online.");
        }
      }
    }, 500);

    // Cleanup on unmount or when cart changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cartKey, isAuthenticated, isSyncing, dispatch, pendingSync, lastSyncedAt]);

  // Handle pending sync retry
  useEffect(() => {
    if (pendingSync && !isSyncing && isAuthenticated) {
      // Retry sync after a delay
      const retryTimer = setTimeout(() => {
        dispatch(syncCartToBackend());
      }, 2000);

      return () => clearTimeout(retryTimer);
    }
  }, [pendingSync, isSyncing, isAuthenticated, dispatch]);
}
