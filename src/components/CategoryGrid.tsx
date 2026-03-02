import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const CategoryGrid = () => {
  return (
    <div className="max-w-[85rem] mx-auto mt-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        <Card className="border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(rgb(173,110,75),rgb(177,125,93)_38%,rgb(177,125,93)_84%,rgb(173,110,75))] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-[1.5rem] group gap-2">
          <CardHeader className="relative z-10">
            <CardTitle>
              <span className="text-[#bf8e5e] font-medium text-sm md:text-lg group-hover:text-[#faf8f27a] transition-colors duration-300">
                Premium <span className="text-[#714e2c] group-hover:text-[#faf8f2] transition-colors duration-300">Quality Components</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center relative z-10">
            <Image src="/hero-grid/premium-quality-components.png" alt="Quality" width={120} height={120} className="group-hover:rotate-5 transition-transform duration-300 w-16 h-16 md:w-auto md:h-auto" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(162deg,#4D88BA_9.21%,#6FA7D7_38.52%,#6FA7D7_74.59%,#4D88BA_87.36%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-3xl group gap-2">
          <CardHeader className="relative z-10">
            <CardTitle>
              <span className="text-[#37556e] font-medium group-hover:text-[#f8f8f67a] text-sm md:text-lg transition-colors duration-300">
                Trusted <span className="text-[#4e799e] group-hover:text-white transition-colors duration-300">Component Sourcing</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center relative z-10">
            <Image src="/hero-grid/trusted-components-sourcing.png" alt="Quality" width={120} height={120} className="group-hover:rotate-5 transition-transform duration-300 w-16 h-16 md:w-auto md:h-auto" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(167deg,#C09940_-3.36%,#D6AF54_33.89%,#D6AF54_79.75%,#C09940_95.99%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-3xl group gap-2">
          <CardHeader className="relative z-10">
            <CardTitle>
              <span className="text-[#583d14] font-medium text-sm md:text-lg group-hover:text-[#dfdede] transition-colors duration-300">
                Streamlined <span className="text-[#dc9831] group-hover:text-[#faf8f2] transition-colors duration-300">Solutions</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center relative z-10">
            <Image src="/hero-grid/streamlined-solutions.png" alt="Quality" width={120} height={120} className="group-hover:rotate-5 transition-transform duration-300 w-16 h-16 md:w-auto md:h-auto" />
          </CardContent>
        </Card>
        <Card className="pb-0 border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(167deg,#8F2B25_-3.36%,#943C35_33.89%,#943C35_76.39%,#8F2B25_95.99%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-3xl group gap-2">
          <CardHeader className="relative z-10">
            <CardTitle>
              <span className="text-[#612931] font-medium text-sm md:text-lg group-hover:text-[#dfdede] transition-colors duration-300">
                Custom <span className="text-[#8A3334] group-hover:text-[#faf8f2] transition-colors duration-300">RFQ Solutions</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center relative z-10 pb-0">
            <Image src="/hero-grid/custom-rfq-solutions.png" alt="Quality" width={120} height={120} className="group-hover:rotate-5 transition-transform duration-300 w-16 h-16 md:w-auto md:h-auto" />
          </CardContent>
        </Card>
        <Card className="p-0 border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(167deg,#B3BABF_-3.36%,#CEDBE5_33.89%,#FDEAA0_79.75%,#FDEAA0_95.99%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-3xl group gap-2">
          <CardHeader className="relative z-10 pb-0">
            <CardTitle className="pb-0">
              <div className="flex items-center justify-between text-sm md:text-lg">
                <span className="text-[#2E3F43] font-medium transition-colors duration-300">
                  Full <span className="text-[rgb(109,141,158)] transition-colors duration-300">Transparency</span>
                </span>
                <Image src="/hero-grid/full-transparency.png" alt="Quality" width={70} height={70} className="group-hover:rotate-10 transition-transform duration-300 mt-2 w-16 h-16 md:w-auto md:h-auto" />
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(167deg,#009763_-3.36%,#00A76E_33.89%,#00A76E_79.75%,#009763_95.99%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-3xl group gap-2 p-0 pt-2">
          <CardHeader className="relative z-10 pb-0">
            <CardTitle className="pb-0">
              <div className="flex items-center justify-between text-sm md:text-lg">
                <span className="text-black font-medium group-hover:text-[#faf8f2a6] transition-colors duration-300">
                  Transparent <span className="text-[rgb(0,167,110)] group-hover:text-white transition-colors duration-300">Pricing</span>
                </span>
                <Image src="/hero-grid/transparent-pricing.png" alt="Quality" width={70} height={70} className="group-hover:rotate-10 transition-transform duration-300 w-16 h-16 md:w-auto md:h-auto" />
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="p-0 border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(167deg,#CD9472_-3.36%,#D3A488_3.89%,#D3A488_79.75%,#CD9472_95.99%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-3xl group gap-2">
          <CardHeader className="relative z-10 pb-0">
            <CardTitle className="pb-0">
              <div className="flex items-center justify-between text-sm md:text-lg">
                <span className="text-[rgb(191,142,94)] font-medium group-hover:text-[#faf8f2a6] transition-colors duration-300">48-Hour Response</span>
                <Image src="/hero-grid/48-hour-response.png" alt="Quality" width={70} height={70} className="group-hover:rotate-10 transition-transform duration-300 mt-2 w-16 h-16 md:w-auto md:h-auto" />
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="p-0 border-none shadow-none relative overflow-hidden transition-all duration-300 ease-in-out bg-[#faf8f2] before:absolute before:inset-0 before:bg-[linear-gradient(167deg,#A99E7B_-3.36%,#B3A689_33.89%,#B3A689_79.75%,#A99E7B_95.99%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out hover:before:opacity-100 rounded-3xl group gap-2">
          <CardHeader className="relative z-10 pb-0">
            <CardTitle className="pb-0">
              <div className="flex items-center justify-between text-sm md:text-lg">
                <span className="text-black group-hover:text-white font-medium transition-colors duration-300">Cost-Effective Solutions</span>
                <Image src="/hero-grid/cost-effective-solutions.png" alt="Quality" width={70} height={70} className="group-hover:rotate-10 transition-transform duration-300 mt-2 w-16 h-16 md:w-auto md:h-auto" />
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CategoryGrid;
