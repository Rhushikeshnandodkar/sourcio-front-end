"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/components/providers/ReduxProvider";
import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);
  const totalPrice = useSelector((state: RootState) => state.cart.totalPrice);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {totalItems > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {totalItems === 0
              ? "Your cart is empty"
              : "Review your items before checkout"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild onClick={() => onOpenChange(false)}>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/cart" onClick={() => onOpenChange(false)}>
                  View Cart
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
