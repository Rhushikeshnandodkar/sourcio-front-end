import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/components/providers/ReduxProvider";
import {
  fetchCart,
  bulkUpdateCart,
  addCartItem as addCartItemAPI,
  updateCartItem as updateCartItemAPI,
  removeCartItem as removeCartItemAPI,
  clearCart as clearCartAPI,
} from "@/lib/cart-api";
import { CartItem } from "./cartSlice";
import {
  setCart,
  setSyncing,
  setSyncError,
  setLastSyncedAt,
  setPendingSync,
} from "./cartSlice";

/**
 * Merge two carts by combining items and summing quantities for duplicates
 */
export function mergeCarts(localCart: CartItem[], backendCart: CartItem[]): CartItem[] {
  // Create a map of backend cart items by productId-variantId
  const backendMap = new Map<string, CartItem>();
  backendCart.forEach((item) => {
    backendMap.set(item.id, item);
  });

  // Create a map for merged items
  const mergedMap = new Map<string, CartItem>();

  // Process local cart items
  localCart.forEach((localItem) => {
    const backendItem = backendMap.get(localItem.id);
    
    if (backendItem) {
      // Item exists in both - sum quantities
      mergedMap.set(localItem.id, {
        ...localItem,
        quantity: localItem.quantity + backendItem.quantity,
        // Prefer backend data for price/image (more up-to-date)
        price: backendItem.price,
        image: backendItem.image || localItem.image,
        productName: backendItem.productName,
        variantName: backendItem.variantName || localItem.variantName,
      });
      // Remove from backend map so we don't add it again
      backendMap.delete(localItem.id);
    } else {
      // Item only in local cart - add it
      mergedMap.set(localItem.id, localItem);
    }
  });

  // Add remaining backend items (not in local cart)
  backendCart.forEach((backendItem) => {
    if (!mergedMap.has(backendItem.id)) {
      mergedMap.set(backendItem.id, backendItem);
    }
  });

  return Array.from(mergedMap.values());
}

/**
 * Fetch cart from backend
 */
export const fetchCartFromBackend = createAsyncThunk<
  CartItem[],
  void,
  { dispatch: AppDispatch; state: RootState }
>("cart/fetchFromBackend", async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setSyncing(true));
    const cartItems = await fetchCart();
    dispatch(setCart(cartItems));
    dispatch(setLastSyncedAt(Date.now()));
    return cartItems;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch cart";
    dispatch(setSyncError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

/**
 * Sync current cart state to backend
 */
export const syncCartToBackend = createAsyncThunk<
  CartItem[],
  void,
  { dispatch: AppDispatch; state: RootState }
>("cart/syncToBackend", async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    dispatch(setSyncing(true));
    const state = getState();
    const cartItems = state.cart.items;

    // Sync entire cart using bulk update
    const syncedItems = await bulkUpdateCart(cartItems);
    
    dispatch(setCart(syncedItems));
    dispatch(setLastSyncedAt(Date.now()));
    return syncedItems;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to sync cart";
    dispatch(setSyncError(errorMessage));
    dispatch(setPendingSync(true)); // Mark as pending for retry
    return rejectWithValue(errorMessage);
  }
});

/**
 * Add item to cart and sync to backend
 */
export const addCartItem = createAsyncThunk<
  CartItem[],
  { productId: string; variantId: string | null; quantity?: number },
  { dispatch: AppDispatch; state: RootState }
>(
  "cart/addItem",
  async ({ productId, variantId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSyncing(true));
      const cartItems = await addCartItemAPI(productId, variantId, quantity);
      dispatch(setCart(cartItems));
      dispatch(setLastSyncedAt(Date.now()));
      return cartItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart";
      dispatch(setSyncError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update cart item quantity and sync to backend
 */
export const updateCartItem = createAsyncThunk<
  CartItem[],
  { backendItemId: number; quantity: number },
  { dispatch: AppDispatch; state: RootState }
>(
  "cart/updateItem",
  async ({ backendItemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSyncing(true));
      const cartItems = await updateCartItemAPI(backendItemId, quantity);
      dispatch(setCart(cartItems));
      dispatch(setLastSyncedAt(Date.now()));
      return cartItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update cart item";
      dispatch(setSyncError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Remove cart item and sync to backend
 */
export const removeCartItem = createAsyncThunk<
  CartItem[],
  number,
  { dispatch: AppDispatch; state: RootState }
>("cart/removeItem", async (backendItemId, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setSyncing(true));
    const cartItems = await removeCartItemAPI(backendItemId);
    dispatch(setCart(cartItems));
    dispatch(setLastSyncedAt(Date.now()));
    return cartItems;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to remove cart item";
    dispatch(setSyncError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

/**
 * Clear cart and sync to backend
 */
export const clearCart = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>("cart/clear", async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setSyncing(true));
    await clearCartAPI();
    dispatch(setCart([]));
    dispatch(setLastSyncedAt(Date.now()));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to clear cart";
    dispatch(setSyncError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});
