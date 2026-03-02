"use client";

import { useAppDispatch } from "../redux";
import { useAuth } from "../auth";
import { addToCart } from "@/features/cart/cartSlice";
import { addCartItem, syncCartToBackend } from "@/features/cart/cartThunks";
import { CartItem } from "@/features/cart/cartSlice";
import { toast } from "sonner";

/**
 * Hook to add items to cart
 * Automatically syncs with backend if user is authenticated
 */
export function useAddToCart() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  const addItemToCart = async (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
    try {
      if (isAuthenticated) {
        // User is authenticated - sync with backend immediately
        try {
          await dispatch(
            addCartItem({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity || 1,
            })
          ).unwrap();
          // Success - item added via API, cart is already synced
          return true;
        } catch (apiError) {
          // API call failed - log the error and fall back to local cart
          const apiErrorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
          console.error("API error adding to cart:", apiError);
          console.error("Error details:", {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity || 1,
            error: apiErrorMessage,
          });

          // Add to local cart as fallback
          dispatch(
            addToCart({
              ...item,
              quantity: item.quantity || 1,
            })
          );

          // Try to sync the local cart to backend
          // This will be handled by useCartSync, but we can trigger it immediately
          try {
            await dispatch(syncCartToBackend()).unwrap();
            toast.success("Item added to cart and synced");
            return true;
          } catch (syncError) {
            console.error("Sync error after fallback:", syncError);
            toast.warning("Item added to cart locally. Sync will retry automatically.");
            return true; // Still return true since item was added locally
          }
        }
      } else {
        // User is not authenticated - add to local cart only
        dispatch(
          addToCart({
            ...item,
            quantity: item.quantity || 1,
          })
        );
        return true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart";
      console.error("Unexpected error adding to cart:", error);
      toast.error(errorMessage);
      return false;
    }
  };

  return { addItemToCart };
}
