/**
 * Quotes API client for backend integration
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

export interface QuoteItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  price: string | number;
  requires_custom_price: boolean;
  quantity: number;
  image: string | null;
  gst_rate?: number | null;
  item_total?: number | string | null;
  tax_amount?: number | string | null;
  item_total_with_tax?: number | string | null;
  created_at: string;
}

export interface Quote {
  id: number;
  quote_number: string;
  user_id: number;
  status: "draft" | "pending" | "approved" | "rejected" | "expired";
  expires_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  subtotal: string | number | null;
  total_tax?: string | number | null;
  total: string | number | null;
  tax_breakdown?: Record<string, number | string> | null;
  has_custom_pricing?: boolean;
  items: QuoteItem[];
  created_at: string;
  updated_at: string;
}

export interface QuoteSummary {
  id: number;
  quote_number: string;
  user_id: number;
  status: "draft" | "pending" | "approved" | "rejected" | "expired";
  expires_at: string | null;
  subtotal: string | number | null;
  total: string | number | null;
  has_custom_pricing?: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuoteCreateRequest {
  notes?: string;
  expires_at?: string;
}

export interface QuoteUpdateRequest {
  status?: string;
  notes?: string;
  expires_at?: string;
}

export interface AdminQuoteUpdateRequest {
  status?: string;
  admin_notes?: string;
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
 * Create a quote from cart
 */
export async function createQuote(data?: QuoteCreateRequest): Promise<Quote> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to create quote: ${response.statusText}`);
    }

    const result: APIResponse<Quote> = await response.json();

    if (result.status === "success" && result.data) {
      return result.data;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error creating quote:", error);
    throw error;
  }
}

/**
 * Get user's quotes with pagination
 */
export async function getUserQuotes(skip: number = 0, limit: number = 100): Promise<{ quotes: QuoteSummary[]; total: number }> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes?skip=${skip}&limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to fetch quotes: ${response.statusText}`);
    }

    const result: APIResponse<{
      quotes: QuoteSummary[];
      total: number;
      skip: number;
      limit: number;
    }> = await response.json();

    if (result.status === "success" && result.data) {
      return {
        quotes: result.data.quotes,
        total: result.data.total,
      };
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error fetching quotes:", error);
    throw error;
  }
}

/**
 * Get quote by ID
 */
export async function getQuoteById(quoteId: number): Promise<Quote> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to fetch quote: ${response.statusText}`);
    }

    const result: APIResponse<Quote> = await response.json();

    if (result.status === "success" && result.data) {
      return result.data;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
}

/**
 * Update quote
 */
export async function updateQuote(quoteId: number, data: QuoteUpdateRequest): Promise<Quote> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to update quote: ${response.statusText}`);
    }

    const result: APIResponse<Quote> = await response.json();

    if (result.status === "success" && result.data) {
      return result.data;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error updating quote:", error);
    throw error;
  }
}

/**
 * Delete quote
 */
export async function deleteQuote(quoteId: number): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || `Failed to delete quote: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting quote:", error);
    throw error;
  }
}

/**
 * Get PDF URL for quote
 */
export function getQuotePdfUrl(quoteId: number, download: boolean = false): string {
  return `${API_BASE_URL}/api/v1/quotes/${quoteId}/pdf${download ? "?download=true" : ""}`;
}
