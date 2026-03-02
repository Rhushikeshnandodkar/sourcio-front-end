import type { Metadata } from "next";
import localFont from "next/font/local";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { CartInitializer } from "@/components/cart/CartInitializer";

const sofiaPro = localFont({
  src: [
    {
      path: "../fonts/SofiaProLight-english.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/SofiaProRegular-english.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SofiaProMedium-english.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SofiaProBold-english.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sofia-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sourcio Commerce - B2B Industrial Solutions",
  description: "Professional B2B e-commerce platform for industrial products and services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sofiaPro.variable} antialiased`}>
        <ReduxProvider>
          <CartInitializer />
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
