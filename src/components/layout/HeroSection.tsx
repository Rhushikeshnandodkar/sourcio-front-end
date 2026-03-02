"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import CategoryGrid from "../CategoryGrid";

const sentences = ["Industrial Sourcing", "Quality Parts", "B2B Solutions", "Sourcing Partner"];

const colors = ["#8a3a34", "#5c8cb5", "#00a76e", "#cf9358"];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sentences.length);
    }, 2000); // Change sentence every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[85rem] mx-auto mt-10 px-3">
      <div className="space-y-0">
        <div className="relative h-12 md:h-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className="text-4xl md:text-7xl font-medium leading-none"
              style={{ color: colors[currentIndex] }}
            >
              {sentences[currentIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-4xl md:text-[87px] font-medium leading-[1.1] -mt-2">personalized to you</div>
        <div className="text-base md:text-lg font-medium text-muted-foreground mt-2">Customized care starts here</div>
      </div>
      <CategoryGrid />
    </div>
  );
};

export default HeroSection;
