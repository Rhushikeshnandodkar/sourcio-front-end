import Image from "next/image";

const BentoGrid = () => {
  return (
    <div className={`py-4 sm:py-6 md:py-10 px-4 sm:px-6 md:px-8`}>
      {/* Container */}
      <div className="md:max-w-[80%] mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-16">
          <h2 className="text-[#1F1C19] text-2xl sm:text-3xl md:text-5xl font-medium">Trusted manufacturing,</h2>
          <h2 className="text-[#b7804a] text-2xl sm:text-3xl md:text-5xl font-medium">sourced globally</h2>
        </div>

        {/* Masonry Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-2">
          {/* Column 1 (Left) */}
          <div className="flex flex-col gap-2 w-full lg:w-1/2">
            {/* Card 1: Flexible Manufacturing */}
            <div className="bg-[#F2EDE4] rounded-2xl md:rounded-3xl pt-6 sm:pt-8 md:pt-12 px-4 sm:px-6 md:px-8 flex flex-col items-center text-center relative overflow-hidden gap-3 sm:gap-4 md:gap-5">
              <div className="z-10 flex flex-col items-center">
                <h3 className="text-lg sm:text-xl md:text-3xl font-medium leading-tight sm:leading-8 text-[#1F1C19]">Production that fits</h3>
                <h3 className="text-lg sm:text-xl md:text-3xl font-medium leading-tight sm:leading-8 text-[#b7804a] mb-2 sm:mb-3 md:mb-4">your timeline</h3>
                <p className="text-[#93908b] text-xs sm:text-sm leading-relaxed max-w-xs mb-2 sm:mb-3">
                  Flexible manufacturing schedules to meet your deadlines. Real-time tracking and support throughout production.
                </p>
                <button className="bg-[#1F1C19] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-[13px] font-medium hover:bg-opacity-90 transition-all duration-300">
                  Get started
                </button>
              </div>

              {/* Image Container */}
              <div className="mt-auto w-full relative transition-transform hover:-translate-y-2 duration-500 flex justify-center h-full">
                {/* Manufacturing Dashboard UI */}
                <Image
                  src="/bento-2.png"
                  alt="Manufacturing Dashboard"
                  width={1000}
                  height={1000}
                  quality={100}
                  className="h-[200px] sm:h-[280px] md:h-[400px] max-w-full object-contain drop-shadow-2xl"
                  priority
                  unoptimized={false}
                />
              </div>
            </div>

            {/* Card 2: Quality Materials */}
            <div className="bg-[#F2EDE4] rounded-2xl md:rounded-3xl pt-6 sm:pt-8 md:pt-12 px-4 sm:px-6 md:px-8 pb-0 flex flex-col items-center text-center relative overflow-hidden min-h-[350px] sm:min-h-[400px] md:min-h-[500px]">
              <h3 className="text-lg sm:text-xl md:text-3xl font-medium text-[#1F1C19]">Premium-grade</h3>
              <h3 className="text-lg sm:text-xl md:text-3xl font-medium text-[#b7804a] mb-2 sm:mb-3 md:mb-4">raw materials</h3>
              <p className="text-[#93908b] text-xs sm:text-sm leading-relaxed max-w-xs mb-4 sm:mb-6 md:mb-8">
                Sourced from verified suppliers worldwide. Quality materials tailored to your specifications.
              </p>
              <button className="bg-[#1F1C19] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-[13px] font-medium hover:bg-opacity-90 transition-all duration-300 mb-6 sm:mb-8 md:mb-12">
                Request a quote
              </button>
              {/* Image Container */}
              <div className="mt-auto w-full relative duration-500 flex justify-center h-full">
                {/* Manufacturing Dashboard UI */}
                <Image
                  src="/bento-1.png"
                  alt="Manufacturing Dashboard"
                  width={600}
                  height={600}
                  className="w-auto h-[180px] sm:h-[220px] md:h-[300px] max-w-full object-contain drop-shadow-2xl"
                  priority
                  unoptimized={false}
                />
              </div>
            </div>
          </div>

          {/* Column 2 (Right) */}
          <div className="flex flex-col gap-2 w-full lg:w-1/2">
            {/* Card 3: Certified Manufacturing */}
            <div className="bg-[#F2EDE4] rounded-2xl md:rounded-3xl pt-6 sm:pt-8 md:pt-12 px-4 sm:px-6 md:px-8 pb-0 flex flex-col items-center text-center relative overflow-hidden min-h-[350px] sm:min-h-[400px] md:min-h-[650px] lg:mt-20">
              <div className="z-10 flex flex-col items-center">
                <h3 className="text-lg sm:text-xl md:text-3xl font-medium text-[#1F1C19]">Manufactured by</h3>
                <h3 className="text-lg sm:text-xl md:text-3xl font-medium text-[#b7804a] mb-2 sm:mb-3 md:mb-4">certified facilities</h3>
                <p className="text-[#93908b] text-xs sm:text-sm leading-relaxed max-w-xs mb-4 sm:mb-6 md:mb-8">
                  ISO-certified manufacturing partners with global reach. Expert consultation and dedicated support throughout your project.
                </p>
                <button className="bg-[#1F1C19] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-[13px] font-medium hover:bg-opacity-90 transition-all duration-300 mb-4 sm:mb-6 md:mb-8">
                  Request consultation
                </button>
              </div>

              <div className="mt-auto w-full relative duration-500 flex justify-center h-full">
                <Image
                  src="/bento-3.png"
                  alt="Manufacturing Dashboard"
                  width={1000}
                  height={1000}
                  className="w-auto h-[200px] sm:h-[250px] md:h-[350px] max-w-full object-contain drop-shadow-2xl"
                  priority
                  unoptimized={false}
                />
              </div>
            </div>

            {/* Card 4: Quality Assurance */}
            <div className="bg-[#F2EDE4] rounded-2xl md:rounded-3xl py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 flex flex-col items-center text-center relative overflow-hidden">
              <h3 className="text-lg sm:text-xl md:text-3xl font-medium text-[#1F1C19]">Quality-assured</h3>
              <h3 className="text-lg sm:text-xl md:text-3xl font-medium text-[#b7804a] mb-2 sm:mb-3 md:mb-4">production</h3>
              <p className="text-[#93908b] text-xs sm:text-sm leading-relaxed max-w-xs mb-4 sm:mb-6 md:mb-8">
                Rigorous quality control at every stage. Products manufactured to international standards with reliable global shipping.
              </p>
              <button className="bg-[#1F1C19] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-[13px] font-medium hover:bg-opacity-90 transition-all duration-300 mb-6 sm:mb-8 md:mb-12">
                Request a quote
              </button>

              <div className="transition-transform hover:-translate-y-2 duration-500 w-full px-2 sm:px-4">
                <Image
                  src="/bento-4.png"
                  alt="Quality manufacturing"
                  width={1000}
                  height={1000}
                  className="w-full h-auto max-h-[200px] sm:max-h-[250px] md:max-h-none object-contain transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoGrid;
