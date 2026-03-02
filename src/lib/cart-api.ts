/**
 * Cart API client for backend integration
 */
import { getToken } from "./auth";
import { CartItem } from "@/features/cart/cartSlice";

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

interface CartItemResponse {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  price: string | number | null;
  image: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

interface CartResponse {
  items: CartItemResponse[];
  total_items: number;
  total_price: string | number;
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
 * Convert backend cart item to frontend cart item
 */
function mapCartItemToFrontend(item: CartItemResponse): CartItem {
  const variantId = item.variant_id ? String(item.variant_id) : null;
  const id = variantId ? `${item.product_id}-${variantId}` : `${item.product_id}-base`;
  
  // Handle price: backend sends 0 for custom pricing (null prices)
  // Convert 0 to null for frontend display as "Request for Quote"
  let price: number | null = null;
  if (item.price != null) {
    const numericPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    // If price is 0, treat it as null (custom pricing)
    price = numericPrice === 0 ? null : numericPrice;
  }
  
  return {
    id,
    productId: String(item.product_id),
    variantId,
    productName: item.product_name,
    variantName: item.variant_name || undefined,
    price: price,
    image: item.image || undefined,
    quantity: item.quantity,
    backendId: item.id, // Store backend cart item ID
  };
}

/**
 * Fetch user's cart from backend
 */
export async function fetchCart(): Promise<CartItem[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch cart: ${response.statusText}`);
    }

    const data: APIResponse<CartResponse> = await response.json();
    
    if (data.status === "success" && data.data) {
      return data.data.items.map(mapCartItemToFrontend);
    }
    
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addCartItem(
  productId: string,
  variantId: string | null,
  quantity: number = 1
): Promise<CartItem[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: parseInt(productId),
        variant_id: variantId ? parseInt(variantId) : null,
        quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add item to cart: ${response.statusText}`);
    }

    const data: APIResponse<CartResponse> = await response.json();
    
    if (data.status === "success" && data.data) {
      return data.data.items.map(mapCartItemToFrontend);
    }
    
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error adding item to cart:", error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: number,
  quantity: number
): Promise<CartItem[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/${itemId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update cart item: ${response.statusText}`);
    }

    const data: APIResponse<CartResponse> = await response.json();
    
    if (data.status === "success" && data.data) {
      return data.data.items.map(mapCartItemToFrontend);
    }
    
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: number): Promise<CartItem[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/${itemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to remove cart item: ${response.statusText}`);
    }

    const data: APIResponse<CartResponse> = await response.json();
    
    if (data.status === "success" && data.data) {
      return data.data.items.map(mapCartItemToFrontend);
    }
    
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to clear cart: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

/**
 * Bulk update cart (sync entire cart)
 */
export async function bulkUpdateCart(items: CartItem[]): Promise<CartItem[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const bulkItems = items.map((item) => ({
      product_id: parseInt(item.productId),
      variant_id: item.variantId ? parseInt(item.variantId) : null,
      quantity: item.quantity,
    }));

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ items: bulkItems }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to sync cart: ${response.statusText}`);
    }

    const data: APIResponse<CartResponse> = await response.json();
    
    if (data.status === "success" && data.data) {
      return data.data.items.map(mapCartItemToFrontend);
    }
    
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Error syncing cart:", error);
    throw error;
  }
}
