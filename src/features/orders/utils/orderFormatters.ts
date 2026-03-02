/**
 * Order formatting utilities
 * Single Responsibility: Handles formatting of order-related data
 */

/**
 * Format a date string to a readable format
 */
export function formatOrderDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a price value to Indian Rupee format
 */
export function formatOrderPrice(price: string | number | null): string {
  if (price === null || price === undefined) {
    return "N/A";
  }
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `₹${numPrice.toLocaleString("en-IN", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

