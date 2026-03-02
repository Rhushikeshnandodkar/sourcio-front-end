"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface ProductImageGalleryProps {
  product: Product;
  className?: string;
}

export function ProductImageGallery({ product, className }: ProductImageGalleryProps) {
  // Combine main image with images array, avoiding duplicates
  const allImages: string[] = [];

  // Add main image first if it exists
  if (product.image && product.image.trim() !== "") {
    allImages.push(product.image);
  }

  // Add images from array (excluding duplicates)
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img && img.trim() !== "" && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  // Filter out any remaining empty strings
  const images = allImages.filter((img): img is string => Boolean(img) && img.trim() !== "");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className={cn("relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100", className)}>
        <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
            <ImageOff className="h-6 w-6 text-slate-300" />
          </div>
          <span className="text-sm font-medium">No image available</span>
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  // Additional safety check
  if (!selectedImage || selectedImage.trim() === "") {
    return (
      <div className={cn("relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100", className)}>
        <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
            <ImageOff className="h-6 w-6 text-slate-300" />
          </div>
          <span className="text-sm font-medium">No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5 sm:gap-3 w-full", className)}>
      {/* Main Image Container */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-white border border-slate-200">
        <Image
          src={selectedImage}
          alt={product.name}
          fill
          className="object-contain p-3 sm:p-6 transition-all duration-300 ease-out"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 450px"
        />

        {/* Navigation Arrows - Always visible on mobile for multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 active:scale-95 transition-all duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 active:scale-95 transition-all duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
        )}

        {/* Image Counter Badge - Mobile only */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded-md sm:hidden">
            {selectedImageIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="relative">
          {/* Mobile: Horizontal scrollable thumbnails */}
          <div className="flex sm:hidden gap-1.5 overflow-x-auto scrollbar-hide p-0.5">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "relative shrink-0 w-12 h-12 overflow-hidden rounded-lg transition-all duration-150 touch-manipulation",
                  selectedImageIndex === index ? "ring-1 ring-slate-900" : "ring-1 ring-slate-200 active:scale-95"
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image src={image} alt={`${product.name} - View ${index + 1}`} fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>

          {/* Tablet & Desktop: Flex layout */}
          <div className="hidden sm:flex gap-2 md:gap-2.5 justify-start flex-wrap">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                onMouseEnter={() => setSelectedImageIndex(index)}
                className={cn(
                  "relative w-14 h-14 md:w-16 md:h-16 overflow-hidden rounded-xl transition-all duration-200",
                  selectedImageIndex === index ? "ring-2 ring-slate-900 ring-offset-2" : "ring-1 ring-slate-200 hover:ring-slate-400"
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image src={image} alt={`${product.name} - View ${index + 1}`} fill className="object-cover pointer-events-none" sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
