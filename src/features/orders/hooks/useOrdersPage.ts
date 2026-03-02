/**
 * useOrdersPage Hook
 * Single Responsibility: Manages orders page state and data fetching logic
 */
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/components/providers/ReduxProvider";
import { fetchUserOrders } from "../orderThunks";
import { useAuth } from "@/hooks/useAuth";

export function useOrdersPage() {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const loading = useSelector((state: RootState) => state.orders.loading);
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders() as any);
    }
  }, [isAuthenticated, dispatch]);

  return {
    orders,
    loading,
    isAuthenticated,
  };
}

