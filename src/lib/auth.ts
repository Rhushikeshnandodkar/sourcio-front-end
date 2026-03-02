/**
 * Authentication utilities
 */
import { getCookie, setCookie, removeCookie } from "./cookies";
import { isTokenExpired } from "./jwt";

export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get the authentication token from cookies
 * Returns null if token doesn't exist or is expired
 * @returns The token string or null
 */
export const getToken = (): string | null => {
  const token = getCookie(TOKEN_KEY);
  
  if (!token) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    // Optionally clear expired token
    return null;
  }

  return token;
};

/**
 * Set the authentication token in cookies
 * @param token - The token string
 * @param expiresInDays - Number of days until cookie expiration (default: 7)
 */
export const setToken = (token: string, expiresInDays: number = 7): void => {
  setCookie(TOKEN_KEY, token, expiresInDays);
};

/**
 * Remove the authentication token from cookies
 */
export const removeToken = (): void => {
  removeCookie(TOKEN_KEY);
};

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @throws Error if login fails
 */
export const login = async (email: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || "Login failed";
    throw new Error(errorMessage);
  }

  if (data.status === "success" && data.data?.access_token) {
    // Store the token in cookies
    setToken(data.data.access_token);
    // Refresh token is stored in HTTP-only cookie by the backend
  } else {
    throw new Error("Invalid response from server");
  }
};

/**
 * Get current user information
 * @returns User information object
 * @throws Error if request fails
 */
export interface UserInfo {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  category?: string | null;
  gst_number?: string | null;
  shipping_address1?: string | null;
  shipping_address2?: string | null;
  shipping_pin?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_country?: string | null;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface UserInfoResponse {
  status: string;
  message: string;
  data: UserInfo;
  timestamp: string;
}

export const getUserInfo = async (): Promise<UserInfo> => {
  const token = getToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data: UserInfoResponse = await response.json();

  if (!response.ok) {
    // If 401, token is expired or invalid - clear it
    if (response.status === 401) {
      removeToken();
      removeCookie(REFRESH_TOKEN_COOKIE_NAME);
      throw new Error("Session expired. Please log in again.");
    }
    const errorMessage = data?.message || "Failed to fetch user information";
    throw new Error(errorMessage);
  }

  if (data.status === "success" && data.data) {
    return data.data;
  } else {
    throw new Error("Invalid response from server");
  }
};

/**
 * Update user profile information
 * @param profileData - Profile update data
 * @throws Error if update fails
 */
export const updateUserProfile = async (profileData: {
  category?: string;
  gstNumber?: string;
  shippingAddress?: ShippingAddress;
}): Promise<UserInfo> => {
  const token = getToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  const body: any = {};
  
  if (profileData.category) {
    body.category = profileData.category;
  }
  
  if (profileData.gstNumber !== undefined) {
    body.gst_number = profileData.gstNumber || null;
  }
  
  if (profileData.shippingAddress) {
    body.shipping_address1 = profileData.shippingAddress.address1 || null;
    body.shipping_address2 = profileData.shippingAddress.address2 || null;
    body.shipping_pin = profileData.shippingAddress.pin || null;
    body.shipping_city = profileData.shippingAddress.city || null;
    body.shipping_state = profileData.shippingAddress.state || null;
    body.shipping_country = profileData.shippingAddress.country || null;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data: UserInfoResponse = await response.json();

  if (!response.ok) {
    // If 401, token is expired or invalid - clear it
    if (response.status === 401) {
      removeToken();
      removeCookie(REFRESH_TOKEN_COOKIE_NAME);
      throw new Error("Session expired. Please log in again.");
    }
    const errorMessage = data?.message || "Failed to update profile";
    throw new Error(errorMessage);
  }

  if (data.status === "success" && data.data) {
    return data.data;
  } else {
    throw new Error("Invalid response from server");
  }
};

/**
 * Sign up a new user with email and password
 * @param email - User email
 * @param password - User password
 * @param category - User category (personal/organization)
 * @param gstNumber - GST number (required for organizations)
 * @param shippingAddress - Shipping address object
 * @throws Error if signup fails
 */
export interface ShippingAddress {
  address1?: string;
  address2?: string;
  pin?: string;
  city?: string;
  state?: string;
  country?: string;
}

export const signup = async (
  email: string,
  password: string,
  category?: string,
  gstNumber?: string,
  shippingAddress?: ShippingAddress
): Promise<void> => {
  const body: any = { email, password };
  
  if (category) {
    body.category = category;
  }
  
  if (gstNumber) {
    body.gst_number = gstNumber;
  }
  
  if (shippingAddress) {
    body.shipping_address1 = shippingAddress.address1;
    body.shipping_address2 = shippingAddress.address2;
    body.shipping_pin = shippingAddress.pin;
    body.shipping_city = shippingAddress.city;
    body.shipping_state = shippingAddress.state;
    body.shipping_country = shippingAddress.country || "India";
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || "Signup failed";
    throw new Error(errorMessage);
  }

  // Signup doesn't return a token, user needs to verify email first
  if (data.status !== "success") {
    throw new Error("Invalid response from server");
  }
};

/**
 * Verify email with OTP code
 * @param email - User email
 * @param code - 6-digit OTP code
 * @throws Error if verification fails
 */
export const verifyEmail = async (email: string, code: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || "Verification failed";
    throw new Error(errorMessage);
  }

  if (data.status === "success" && data.data?.access_token) {
    // Store the token in cookies
    setToken(data.data.access_token);
    // Refresh token is stored in HTTP-only cookie by the backend
  } else {
    throw new Error("Invalid response from server");
  }
};

/**
 * Refresh the access token using the refresh token
 * @returns The new access token or null if refresh fails
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include", // Include refresh token cookie
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.status === "success" && data.data?.access_token) {
      // Update access token cookie
      setToken(data.data.access_token);
      return data.data.access_token;
    }

    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

/**
 * Logout the current user
 * Removes the token from cookies
 * @throws Error if logout fails
 */
export const logout = async (): Promise<void> => {
  const token = getToken();
  
  // Try to call logout endpoint if we have a token
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include", // Include cookies for refresh token
      });
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error("Logout API call failed:", error);
    }
  }

  // Always remove tokens locally
  removeToken();
  // Also remove refresh token cookie
  removeCookie(REFRESH_TOKEN_COOKIE_NAME);
};
