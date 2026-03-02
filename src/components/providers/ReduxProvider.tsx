"use client";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";
import productReducer from "@/features/product/productSlice";
import cartReducer from "@/features/cart/cartSlice";
import quoteReducer from "@/features/quotes/quoteSlice";
import orderReducer from "@/features/orders/orderSlice";

// Persist configuration for cart
const cartPersistConfig = {
  key: "cart",
  storage,
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

const store = configureStore({
  reducer: {
    product: productReducer,
    cart: persistedCartReducer,
    quotes: quoteReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
