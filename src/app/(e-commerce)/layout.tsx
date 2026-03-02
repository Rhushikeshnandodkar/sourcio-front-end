import { Navbar } from "@/components/layout/Navbar";
import { Footer7 } from "@/components/ui/footer";
import { ScrollSmootherProvider } from "@/components/providers/ScrollSmootherProvider";

export default function ECommerceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ScrollSmootherProvider>
      <Navbar />
      <main>{children}</main>
      <Footer7 />
    </ScrollSmootherProvider>
  );
}
