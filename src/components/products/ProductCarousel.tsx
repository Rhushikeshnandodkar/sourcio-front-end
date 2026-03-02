"use client";

import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ProductCarouselProps {
  products: Product[];
  category?: string;
  title?: string;
  className?: string;
}

export function ProductCarousel({ products, category, title, className }: ProductCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  const displayTitle = title || (category ? `${category} Products` : "Products");

  return (
    <div className={cn("w-full relative", className)}>
      {/* Header */}
      {displayTitle && (
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold">{displayTitle}</h2>
          <span className="text-xs text-muted-foreground">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative group">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
            duration: 25,
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0 -mr-2 py-2 px-0.5">
            {products.map((product) => (
              <CarouselItem 
                key={product.id} 
                className="pl-1.5 sm:pl-2 pr-1.5 sm:pr-2 first:pl-0 last:pr-0 basis-[32%] min-w-[100px] sm:basis-[24%] sm:min-w-[140px] md:basis-[20%] md:min-w-[160px] lg:basis-[18%] lg:min-w-[180px]"
              >
                <div className="h-full">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows */}
          <CarouselPrevious className="hidden sm:flex left-0 h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm shadow-md border hover:bg-white transition-all disabled:opacity-20 z-20" />
          <CarouselNext className="hidden sm:flex right-0 h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm shadow-md border hover:bg-white transition-all disabled:opacity-20 z-20" />
        </Carousel>
      </div>
    </div>
  );
}
