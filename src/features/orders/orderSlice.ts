import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order, OrderSummary } from "@/lib/orders-api";

interface OrderState {
  orders: OrderSummary[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  total: 0,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<OrderSummary[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<OrderSummary>) => {
      state.orders.unshift(action.payload);
      state.total += 1;
    },
    updateOrderInList: (state, action: PayloadAction<OrderSummary>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    removeOrder: (state, action: PayloadAction<number>) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
      state.total -= 1;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.total = 0;
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrderInList,
  removeOrder,
  setCurrentOrder,
  setLoading,
  setError,
  setTotal,
  clearOrders,
} = orderSlice.actions;

export default orderSlice.reducer;

