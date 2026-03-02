import { getToken, removeToken, REFRESH_TOKEN_COOKIE_NAME } from "./auth";
import { removeCookie } from "./cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";

export interface ShippingAddress {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  address2?: string | null;
  postal_code: string;
  company?: string | null;
  instructions?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type ShippingAddressCreateRequest = Omit<
  ShippingAddress,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type ShippingAddressUpdateRequest = Partial<ShippingAddressCreateRequest>;

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchShippingAddresses(): Promise<ShippingAddress[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipping`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data: ApiResponse<ShippingAddress[]> = await response.json();

  if (!response.ok) {
    // If 401, token is expired or invalid - clear it
    if (response.status === 401) {
      removeToken();
      removeCookie(REFRESH_TOKEN_COOKIE_NAME);
      throw new Error("Session expired. Please log in again.");
    }
    const message = data?.message || "Failed to load shipping addresses";
    throw new Error(message);
  }

  return data.data || [];
}

export async function createShippingAddress(
  payload: ShippingAddressCreateRequest
): Promise<ShippingAddress> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipping`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data: ApiResponse<ShippingAddress> = await response.json();

  if (!response.ok || data.status !== "success") {
    // If 401, token is expired or invalid - clear it
    if (response.status === 401) {
      removeToken();
      removeCookie(REFRESH_TOKEN_COOKIE_NAME);
      throw new Error("Session expired. Please log in again.");
    }
    const message = data?.message || "Failed to create shipping address";
    throw new Error(message);
  }

  return data.data;
}

export async function updateShippingAddress(
  id: number,
  payload: ShippingAddressUpdateRequest
): Promise<ShippingAddress> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipping/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data: ApiResponse<ShippingAddress> = await response.json();

  if (!response.ok || data.status !== "success") {
    // If 401, token is expired or invalid - clear it
    if (response.status === 401) {
      removeToken();
      removeCookie(REFRESH_TOKEN_COOKIE_NAME);
      throw new Error("Session expired. Please log in again.");
    }
    const message = data?.message || "Failed to update shipping address";
    throw new Error(message);
  }

  return data.data;
}

export async function deleteShippingAddress(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/shipping/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    // If 401, token is expired or invalid - clear it
    if (response.status === 401) {
      removeToken();
      removeCookie(REFRESH_TOKEN_COOKIE_NAME);
      throw new Error("Session expired. Please log in again.");
    }
    const data = await response.json().catch(() => ({}));
    const message = data?.message || "Failed to delete shipping address";
    throw new Error(message);
  }
}

