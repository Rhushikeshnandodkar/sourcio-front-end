"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const CTA = () => {
  return (
    <section className="relative w-full py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-[95rem]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-gray-200"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Content Section */}
            <div className="relative flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12 bg-white order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight tracking-tight">
                    <span className="block">Precision Manufacturing</span>
                    <span className="block text-gray-500">Meets Innovation</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-xl">
                    Experience the future of industrial sourcing. Our advanced CNC machining capabilities deliver precision-engineered components tailored to your exact specifications.
                  </p>
                </div>

                <div className="flex flex-row gap-2 sm:gap-3 pt-1">
                  <Button className="bg-gray-900 text-white hover:bg-gray-800 h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm font-medium rounded-lg">Request Quote</Button>
                  <Button variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-50 h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm font-medium rounded-lg">
                    Explore
                  </Button>
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="relative h-48 sm:h-56 md:h-64 lg:h-full lg:min-h-[350px] overflow-hidden order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
              <Image src="/cta-image.png" alt="Precision CNC machining" fill className="object-cover object-center" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white/20 lg:via-transparent lg:to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
