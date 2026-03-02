/**
 * Orders API client for backend integration
 */
import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";

/**
 * API Response types
 */
interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  price: string | number;
  quantity: number;
  image: string | null;
  gst_rate?: number | null;
  item_total?: number | string | null;
  tax_amount?: number | string | null;
  item_total_with_tax?: number | string | null;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  quote_id: number;
  user_id: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: string | number | null;
  total_tax?: string | number | null;
  total: string | number | null;
  tax_breakdown?: Record<string, number | string> | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderSummary {
  id: number;
  order_number: string;
  quote_id: number;
  user_id: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: string | number | null;
  total_tax?: string | number | null;
  total: string | number | null;
  tax_breakdown?: Record<string, number | string> | null;
  item_count: number;
  item_names?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface OrderCreateRequest {
  quote_id: number;
}

/**
 * Get authentication headers
 */
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Place an order from an approved quote
 */
export async function placeOrder(quoteId: number): Promise<Order> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quote_id: quoteId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `Failed to place order: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result: APIResponse<Order> = await response.json();

    if (result.status === "success" && result.data) {
      return result.data;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
}

/**
 * Get user's orders with pagination
 */
export async function getUserOrders(skip: number = 0, limit: number = 100): Promise<{ orders: OrderSummary[]; total: number }> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders?skip=${skip}&limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to fetch orders: ${response.statusText}`);
    }

    const result: APIResponse<{
      orders: OrderSummary[];
      total: number;
      skip: number;
      limit: number;
    }> = await response.json();

    if (result.status === "success" && result.data) {
      return {
        orders: result.data.orders,
        total: result.data.total,
      };
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: number): Promise<Order> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to fetch order: ${response.statusText}`);
    }

    const result: APIResponse<Order> = await response.json();

    if (result.status === "success" && result.data) {
      return result.data;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

/**
 * Download invoice PDF for an order
 */
export async function downloadOrderInvoice(orderId: number): Promise<Blob> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/invoice?download=true`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to download invoice: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
}

