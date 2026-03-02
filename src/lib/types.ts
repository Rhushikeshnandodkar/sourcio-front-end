export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  originalPrice?: number;
  specifications?: Record<string, string>;
  image?: string;
  images?: string[];
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image?: string;
  images?: string[];
  specifications?: Record<string, string>;
  category?: string;
  variants?: ProductVariant[];
  brand?: string;
}
