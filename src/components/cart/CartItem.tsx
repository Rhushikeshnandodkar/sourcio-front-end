"use client";

import { CartItem as CartItemType } from "@/features/cart/cartSlice";
import { useCartActions } from "@/hooks/useCartActions";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity, removeItem } = useCartActions();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      const success = await removeItem(item);
      if (success) {
        toast.success("Item removed from cart");
      }
    } else {
      const success = await updateItemQuantity(item, newQuantity);
      if (success) {
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    }
  };

  const handleRemove = async () => {
    const success = await removeItem(item);
    if (success) {
      toast.success("Item removed from cart");
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-b-0">
      {/* Product Image */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <X className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground truncate">
          {item.productName}
        </h4>
        {item.variantName && (
          <p className="text-xs text-muted-foreground mt-1">
            Variant: {item.variantName}
          </p>
        )}
        <p className="text-sm font-semibold text-foreground mt-1">
          {item.price != null && item.price > 0 ? (
            `₹${(item.price * item.quantity).toFixed(2)}`
          ) : (
            <span className="text-muted-foreground">Request for Quote</span>
          )}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium w-8 text-center">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={handleRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
