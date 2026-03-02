"use client";

import { useAppDispatch } from "../redux";
import { useAuth } from "../auth";
import { updateQuantity, removeFromCart } from "@/features/cart/cartSlice";
import { updateCartItem, removeCartItem } from "@/features/cart/cartThunks";
import { CartItem } from "@/features/cart/cartSlice";

/**
 * Hook to handle cart actions (update quantity, remove items)
 * Automatically syncs with backend if user is authenticated
 */
export function useCartActions() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  const updateItemQuantity = async (item: CartItem, newQuantity: number) => {
    try {
      if (isAuthenticated && item.backendId) {
        // User is authenticated and item has backend ID - sync with backend
        await dispatch(
          updateCartItem({
            backendItemId: item.backendId,
            quantity: newQuantity,
          })
        ).unwrap();
      } else {
        // User is not authenticated or item doesn't have backend ID - update local cart
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update cart item";
      console.error("Error updating cart item:", errorMessage);

      // If backend sync fails but user is authenticated, fall back to local cart
      if (isAuthenticated && item.backendId) {
        console.warn("Backend sync failed, updating local cart as fallback");
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
      }
      return false;
    }
  };

  const removeItem = async (item: CartItem) => {
    try {
      if (isAuthenticated && item.backendId) {
        // User is authenticated and item has backend ID - sync with backend
        await dispatch(removeCartItem(item.backendId)).unwrap();
      } else {
        // User is not authenticated or item doesn't have backend ID - remove from local cart
        dispatch(removeFromCart(item.id));
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove cart item";
      console.error("Error removing cart item:", errorMessage);

      // If backend sync fails but user is authenticated, fall back to local cart
      if (isAuthenticated && item.backendId) {
        console.warn("Backend sync failed, removing from local cart as fallback");
        dispatch(removeFromCart(item.id));
      }
      return false;
    }
  };

  return { updateItemQuantity, removeItem };
}
