"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { gsap } from "gsap";

interface ProductPageWrapperProps {
  children: React.ReactNode;
}

export function ProductPageWrapper({ children }: ProductPageWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when navigating to a product page
    const scrollToTop = () => {
      try {
        const smoother = ScrollSmoother.get();
        if (smoother) {
          // Use ScrollSmoother's scrollTo method with smooth animation
          smoother.scrollTo(0, true);
        } else {
          // Fallback: Use GSAP to animate scroll position
          const smoothContent = document.getElementById("smooth-content");
          if (smoothContent) {
            gsap.to(smoothContent, {
              scrollTop: 0,
              duration: 0.5,
              ease: "power2.out",
            });
          } else {
            // Final fallback
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      } catch (error) {
        // Fallback if ScrollSmoother API fails
        const smoothContent = document.getElementById("smooth-content");
        if (smoothContent) {
          gsap.to(smoothContent, {
            scrollTop: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };

    // Wait for ScrollSmoother to be initialized and page to render
    // Using requestAnimationFrame to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToTop);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return <>{children}</>;
}
