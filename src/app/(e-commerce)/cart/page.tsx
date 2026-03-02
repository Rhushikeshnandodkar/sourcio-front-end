"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/components/providers/ReduxProvider";
import { clearCart as clearCartLocal } from "@/features/cart/cartSlice";
import { clearCart as clearCartBackend } from "@/features/cart/cartThunks";
import { createQuoteFromCart } from "@/features/quotes/quoteThunks";
import { useAuth } from "@/hooks/useAuth";
import { useShippingAddresses } from "@/hooks/useShippingAddresses";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ShoppingBag, Trash2, FileText, MapPin, Loader2, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductPageWrapper } from "@/components/products/ProductPageWrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);
  const totalPrice = useSelector((state: RootState) => state.cart.totalPrice);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const {
    addresses: shippingAddresses,
    loading: shippingLoading,
    error: shippingError,
    refresh: refreshShipping,
    updateAddress: updateShippingAddress,
  } = useShippingAddresses({ enabled: isQuoteDialogOpen && isAuthenticated });
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const handleClearCart = () => {
    setIsClearDialogOpen(true);
  };

  const confirmClearCart = async () => {
    try {
      if (isAuthenticated) {
        await dispatch(clearCartBackend() as any).unwrap();
      } else {
        dispatch(clearCartLocal());
      }
      setIsClearDialogOpen(false);
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Fallback to local clear if backend fails
      dispatch(clearCartLocal());
      setIsClearDialogOpen(false);
    }
  };

  const handleGetQuote = () => {
    if (!isAuthenticated) {
      toast.error("Please login to create a quote");
      router.push("/login");
      return;
    }
    setIsQuoteDialogOpen(true);
  };

  useEffect(() => {
    if (shippingAddresses.length > 0) {
      const defaultAddress = shippingAddresses.find((addr) => addr.is_default);
      setSelectedAddressId(defaultAddress ? defaultAddress.id : shippingAddresses[0].id);
    } else {
      setSelectedAddressId(null);
    }
  }, [shippingAddresses]);

  const confirmCreateQuote = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to create a quote");
      return;
    }

    if (shippingLoading) {
      toast.message("Loading shipping addresses...");
      return;
    }

    if (shippingAddresses.length === 0) {
      toast.error("Add a shipping address in your account before requesting a quote.");
      setIsQuoteDialogOpen(false);
      router.push("/account");
      return;
    }

    const chosenAddressId = selectedAddressId || shippingAddresses[0]?.id || null;

    setIsCreatingQuote(true);
    try {
      if (chosenAddressId) {
        const chosen = shippingAddresses.find((addr) => addr.id === chosenAddressId);
        if (chosen && !chosen.is_default) {
          await updateShippingAddress(chosen.id, { is_default: true });
        }
      }

      const quoteData: { notes?: string; expires_at?: string } = {};
      if (quoteNotes.trim()) {
        quoteData.notes = quoteNotes.trim();
      }
      if (expiresAt) {
        quoteData.expires_at = new Date(expiresAt).toISOString();
      }

      const quote = await dispatch(createQuoteFromCart(quoteData) as any).unwrap();
      
      // Clear cart after quote creation
      if (isAuthenticated) {
        await dispatch(clearCartBackend() as any).unwrap();
      } else {
        dispatch(clearCartLocal());
      }

      toast.success(`Quote ${quote.quote_number} created successfully!`);
      setIsQuoteDialogOpen(false);
      setQuoteNotes("");
      setExpiresAt("");
      
      // Redirect to quotes page
      router.push("/quotes");
    } catch (error: any) {
      console.error("Error creating quote:", error);
      toast.error(error?.message || "Failed to create quote. Please try again.");
    } finally {
      setIsCreatingQuote(false);
    }
  };

  // Calculate default expiration date (30 days from now)
  const getDefaultExpirationDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  };

  return (
    <ProductPageWrapper>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart" },
          ]}
        />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            {cartItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-24 w-24 text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding products to your cart to see them here
              </p>
              <Button asChild size="lg">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Items ({totalItems})
                  </h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border rounded-lg p-6 sticky top-4">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{totalPrice > 0 ? `₹${totalPrice.toFixed(2)}` : <span className="text-muted-foreground">Request for Quote</span>}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{totalPrice > 0 ? `₹${totalPrice.toFixed(2)}` : <span className="text-muted-foreground">Request for Quote</span>}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-6" 
                      size="lg" 
                      onClick={handleGetQuote}
                      disabled={!isAuthenticated || cartItems.length === 0}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Get a Quote
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsClearDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClearCart}
            >
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Quote</DialogTitle>
            <DialogDescription>
              Create a quote from your cart items. Your cart will be cleared after the quote is created.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes for this quote..."
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiresAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(new Date(expiresAt), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiresAt ? new Date(expiresAt) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setExpiresAt(date.toISOString().split("T")[0]);
                      } else {
                        setExpiresAt("");
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Default: 30 days from today
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Label className="font-semibold">Shipping address</Label>
              </div>
              {shippingLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading addresses...</span>
                </div>
              ) : shippingError ? (
                <div className="flex items-center justify-between rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
                  <span className="text-destructive">{shippingError}</span>
                  <Button variant="outline" size="sm" onClick={refreshShipping}>
                    Retry
                  </Button>
                </div>
              ) : shippingAddresses.length === 0 ? (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  <p>No shipping addresses found.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button asChild size="sm">
                      <Link href="/account" onClick={() => setIsQuoteDialogOpen(false)}>
                        Add address in Account
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border p-3 space-y-3">
                  {shippingAddresses.map((address) => (
                    <label
                      key={address.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/70"
                    >
                      <input
                        type="radio"
                        name="shipping-address"
                        className="mt-1"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <div className="text-sm leading-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{address.name}</span>
                          {address.is_default ? (
                            <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs text-white">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground">
                          {address.address1}
                          {address.address2 ? `, ${address.address2}` : ""}
                        </div>
                        <div className="text-muted-foreground">
                          {address.city}, {address.state}, {address.country} {address.postal_code}
                        </div>
                        <div className="text-muted-foreground">{address.phone}</div>
                      </div>
                    </label>
                  ))}
                  <div className="text-xs text-muted-foreground">
                    Update or add more addresses in your{" "}
                    <Link className="underline" href="/account" onClick={() => setIsQuoteDialogOpen(false)}>
                      account
                    </Link>
                    .
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsQuoteDialogOpen(false);
                setQuoteNotes("");
                setExpiresAt("");
              }}
              disabled={isCreatingQuote}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreateQuote}
              disabled={isCreatingQuote}
            >
              {isCreatingQuote ? "Creating..." : "Create Quote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProductPageWrapper>
  );
}
