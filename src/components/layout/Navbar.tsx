"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, User, ShoppingCart, FileText, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/components/providers/ReduxProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NavbarSearch } from "./NavbarSearch";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Navbar() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const cartItemCount = useSelector((state: RootState) => state.cart.totalItems);

  useEffect(() => {
    if (!navRef.current || typeof window === "undefined") return;

    // Register ScrollTrigger if not already registered
    gsap.registerPlugin(ScrollTrigger);

    // Pin the navbar at the top - it will stay fixed while scrolling
    const pin = ScrollTrigger.create({
      trigger: navRef.current,
      start: "top top",
      end: "max", // Pin until the end of the page
      pin: true,
      pinSpacing: false, // Don't add spacing since navbar should always be visible
    });

    return () => {
      pin.kill();
    };
  }, []);

  // Navigation links for mobile menu
  const navigationLinks: Array<{ href: string; label: string; icon?: typeof FileText }> = [
    { href: "/products", label: "Products" },
    ...(isAuthenticated ? [
      { href: "/quotes", label: "Quotes", icon: FileText },
      { href: "/orders", label: "Orders", icon: Package }
    ] : []),
  ];

  return (
    <nav ref={navRef} className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-sm" data-speed="0">
      <div className="max-w-7xl mx-auto w-full flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo and Mobile Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button className="group size-8 md:hidden" variant="ghost" size="icon" aria-label="Open menu">
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path d="M4 12H20" className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45" />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink asChild>
                        <Link href={link.href} className="flex items-center gap-2 py-1.5 px-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                          {link.icon && <link.icon className="h-4 w-4" />}
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                  <NavigationMenuItem className="w-full" role="presentation" aria-hidden="true">
                    <div role="separator" aria-orientation="horizontal" className="bg-border -mx-1 my-1 h-px w-full" />
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <Link href="/cart" className="flex items-center gap-2 py-1.5 px-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                      {cartItemCount > 0 && (
                        <span className="ml-auto h-3 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{cartItemCount > 99 ? "99+" : cartItemCount}</span>
                      )}
                    </Link>
                  </NavigationMenuItem>
                  {!authLoading && (
                    <>
                      {isAuthenticated ? (
                        <>
                          <NavigationMenuItem className="w-full">
                            <Link href="/account" className="flex items-center gap-2 py-1.5 px-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                              <User className="h-4 w-4" />
                              Account
                            </Link>
                          </NavigationMenuItem>
                          <NavigationMenuItem className="w-full">
                            <button
                              onClick={() => setShowLogoutDialog(true)}
                              className="flex items-center gap-2 py-1.5 px-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors w-full text-left"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </NavigationMenuItem>
                        </>
                      ) : (
                        <NavigationMenuItem className="w-full">
                          <Link href="/login" className="flex items-center gap-2 py-1.5 px-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                            <LogIn className="h-4 w-4" />
                            Login
                          </Link>
                        </NavigationMenuItem>
                      )}
                    </>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <div className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">Sourcio</div>
          </Link>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center gap-6 ml-6">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/products" className="text-muted-foreground hover:text-primary py-1.5 px-2 font-medium text-sm transition-colors">
                      Products
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {isAuthenticated && (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/quotes" className="text-muted-foreground hover:text-primary py-1.5 px-2 font-medium text-sm transition-colors flex items-center gap-1.5">
                          <FileText className="h-4 w-4" />
                          Quotes
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/orders" className="text-muted-foreground hover:text-primary py-1.5 px-2 font-medium text-sm transition-colors flex items-center gap-1.5">
                          <Package className="h-4 w-4" />
                          Orders
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Search Bar - Hidden on mobile, visible on tablet and up */}
        <div className="hidden md:flex flex-1 justify-center min-w-0 max-w-2xl mx-4">
          <NavbarSearch />
        </div>

        {/* Right side - Cart and Auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cart Icon */}
          <Link href="/cart" className="hidden md:block">
            <Button variant="ghost" size="sm" className="relative px-4 py-2 h-auto text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-md border-2 border-white">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </Button>
          </Link>

          {!authLoading && (
            <>
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-0.5">
                  <Link href="/account">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1.5 px-4 py-2 h-auto text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span>Account</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogoutDialog(true)}
                    className="flex items-center gap-1.5 px-4 py-2 h-auto text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-4 py-2 h-auto text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Logout Dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>Are you sure you want to logout? You will need to sign in again to access your account.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={async () => {
                  setShowLogoutDialog(false);
                  await logout();
                }}
              >
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
