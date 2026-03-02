"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { ProductCarousel } from "./ProductCarousel";
import { ProductCard } from "./ProductCard";
import { fetchProductsByCategory } from "@/lib/products-api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface CategoryProductsSectionProps {
  categorySlug: string;
  categoryName: string;
  showCarousel?: boolean;
  showList?: boolean;
  carouselLimit?: number;
  className?: string;
}

export function CategoryProductsSection({ categorySlug, categoryName, showCarousel = true, showList = true, carouselLimit = 10, className }: CategoryProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProducts = await fetchProductsByCategory(categorySlug, 1, 50);
        setProducts(fetchedProducts);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load products";
        console.error(`Error fetching products for category ${categorySlug}:`, err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [categorySlug]);

  // Show nothing if loading and no products yet, or if there's an error and no products
  if (isLoading) {
    return (
      <div className={cn("w-full space-y-3", className)}>
        {showCarousel && (
          <div className="flex gap-2 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[100px] sm:min-w-[140px] shrink-0">
                <Skeleton className="w-full pt-[85%] rounded-lg" />
                <Skeleton className="h-3 w-3/4 mt-2" />
                <Skeleton className="h-3 w-1/2 mt-1.5" />
              </div>
            ))}
          </div>
        )}
        {showList && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <Skeleton className="w-full pt-[85%] rounded-lg" />
                <Skeleton className="h-3 w-3/4 mt-2" />
                <Skeleton className="h-3 w-1/2 mt-1.5" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className={cn("w-full py-3", className)}>
        <div className="flex items-center gap-1.5 text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <p className="text-xs">Failed to load products: {error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show empty sections
  }

  const carouselProducts = showCarousel ? products.slice(0, carouselLimit) : [];
  const listProducts = showList ? products : [];

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Carousel Section */}
      {showCarousel && carouselProducts.length > 0 && <ProductCarousel products={carouselProducts} category={categoryName} title={categoryName} />}

      {/* List/Grid Section */}
      {showList && listProducts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold">All {categoryName} Products</h3>
            <span className="text-xs text-muted-foreground">
              {listProducts.length} {listProducts.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {listProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
