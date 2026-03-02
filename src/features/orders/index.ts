/**
 * Orders Feature Barrel Export
 * Single Responsibility: Provides centralized exports for the orders feature
 */

// Components
export { OrderCard } from "./components/OrderCard";
export { OrdersList } from "./components/OrdersList";
export { OrdersEmptyState } from "./components/OrdersEmptyState";
export { OrdersLoadingState } from "./components/OrdersLoadingState";
export { OrdersUnauthorizedState } from "./components/OrdersUnauthorizedState";

// Hooks
export { useOrdersPage } from "./hooks/useOrdersPage";

// Utils
export { formatOrderDate, formatOrderPrice } from "./utils/orderFormatters";

// Constants
export {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  getOrderStatusColor,
  getOrderStatusLabel,
  type OrderStatus,
} from "./constants/orderStatus";

// Redux
export { default as orderReducer } from "./orderSlice";
export * from "./orderSlice";
export * from "./orderThunks";

