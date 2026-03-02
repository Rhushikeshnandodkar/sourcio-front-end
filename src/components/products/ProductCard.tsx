"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { ShoppingCart, Plus, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAddToCart } from "@/hooks/useAddToCart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItemToCart } = useAddToCart();
  const router = useRouter();
  const productImage = product.image || (product.images && product.images[0]);
  const isValidImage = productImage && productImage.trim() !== "";
  const hasVariants = product.variants && product.variants.length > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, navigate to product detail page instead
    if (hasVariants) {
      router.push(`/products/${product.id}`);
      return;
    }

    // Add product without variant (allow null/0 prices for quote requests)
    const price = product.price != null && typeof product.price === "number" && product.price > 0 ? product.price : null;

    const success = await addItemToCart({
      productId: product.id,
      variantId: null,
      productName: product.name,
      price: price,
      image: productImage || undefined,
      quantity: 1,
    });

    if (success) {
      if (price == null) {
        toast.success(`${product.name} added to cart - Request for Quote`);
      } else {
        toast.success(`${product.name} added to cart`);
      }
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative w-full aspect-square overflow-hidden bg-linear-to-br from-slate-50 to-slate-100/50">
          {isValidImage ? (
            <Image
              src={productImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-slate-300" />
              </div>
            </div>
          )}

          {/* Quick Add Button - Appears on hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              {hasVariants ? (
                <>
                  Select Options
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Product Name */}
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug tracking-tight group-hover:text-slate-900 transition-colors">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="mt-auto pt-3">
            {product.price != null && typeof product.price === "number" && product.price > 0 ? (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg">
                <span className="text-xs font-semibold text-amber-700">Request Quote</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
