"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Component from "./ui/text-marque";

const GradientSection = () => {
  return (
    <>
      <style>{`
        .hero-image-container {
          --heroOverlap: 40px;
          --z-index: 1;
        }
        .hero-image-container::after {
          content: "";
          display: block;
          position: absolute;
          height: calc(var(--heroOverlap) * 2);
          left: 0px;
          right: 0px;
          bottom: 0px;
          background: rgb(202, 154, 126);
          mask-image: linear-gradient(180deg, transparent, black calc(var(--heroOverlap) * 5));
          z-index: calc(2 + var(--z-index));
        }
      `}</style>
      <section
        className="w-full 3xl:w-[90%] mx-auto py-6 md:py-10 px-4 sm:px-6 relative overflow-hidden my-6 md:my-10 md:rounded-4xl"
        style={{
          background: `linear-gradient(rgba(202, 154, 126, 0) 50%, rgb(202, 154, 126)) 0% 0% / cover, radial-gradient(rgb(233, 184, 154) 20%, rgb(173, 110, 75))`,
        }}
      >
        <div className="container mx-auto max-w-6xl space-y-4 md:space-y-0">
          {/* Hero Section */}
          <div className="relative h-[280px] sm:h-[350px] md:h-[600px] hero-image-container rounded-xl md:rounded-2xl overflow-hidden">
            <Image src="/hero-bento/bento-hero-1.webp" alt="Professional industrial expert" fill className="object-contain" priority />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4 sm:px-6 pt-8 sm:pt-12">
              <p className="text-xs sm:text-sm text-white/90 drop-shadow-lg font-medium mb-2">Sourcio Commerce</p>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-medium text-white drop-shadow-lg mb-1">Get your parts.</h1>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-medium text-white drop-shadow-lg">Go for optimal sourcing.</h2>
            </div>
          </div>

          {/* Middle Section - Three Column Layout */}
          <div className="bg-[#bd876b] rounded-2xl md:rounded-3xl relative overflow-hidden pt-4 md:pt-0 px-4 sm:px-6 md:px-8 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-center">
              {/* Left Card */}
              <div className="space-y-3 md:space-y-4 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">Find your baseline</h3>
                <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed">
                  Get a clear picture of your sourcing needs with a comprehensive component assessment and supplier evaluation.
                </p>
              </div>

              {/* Center Image */}
              <div className="relative h-[350px]  md:h-[450px] order-last md:order-0">
                <Image src="/hero-bento/phone-in-hand.webp" alt="Sourcing mobile app" fill className="object-cover rounded-lg" />
              </div>

              {/* Right Card */}
              <div className="space-y-3 md:space-y-4 text-center md:text-right">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white mb-3 md:mb-4">Plan your breakthrough</h3>
                <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                  Optimize your sourcing strategy with our expert-developed component selection and supplier management plan.
                </p>
                <div className="flex justify-center md:justify-end">
                  <Button className="bg-black/20 hover:bg-black/30 text-white px-4 py-3 md:p-6 rounded-full text-sm md:text-base">Explore the plan</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2">
            {/* Left Card */}
            <div className="bg-[#bd876b] rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
              <div className="space-y-4 md:space-y-2">
                <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-4">10+ Component Categories</p>

                <div className="relative w-full h-[200px] sm:h-[240px] md:h-[280px] rounded-lg overflow-hidden mb-4">
                  <Image src="/hero-bento/bento-grid-3.png" alt="Component categories" fill className="object-cover" />
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <p className="text-white text-sm sm:text-base leading-relaxed flex-1">Discover how our comprehensive component catalog compares to traditional sourcing methods.</p>
                  <Button className="bg-black/20 hover:bg-black/30 text-white px-4 py-3 md:p-6 rounded-full text-sm md:text-base w-full sm:w-auto">Get the catalog</Button>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-[#bd876b] rounded-2xl md:rounded-3xl pt-8 md:pt-10 relative overflow-hidden min-h-[400px] sm:min-h-[450px] md:min-h-[500px] hero-image-container flex flex-col items-center justify-start gap-6 md:gap-10">
              <div className="w-full">
                <h3 className="text-xl sm:text-2xl md:text-4xl font-medium text-white text-center relative z-20 pt-2 md:pt-4">Source up to 10,000+ components</h3>
              </div>

              <div className="flex flex-col items-center justify-center relative w-full h-full flex-1">
                {/* Central Figure */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="relative w-full h-full max-w-[300px] max-h-[300px] sm:max-w-[400px] sm:max-h-[400px] md:max-w-[500px] md:max-h-[500px]">
                    <Image src="/hero-bento/bento-grid-4.webp" alt="Component catalog" fill className="object-contain" />
                  </div>
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#bd876b] to-transparent z-10 pointer-events-none" />

                {/* Animated Component Names - Behind Figure */}
                <div className="absolute inset-0 grid place-content-center gap-1 md:gap-2 z-0 pointer-events-none">
                  <Component delay={200} baseVelocity={-2} clasname="text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-white/40">
                    Screws Bolts Nuts Washers Rivets Pins Fasteners
                  </Component>
                  <Component delay={250} baseVelocity={2} clasname="text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-white/40">
                    Bearings Gaskets O-rings Seals Springs Shafts Gears
                  </Component>
                  <Component delay={300} baseVelocity={1.5} clasname="text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-white/40">
                    Pulleys Chains Belts Hoses Clamps Brackets Bushings Couplings
                  </Component>
                  <Component delay={150} baseVelocity={-1.5} clasname="text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-white/40">
                    Retainers Spacers Rings Lock Washers Flat Washers Threaded Rods
                  </Component>
                  <Component delay={100} baseVelocity={-2.5} clasname="text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-white/40">
                    Hex Bolts Socket Head Screws Machine Screws Self-Tapping Wood Screws
                  </Component>
                  <Component delay={350} baseVelocity={2.5} clasname="text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-white/40">
                    Valves Actuators Sensors Connectors Adapters Fittings Couplers
                  </Component>
                </div>

                {/* Button at Bottom Center */}
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full px-4">
                  <Button className="bg-black/20 hover:bg-black/30 text-white px-4 py-3 md:px-8 md:py-6 rounded-full text-sm md:text-base backdrop-blur-sm w-full sm:w-auto">
                    Explore the catalog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GradientSection;
