import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

export interface CartItem {
  id: string; // unique: productId-variantId or productId-base
  productId: string;
  variantId: string | null;
  productName: string;
  variantName?: string;
  price: number | null; // null for products that require quote
  image?: string;
  quantity: number;
  backendId?: number; // Backend cart item ID (for authenticated users)
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  // Sync state
  isSyncing: boolean;
  lastSyncedAt: number | null; // timestamp
  syncError: string | null;
  pendingSync: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,
  pendingSync: false,
};

// Helper function to calculate totals
function calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  const totalItems = items.length; // Count of unique items, not total quantity
  const totalPrice = items.reduce((sum, item) => {
    // Only add price if it's not null and greater than 0 (0 means custom pricing)
    const itemPrice = (item.price != null && item.price > 0) ? item.price : 0;
    return sum + itemPrice * item.quantity;
  }, 0);
  return { totalItems, totalPrice };
}

// Helper function to generate cart item ID
function generateCartItemId(productId: string, variantId: string | null): string {
  return variantId ? `${productId}-${variantId}` : `${productId}-base`;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "id" | "quantity"> & { quantity?: number }>) => {
      const { productId, variantId, productName, variantName, price, image } = action.payload;
      const quantity = action.payload.quantity || 1;
      const id = generateCartItemId(productId, variantId);

      // Check if item already exists
      const existingItemIndex = state.items.findIndex((item) => item.id === id);

      if (existingItemIndex >= 0) {
        // Increment quantity if item exists
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        state.items.push({
          id,
          productId,
          variantId,
          productName,
          variantName,
          price,
          image,
          quantity,
        });
      }

      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      // Remove item by id
      state.items = state.items.filter((item) => item.id !== action.payload);
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter((item) => item.id !== id);
        } else {
          item.quantity = quantity;
        }

        // Recalculate totals
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
    // Sync actions
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
      if (action.payload) {
        state.syncError = null;
      }
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.syncError = action.payload;
      state.isSyncing = false;
    },
    setLastSyncedAt: (state, action: PayloadAction<number | null>) => {
      state.lastSyncedAt = action.payload;
      state.isSyncing = false;
      state.syncError = null;
      state.pendingSync = false;
    },
    setPendingSync: (state, action: PayloadAction<boolean>) => {
      state.pendingSync = action.payload;
    },
    // Set cart from backend
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      const totals = calculateTotals(action.payload);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
  },
  extraReducers: (builder) => {
    // Recalculate totals when state is rehydrated from localStorage
    // After REHYDRATE, state.items already contains the rehydrated items
    builder.addCase(REHYDRATE, (state) => {
      // Recalculate totals based on rehydrated items to ensure correctness
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setSyncing,
  setSyncError,
  setLastSyncedAt,
  setPendingSync,
  setCart,
} = cartSlice.actions;
export default cartSlice.reducer;
