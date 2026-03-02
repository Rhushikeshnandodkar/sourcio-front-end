"use client";

import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductSpecificationsProps {
  product: Product;
  className?: string;
}

export function ProductSpecifications({ product, className }: ProductSpecificationsProps) {
  const specifications = product.specifications;

  if (!specifications || Object.keys(specifications).length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Specifications</h3>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <tbody className="divide-y">
            {Object.entries(specifications).map(([key, value], index) => (
              <tr key={index} className="transition-colors hover:bg-muted/50">
                <td className="px-4 py-3 font-medium text-muted-foreground w-1/3">{key}</td>
                <td className="px-4 py-3 text-foreground">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
