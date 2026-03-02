/**
 * JWT token utilities
 */

/**
 * Decode a JWT token without verification
 * @param token - The JWT token string
 * @returns The decoded payload or null if invalid
 */
const decodeJWT = (token: string): any | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param token - The JWT token string
 * @returns True if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded) {
    return true;
  }

  // Check if token has expiration claim (exp)
  if (!decoded.exp) {
    // If no expiration claim, assume token is valid (let server handle it)
    return false;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
};

/**
 * Get the expiration time of a JWT token
 * @param token - The JWT token string
 * @returns The expiration timestamp in milliseconds, or null if invalid/no expiration
 */
export const getTokenExpiration = (token: string): number | null => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000;
};
