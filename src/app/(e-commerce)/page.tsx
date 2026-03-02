"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/layout/HeroSection";
import GradientSection from "@/components/GradientSection";
import TrustedSolutionsGrid from "@/components/TrustedSolutionsGrid";
import CTA from "@/components/cta";
import { CategoryProductsSection } from "@/components/products/CategoryProductsSection";
import { fetchAllCategories } from "@/lib/products-api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchAllCategories(1, 100);
        // Filter only active categories and limit to 6 main categories
        const activeCategories = fetchedCategories
          .filter((cat) => cat.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .slice(0, 6);
        setCategories(activeCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <>
      <HeroSection />
      <GradientSection />
      <div className="px-4 sm:px-6 lg:px-8">
        <TrustedSolutionsGrid />
      </div>

      {/* Category Products Sections */}
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">Explore Our Product Categories</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">Discover our wide range of manufacturing solutions, equipment, and materials</p>
        </div>

        {isLoadingCategories ? (
          <div className="space-y-10 sm:space-y-12 md:space-y-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 sm:h-7 md:h-8 w-32 sm:w-40 md:w-48" />
                  <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 md:w-24" />
                </div>
                <div className="flex gap-3 sm:gap-4 overflow-hidden">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="min-w-[180px] sm:min-w-[220px] md:min-w-[240px] shrink-0">
                      <Skeleton className="aspect-square w-full rounded-lg sm:rounded-xl" />
                      <Skeleton className="h-3 sm:h-4 w-3/4 mt-2 sm:mt-3" />
                      <Skeleton className="h-4 sm:h-5 w-1/2 mt-1.5 sm:mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12 md:space-y-16">
            {categories.map((category) => (
              <section key={category.id} id={category.slug} className="scroll-mt-8">
                <CategoryProductsSection categorySlug={category.slug} categoryName={category.name} showCarousel={true} showList={false} carouselLimit={8} />
              </section>
            ))}
          </div>
        )}

        {/* View All Products Link */}
        {!isLoadingCategories && categories.length > 0 && (
          <div className="mt-8 sm:mt-10 md:mt-12 text-center">
            <Button asChild size="default" className="text-sm sm:text-base px-6 sm:px-8 h-9 sm:h-10" variant="default">
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      <CTA />
    </>
  );
}
