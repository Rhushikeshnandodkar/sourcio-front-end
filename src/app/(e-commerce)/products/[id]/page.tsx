"use client";

import Link from "next/link";
import { ProductDetails } from "@/components/products/ProductDetails";
import { ProductPageWrapper } from "@/components/products/ProductPageWrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { fetchProductById } from "@/lib/products-api";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProduct = await fetchProductById(productId);
        setProduct(fetchedProduct);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load product";
        console.error("Error fetching product:", err);
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-8">
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-48 mb-3 sm:mb-4" />
          <Skeleton className="h-64 sm:h-96 w-full" />
        </div>
      </ProductPageWrapper>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-4xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground">{error || "The product you're looking for doesn't exist or has been removed."}</p>
          <Button asChild>
            <Link href="/">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProductPageWrapper>
      <div className="container mx-auto px-3 md:px-4 pt-4 md:pt-8 max-w-7xl">
        <Breadcrumbs items={[{ label: "Products", href: "/" }, { label: product.name }]} />
      </div>
      <ProductDetails product={product} />
    </ProductPageWrapper>
  );
}
