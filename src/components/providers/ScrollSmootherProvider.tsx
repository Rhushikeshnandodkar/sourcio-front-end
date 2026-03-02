"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

interface ScrollSmootherProviderProps {
  children: React.ReactNode;
}

export function ScrollSmootherProvider({ children }: ScrollSmootherProviderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current || !contentRef.current) return;

    // Wait for next tick to ensure DOM is fully ready
    const initSmoother = () => {
      if (!wrapperRef.current || !contentRef.current) return;

      // Kill existing instance if any
      if (smootherRef.current) {
        smootherRef.current.kill();
      }

      // Create ScrollSmoother instance with optimal settings for the smoothest scrolling
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 2, // Higher value = smoother scroll (2 seconds to catch up)
        effects: true, // Enable data-speed and data-lag attributes for parallax effects
        smoothTouch: 0.1, // Smoothing on touch devices (lower for better mobile performance)
        normalizeScroll: true, // Force scrolling on JS thread for perfect sync
        ignoreMobileResize: true, // Prevent jumps on mobile resize
        ease: "expo.out", // Smooth exponential easing function
      });

      smootherRef.current = smoother;

      // Refresh ScrollTrigger after ScrollSmoother is created
      ScrollTrigger.refresh();
    };

    // Initialize after a small delay to ensure everything is ready
    const timeoutId = setTimeout(initSmoother, 100);

    // Handle window resize
    const handleResize = () => {
      if (smootherRef.current) {
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapperRef} className="h-screen overflow-hidden">
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
