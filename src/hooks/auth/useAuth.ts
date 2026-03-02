"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../redux";
import { getCookie } from "@/lib/cookies";
import { getToken, TOKEN_KEY, REFRESH_TOKEN_COOKIE_NAME, login as loginApi, logout as logoutApi, refreshToken as refreshTokenApi } from "@/lib/auth";
import { isTokenExpired } from "@/lib/jwt";
import { fetchCartFromBackend, mergeCarts, syncCartToBackend } from "@/features/cart/cartThunks";
import { setCart, clearCart } from "@/features/cart/cartSlice";

export interface AuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  isExpired: boolean;
  hasToken: boolean;
}

export interface AuthContextValue extends AuthStatus {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

/**
 * React hook for authentication status and actions
 * Automatically checks token validity and expiration
 * Provides login and logout functions
 */
export const useAuth = (): AuthContextValue => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const localCart = useAppSelector((state) => state.cart.items);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    isLoading: true,
    isExpired: false,
    hasToken: false,
  });

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await refreshTokenApi();
      if (newToken) {
        // Token refreshed successfully
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    // Get token directly from cookie to check if it exists
    const rawToken = getCookie(TOKEN_KEY);
    const hasToken = rawToken !== null;

    // Get token using getToken() which handles expiration
    let token = getToken();

    // Only check expiration if we have a token
    let isExpired = false;
    if (rawToken) {
      try {
        isExpired = isTokenExpired(rawToken);
      } catch (error) {
        // If we can't check expiration, assume not expired
        isExpired = false;
      }
    }

    // If token is expired but we have a refresh token, try to refresh
    if (hasToken && isExpired && token === null) {
      const refreshTokenCookie = getCookie(REFRESH_TOKEN_COOKIE_NAME);
      if (refreshTokenCookie) {
        // Try to refresh the token
        const refreshed = await refreshToken();
        if (refreshed) {
          // Token refreshed successfully, get the new token
          token = getToken();
          isExpired = false;
        }
      }
    }

    // User is authenticated if they have a token and it's not expired
    // If we can't verify expiration, assume authenticated (let server verify)
    const authenticated = token !== null;

    setAuthStatus({
      isAuthenticated: authenticated,
      isLoading: false,
      isExpired,
      hasToken: token !== null,
    });

    // If token is expired and refresh failed, show notification
    if (hasToken && isExpired && !authenticated && !token) {
      toast.error("Your session has expired. Please log in again.");
    }
  }, [refreshToken]);

  useEffect(() => {
    checkAuth();

    // Check auth status periodically (every 5 minutes)
    const interval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuth]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      try {
        setAuthStatus((prev) => ({ ...prev, isLoading: true }));

        await loginApi(email, password);
        checkAuth();

        // Fetch backend cart and merge
        try {
          const backendCart = await dispatch(fetchCartFromBackend()).unwrap();

          if (localCart.length > 0) {
            // Merge carts
            const mergedCart = mergeCarts(localCart, backendCart);
            dispatch(setCart(mergedCart));

            // Sync merged cart to backend
            await dispatch(syncCartToBackend()).unwrap();
            toast.success("Login successful! Your cart has been synced.");
          } else {
            // No local cart, just use backend cart
            dispatch(setCart(backendCart));
            toast.success("Login successful!");
          }
        } catch (cartError) {
          // If cart sync fails, still allow login
          console.error("Cart sync error:", cartError);
          toast.success("Login successful!");
        }

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed. Please try again.";
        toast.error(message);
        return { success: false, message };
      } finally {
        setAuthStatus((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [checkAuth, dispatch, localCart]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthStatus((prev) => ({ ...prev, isLoading: true }));
      await logoutApi();
      // Clear the entire cart when logging out
      dispatch(clearCart());
      await checkAuth();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state and cart even if API call fails
      dispatch(clearCart());
      await checkAuth();
      router.push("/");
    } finally {
      setAuthStatus((prev) => ({ ...prev, isLoading: false }));
    }
  }, [checkAuth, router, dispatch]);

  return {
    ...authStatus,
    login,
    logout,
    refreshToken,
  };
};

/**
 * Hook that requires authentication and redirects if not authenticated
 */
export const useRequireAuth = (redirectTo?: string) => {
  const router = useRouter();
  const auth = useAuth();
  const hasRedirectedRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Wait for initial auth check to complete
    if (auth.isLoading) {
      return;
    }

    // Prevent multiple redirects
    if (hasRedirectedRef.current) {
      return;
    }

    // Redirect if not authenticated (either no token or expired token)
    const checkAndRedirect = (retryCount: number = 0) => {
      // Re-check token directly from cookie
      const token = getCookie(TOKEN_KEY);
      const refreshTokenCookie = getCookie(REFRESH_TOKEN_COOKIE_NAME);

      // If no token at all, redirect immediately
      if (!token) {
        if (retryCount < 3) {
          // Retry a few times to ensure cookies are available, especially after login redirect
          retryTimeoutRef.current = setTimeout(() => {
            checkAndRedirect(retryCount + 1);
          }, 150);
          return;
        }

        // No token after retries, redirect to login
        hasRedirectedRef.current = true;
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
        const redirectPath = redirectTo || currentPath;
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        return;
      }

      // If token exists but is expired and refresh token is also gone, redirect
      if (token && auth.isExpired && !refreshTokenCookie) {
        hasRedirectedRef.current = true;
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
        const redirectPath = redirectTo || currentPath;
        toast.error("Your session has expired. Please log in again.");
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        return;
      }

      // If not authenticated (refresh failed), redirect
      if (!auth.isAuthenticated && auth.isExpired) {
        hasRedirectedRef.current = true;
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
        const redirectPath = redirectTo || currentPath;
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      }
    };

    const timer = setTimeout(() => {
      checkAndRedirect();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [auth.isLoading, auth.isAuthenticated, auth.isExpired, auth.hasToken, router, redirectTo]);

  return auth;
};
