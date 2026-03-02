"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarSearchProps {
  className?: string;
}

export function NavbarSearch({ className }: NavbarSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/products");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    router.push("/products");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex-1 w-full", className)}
    >
      <div className="relative flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden">
        {/* Search Icon */}
        <div className="absolute left-4 z-10 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="pl-11 pr-24 h-11 text-sm border-0 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400 text-gray-900"
        />
        
        {/* Clear Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 z-10 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
          </button>
        )}
        
        {/* Search Button */}
        <Button
          type="submit"
          className="absolute right-1 h-9 px-4 sm:px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
    </form>
  );
}
