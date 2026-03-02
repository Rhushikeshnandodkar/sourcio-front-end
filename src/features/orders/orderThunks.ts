import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/components/providers/ReduxProvider";
import {
  getUserOrders,
  getOrderById,
  Order,
  OrderSummary,
} from "@/lib/orders-api";
import {
  setOrders,
  setCurrentOrder,
  setLoading,
  setError,
  setTotal,
} from "./orderSlice";

/**
 * Fetch user's orders
 */
export const fetchUserOrders = createAsyncThunk<
  { orders: OrderSummary[]; total: number },
  { skip?: number; limit?: number } | void,
  { dispatch: AppDispatch; state: RootState }
>(
  "orders/fetch",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const skip = params && typeof params === "object" ? params.skip : 0;
      const limit = params && typeof params === "object" ? params.limit : 100;
      const result = await getUserOrders(skip, limit);
      dispatch(setOrders(result.orders));
      dispatch(setTotal(result.total));
      dispatch(setLoading(false));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch order by ID
 */
export const fetchOrderById = createAsyncThunk<
  Order,
  number,
  { dispatch: AppDispatch; state: RootState }
>(
  "orders/fetchById",
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const order = await getOrderById(orderId);
      dispatch(setCurrentOrder(order));
      dispatch(setLoading(false));
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch order";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

