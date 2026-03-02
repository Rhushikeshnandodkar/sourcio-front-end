"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductSearchBarProps {
  onSearch?: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  useUrlNavigation?: boolean;
}

export function ProductSearchBar({
  onSearch,
  initialValue = "",
  placeholder = "Search products...",
  className,
  useUrlNavigation = false,
}: ProductSearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    
    if (useUrlNavigation) {
      const params = new URLSearchParams();
      if (query) {
        params.set("q", query);
      }
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    } else if (onSearch) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    if (useUrlNavigation) {
      router.push("/products");
    } else if (onSearch) {
      onSearch("");
    }
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
      className={cn("relative w-full max-w-2xl mx-auto", className)}
    >
      <div className="relative flex items-center">
        <div className="absolute left-3 z-10 pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20 h-12 text-base rounded-lg border-2 focus-visible:border-primary"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 z-10 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
        <Button
          type="submit"
          className="absolute right-1 h-10 px-6 rounded-lg bg-primary hover:bg-primary/90"
          aria-label="Search"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
