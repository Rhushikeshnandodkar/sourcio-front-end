/**
 * Products API client
 */
import { Product } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";

/**
 * API Response types
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface ProductSummaryResponse {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number | string;
  sku?: string | null;
  slug?: string | null;
  status?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  stock_quantity?: number;
  rating_average?: number | string | null;
}

interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  level: number;
  path?: string | null;
  image?: string | null;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
  deleted_at?: string | null;
}

/**
 * Map ProductSummaryResponse to Product
 */
function mapProductSummaryToProduct(product: ProductSummaryResponse): Product {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || "",
    price: typeof product.price === "string" ? parseFloat(product.price) : product.price,
    image: product.image || undefined,
    images: product.image ? [product.image] : undefined,
    category: undefined, // Will be set by caller if needed
  };
}

/**
 * Fetch products by category slug
 * @param categorySlug - The category slug (e.g., "manufacturing")
 * @param page - Page number (default: 1)
 * @param size - Page size (default: 50)
 * @returns Array of products
 */
export async function fetchProductsByCategory(
  categorySlug: string,
  page: number = 1,
  size: number = 50
): Promise<Product[]> {
  try {
    const params = new URLSearchParams({
      category: categorySlug,
      page: String(page),
      size: String(size),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch products: ${response.statusText}`);
    }

    const data: PaginatedResponse<ProductSummaryResponse> = await response.json();
    
    return data.items.map(mapProductSummaryToProduct);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
}

/**
 * Fetch all products (no category filter)
 * @param page - Page number (default: 1)
 * @param size - Page size (default: 50)
 * @returns Array of products
 */
export async function fetchAllProducts(
  page: number = 1,
  size: number = 50
): Promise<Product[]> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch products: ${response.statusText}`);
    }

    const data: PaginatedResponse<ProductSummaryResponse> = await response.json();
    
    return data.items.map(mapProductSummaryToProduct);
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
}

/**
 * Fetch all products with pagination metadata (no category filter)
 * @param page - Page number (default: 1)
 * @param size - Page size (default: 50)
 * @param search - Search query string (optional)
 * @returns Paginated response with products and metadata
 */
export async function fetchAllProductsPaginated(
  page: number = 1,
  size: number = 50,
  search?: string
): Promise<PaginatedResponse<Product>> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch products: ${response.statusText}`);
    }

    const data: PaginatedResponse<ProductSummaryResponse> = await response.json();
    
    return {
      items: data.items.map(mapProductSummaryToProduct),
      total: data.total,
      page: data.page,
      size: data.size,
      pages: data.pages,
    };
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
}

/**
 * Fetch a single product by ID
 * @param productId - The product ID
 * @returns Product details
 */
export async function fetchProductById(productId: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch product: ${response.statusText}`);
    }

    const productData = await response.json();
    
    // Combine main image with images array (avoid duplicates)
    const allProductImages: string[] = [];
    if (productData.image && productData.image.trim() !== "") {
      allProductImages.push(productData.image);
    }
    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach((img: string) => {
        if (img && img.trim() !== "" && !allProductImages.includes(img)) {
          allProductImages.push(img);
        }
      });
    }
    
    // Map full product response to Product type
    return {
      id: String(productData.id),
      name: productData.name,
      description: productData.description || "",
      price: typeof productData.price === "string" 
        ? parseFloat(productData.price) 
        : productData.price,
      image: productData.image || undefined,
      images: allProductImages.length > 0 ? allProductImages : undefined,
      category: productData.category?.slug || productData.category?.name || undefined,
      brand: productData.brand || undefined,
      specifications: productData.specifications || undefined,
      variants: productData.variants?.map((v: any) => ({
        id: String(v.id),
        name: v.name,
        price: typeof v.price === "string" ? parseFloat(v.price) : v.price,
        originalPrice: v.originalPrice 
          ? (typeof v.originalPrice === "string" ? parseFloat(v.originalPrice) : v.originalPrice)
          : undefined,
        specifications: v.specifications || undefined,
        image: v.image || undefined,
        images: v.images || undefined,
        inStock: v.inStock !== undefined ? v.inStock : true,
      })) || undefined,
    };
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
}

/**
 * Fetch all categories
 * @param page - Page number (default: 1)
 * @param size - Page size (default: 100)
 * @returns Array of categories
 */
export async function fetchAllCategories(
  page: number = 1,
  size: number = 100
): Promise<CategoryResponse[]> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/categories?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch categories: ${response.statusText}`);
    }

    const data: PaginatedResponse<CategoryResponse> = await response.json();
    
    return data.items;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
