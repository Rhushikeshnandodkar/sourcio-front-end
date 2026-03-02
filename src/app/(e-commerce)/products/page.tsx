"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { fetchAllProductsPaginated, PaginatedResponse } from "@/lib/products-api";
import { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRODUCTS_PER_PAGE = 24;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Product>, "items">>({
    total: 0,
    page: 1,
    size: PRODUCTS_PER_PAGE,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get search query and page from URL
  const searchQuery = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAllProductsPaginated(
          currentPage,
          PRODUCTS_PER_PAGE,
          searchQuery || undefined
        );
        setProducts(data.items);
        setPagination({
          total: data.total,
          page: data.page,
          size: data.size,
          pages: data.pages,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load products";
        console.error("Error fetching products:", err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`/products?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


  if (isLoading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-3" />
              <Skeleton className="h-5 w-1/2 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-3xl font-bold">Failed to Load Products</h1>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Products</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our comprehensive catalog of manufacturing equipment, tools, materials, and solutions
        </p>

        {/* Results Info */}
        {pagination.total > 0 && (
          <div className="text-sm text-muted-foreground">
            {searchQuery ? (
              <>
                Found {pagination.total} {pagination.total === 1 ? "result" : "results"} for "{searchQuery}"
              </>
            ) : (
              <>
                Showing {products.length} of {pagination.total} products
              </>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div className="space-y-2">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse all products.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No products available at the moment.</p>
          )}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={isLoading}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
