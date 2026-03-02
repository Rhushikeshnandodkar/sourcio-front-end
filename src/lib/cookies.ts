/**
 * Cookie utilities for client-side cookie access
 * Uses js-cookie library for reliable cookie handling
 */
import Cookies from "js-cookie";

/**
 * Get a cookie value by name
 * @param name - The name of the cookie
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  return Cookies.get(name) || null;
};

/**
 * Set a cookie value
 * @param name - The name of the cookie
 * @param value - The cookie value
 * @param days - Number of days until expiration (default: 7)
 */
export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof document === "undefined") {
    return;
  }

  Cookies.set(name, value, {
    expires: days,
    path: "/",
    sameSite: "lax",
  });
};

/**
 * Remove a cookie
 * @param name - The name of the cookie
 */
export const removeCookie = (name: string): void => {
  if (typeof document === "undefined") {
    return;
  }

  Cookies.remove(name, {
    path: "/",
  });
};
