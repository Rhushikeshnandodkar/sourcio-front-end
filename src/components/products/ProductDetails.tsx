"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Product, ProductVariant } from "@/lib/types";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Package, Tag, Sparkles, Minus, Plus } from "lucide-react";
import { fetchProductsByCategory } from "@/lib/products-api";
import { useDispatch, useSelector } from "react-redux";
import { selectVariant } from "@/features/product/productSlice";
import { useAddToCart } from "@/hooks/useAddToCart";
import { RootState } from "@/components/providers/ReduxProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
}

// Custom hook to safely check if component is mounted (for portal rendering)
const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(subscribeToMount, getClientSnapshot, getServerSnapshot);
}

// Sticky bar component rendered via portal
function StickyAddToCartBar({
  currentPrice,
  hasVariants,
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
}: {
  currentPrice: number | null | undefined;
  hasVariants: boolean;
  selectedVariant: ProductVariant | null;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
}) {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        {/* Price Info */}
        <div className="flex-1 min-w-0">
          {currentPrice != null && typeof currentPrice === "number" && currentPrice > 0 ? (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">₹{(currentPrice * quantity).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {hasVariants && selectedVariant && <span className="text-[10px] text-slate-500 truncate">{selectedVariant.name}</span>}
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-amber-600">Request for Quote</span>
              {hasVariants && selectedVariant && <span className="text-[10px] text-slate-500 truncate">{selectedVariant.name}</span>}
            </div>
          )}
        </div>
        {/* Quantity Selector */}
        <div className="flex items-center h-10 rounded-lg border border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-9 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 active:bg-slate-100 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-slate-900">{quantity}</span>
          <button
            onClick={() => onQuantityChange(Math.min(99, quantity + 1))}
            className="w-9 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 active:bg-slate-100 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Add to Cart Button */}
        <Button onClick={onAddToCart} className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg shrink-0">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>,
    document.body
  );
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const dispatch = useDispatch();
  const { addItemToCart } = useAddToCart();
  const selectedVariantId = useSelector((state: RootState) => state.product.selectedVariants[product.id]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Fetch related products from API
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product.category) return;

      try {
        const products = await fetchProductsByCategory(product.category);
        // Filter out current product and limit to 4
        const related = products.filter((p) => p.id !== product.id).slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      }
    };

    loadRelatedProducts();
  }, [product.id, product.category]);

  // Determine if product has variants
  const hasVariants = product.variants && product.variants.length > 0;

  // Get selected variant or default to first variant
  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (!hasVariants) return null;
    const variantId = selectedVariantId || product.variants![0].id;
    return product.variants!.find((v) => v.id === variantId) || product.variants![0];
  }, [hasVariants, selectedVariantId, product.variants]);

  // Set default variant on mount
  useEffect(() => {
    if (hasVariants && !selectedVariantId && product.variants![0]) {
      dispatch(selectVariant({ productId: product.id, variantId: product.variants![0].id }));
    }
  }, [hasVariants, selectedVariantId, product.id, product.variants, dispatch]);

  // Get current price and specs based on variant
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice;
  const currentSpecs = selectedVariant?.specifications && Object.keys(selectedVariant.specifications).length > 0 ? selectedVariant.specifications : product.specifications;

  // Get current images
  const getCurrentImages = (): string[] => {
    const allImages: string[] = [];

    if (selectedVariant) {
      if (selectedVariant.images && selectedVariant.images.length > 0) {
        const variantImages = selectedVariant.images.filter((img) => img && img.trim() !== "");
        allImages.push(...variantImages);
      } else if (selectedVariant.image && selectedVariant.image.trim() !== "") {
        allImages.push(selectedVariant.image);
      }
    }

    if (product.image && product.image.trim() !== "" && !allImages.includes(product.image)) {
      allImages.unshift(product.image);
    }

    if (product.images && product.images.length > 0) {
      const productImages = product.images.filter((img) => img && img.trim() !== "");
      productImages.forEach((img) => {
        if (!allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }

    return allImages;
  };
  const currentImages = getCurrentImages();

  const handleVariantChange = (variantId: string) => {
    dispatch(selectVariant({ productId: product.id, variantId }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(99, newQuantity)));
  };

  const handleAddToCart = async () => {
    if (hasVariants) {
      if (!selectedVariant) {
        toast.error("Please select a variant");
        return;
      }

      const price = selectedVariant.price != null && typeof selectedVariant.price === "number" && selectedVariant.price > 0 ? selectedVariant.price : null;

      const success = await addItemToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantName: selectedVariant.name,
        price: price,
        image: selectedVariant.image || selectedVariant.images?.[0] || product.image || product.images?.[0] || undefined,
        quantity: quantity,
      });

      if (success) {
        if (price == null) {
          toast.success(`${quantity}x ${product.name} (${selectedVariant.name}) added to cart - Request for Quote`);
        } else {
          toast.success(`${quantity}x ${product.name} (${selectedVariant.name}) added to cart`);
        }
        setQuantity(1); // Reset quantity after adding to cart
      }
    } else {
      const price = product.price != null && typeof product.price === "number" && product.price > 0 ? product.price : null;

      const success = await addItemToCart({
        productId: product.id,
        variantId: null,
        productName: product.name,
        price: price,
        image: product.image || product.images?.[0] || undefined,
        quantity: quantity,
      });

      if (success) {
        if (price == null) {
          toast.success(`${quantity}x ${product.name} added to cart - Request for Quote`);
        } else {
          toast.success(`${quantity}x ${product.name} added to cart`);
        }
        setQuantity(1); // Reset quantity after adding to cart
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Product Section */}
      <div className="container mx-auto px-4 md:px-4 py-6 md:py-8 max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
          {/* Image Gallery - Left Column */}
          <div className="w-full md:sticky md:top-6 md:self-start">
            <ProductImageGallery product={{ ...product, images: currentImages, image: currentImages[0] || undefined }} className="max-w-md mx-auto md:max-w-none" />
          </div>

          {/* Product Information - Right Column */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-between flex-wrap">
                {/* Brand Badge */}
                {product.brand && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-slate-100 rounded-md md:rounded-lg">
                    <Tag className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-500" />
                    <span className="text-[11px] md:text-xs font-semibold text-slate-600 uppercase tracking-wide">{product.brand}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {currentPrice == null && typeof currentPrice !== "number" && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-md">
                      <span className="text-xs md:text-sm font-semibold text-amber-700">RFQ</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Product Name */}
              <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-snug">{product.name}</h1>

              {/* Price Section */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {currentPrice != null && typeof currentPrice === "number" && currentPrice > 0 && (
                  <>
                    <span className="text-2xl md:text-3xl font-bold text-slate-900">₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {currentOriginalPrice != null && typeof currentOriginalPrice === "number" && currentOriginalPrice > currentPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-base md:text-lg text-slate-400 line-through">
                          ₹{currentOriginalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 bg-emerald-50 text-emerald-700 text-xs md:text-sm font-semibold rounded-md md:rounded-lg">
                          <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          {Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 mb-4" />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
                Description
              </h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Variant Selection */}
            {hasVariants && (
              <div className="mt-4 md:mt-5 space-y-2">
                <h3 className="text-xs md:text-sm font-semibold text-slate-900">Select Variant</h3>
                <Select value={selectedVariant?.id || ""} onValueChange={handleVariantChange}>
                  <SelectTrigger className="w-full h-11 md:h-12 transition-all">
                    <SelectValue>
                      {selectedVariant && (
                        <div className="flex w-full items-center gap-3">
                          <span className="font-medium text-slate-900 text-sm truncate">{selectedVariant.name}</span>
                          <span className="text-slate-300">•</span>
                          {selectedVariant.price != null && typeof selectedVariant.price === "number" && selectedVariant.price > 0 ? (
                            <span className="font-bold text-slate-900 text-sm">₹{selectedVariant.price.toLocaleString("en-IN")}</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">RFQ</span>
                          )}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
                    {product.variants!.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id} className="rounded-lg cursor-pointer focus:bg-slate-50 py-2.5 px-3">
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="font-medium text-slate-800">{variant.name}</span>
                          {variant.price != null && typeof variant.price === "number" && variant.price > 0 ? (
                            <span className="font-bold text-slate-900">₹{variant.price.toLocaleString("en-IN")}</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">RFQ</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity & Add to Cart Section */}
            <div className="hidden sm:flex mt-4 md:mt-5 items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center">
                <span className="text-xs md:text-sm font-semibold text-slate-900 mr-3">Quantity</span>
                <div className="flex items-center h-10 md:h-11 rounded-lg md:rounded-xl border border-slate-200 bg-white">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 md:w-11 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg md:rounded-l-xl transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-12 md:w-14 h-full text-center text-sm md:text-base font-semibold text-slate-900 border-x border-slate-200 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 md:w-11 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg md:rounded-r-xl transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-10 md:h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg md:rounded-xl transition-all duration-200"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            {/* Specifications */}
            {currentSpecs && Object.keys(currentSpecs).length > 0 && (
              <div className="mt-5 md:mt-6 space-y-2 md:space-y-3">
                <h3 className="text-xs md:text-sm font-semibold text-slate-900">Specifications</h3>
                <div className="rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                  {Object.entries(currentSpecs).map(([key, value], index) => (
                    <div key={key} className={cn("flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3", index !== Object.keys(currentSpecs).length - 1 && "border-b border-slate-100")}>
                      <span className="text-xs md:text-sm text-slate-500 font-medium">{key}</span>
                      <span className="text-xs md:text-sm text-slate-900 font-semibold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-5 md:mt-6 grid grid-cols-2 gap-2 md:gap-3">
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-slate-50 rounded-lg md:rounded-xl">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-md md:rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] md:text-xs font-semibold text-slate-900 truncate">Quality Assured</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 truncate">100% Genuine</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-slate-50 rounded-lg md:rounded-xl">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-md md:rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] md:text-xs font-semibold text-slate-900 truncate">Fast Shipping</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 truncate">Quick Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for sticky bar on mobile */}
      <div className="h-24 sm:hidden" aria-hidden="true" />

      {/* Sticky Add to Cart Bar - Mobile Only */}
      <StickyAddToCartBar
        currentPrice={currentPrice}
        hasVariants={!!hasVariants}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
        onAddToCart={handleAddToCart}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 max-w-6xl">
            <div className="space-y-1 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Related Products</h2>
              <p className="text-sm text-slate-500">More items from {product.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
