/**
 * Hooks exports
 *
 * This file provides a centralized export point for all custom hooks.
 * Import hooks from this file for better organization and maintainability.
 *
 * @example
 * ```ts
 * import { useAuth, useAddToCart } from "@/hooks";
 * ```
 */

// Redux hooks
export { useAppDispatch, useAppSelector } from "./redux";

// Auth hooks
export { useAuth, useRequireAuth } from "./auth";
export type { AuthStatus, AuthContextValue } from "./auth";

// Cart hooks
export { useAddToCart } from "./cart";
export { useCartActions } from "./cart";
export { useCartInit } from "./cart";
export { useCartSync } from "./cart";
