"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/components/providers/ReduxProvider";
import { fetchQuoteById, updateQuoteThunk, deleteQuoteThunk } from "@/features/quotes/quoteThunks";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trash2, Edit, Calendar, Package, ArrowLeft, CheckCircle2, XCircle, Clock, Download, Eye, Loader2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ProductPageWrapper } from "@/components/products/ProductPageWrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { getQuotePdfUrl } from "@/lib/quotes-api";
import { getToken } from "@/lib/auth";
import { placeOrder } from "@/lib/orders-api";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  expired: <Calendar className="h-4 w-4" />,
};

export default function QuoteDetailPage() {
  const quote = useSelector((state: RootState) => state.quotes.currentQuote);
  const loading = useSelector((state: RootState) => state.quotes.loading);
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const quoteId = parseInt(params.id as string);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [placeOrderDialogOpen, setPlaceOrderDialogOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (isAuthenticated && quoteId) {
      dispatch(fetchQuoteById(quoteId) as any);
    }
  }, [isAuthenticated, quoteId, dispatch]);

  useEffect(() => {
    if (quote) {
      setEditNotes(quote.notes || "");
      setEditExpiresAt(quote.expires_at ? new Date(quote.expires_at).toISOString().split("T")[0] : "");
    }
  }, [quote]);

  const handleEdit = () => {
    if (quote) {
      setEditNotes(quote.notes || "");
      setEditExpiresAt(quote.expires_at ? new Date(quote.expires_at).toISOString().split("T")[0] : "");
      setEditDialogOpen(true);
    }
  };

  const confirmUpdate = async () => {
    if (!quote) return;

    setIsUpdating(true);
    try {
      const updateData: { notes?: string; expires_at?: string } = {};
      if (editNotes.trim() !== (quote.notes || "")) {
        updateData.notes = editNotes.trim();
      }
      if (editExpiresAt && editExpiresAt !== (quote.expires_at ? new Date(quote.expires_at).toISOString().split("T")[0] : "")) {
        updateData.expires_at = new Date(editExpiresAt).toISOString();
      }

      await dispatch(updateQuoteThunk({ quoteId: quote.id, data: updateData }) as any).unwrap();
      toast.success("Quote updated successfully");
      setEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update quote");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quote) return;

    try {
      await dispatch(deleteQuoteThunk(quote.id) as any).unwrap();
      toast.success("Quote deleted successfully");
      router.push("/quotes");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete quote");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) {
      return "Price on Request";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleViewPdf = async () => {
    if (!quote) return;

    setIsGeneratingPdf(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getQuotePdfUrl(quoteId, false), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Clean up the blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      toast.error("Failed to open PDF", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!quote) return;

    setIsGeneratingPdf(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getQuotePdfUrl(quoteId, true), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || "Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quote-${quote.quote_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download PDF", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePlaceOrder = () => {
    setPlaceOrderDialogOpen(true);
  };

  const confirmPlaceOrder = async () => {
    if (!quote) return;

    setIsPlacingOrder(true);
    try {
      const order = await placeOrder(quote.id);
      toast.success("Order placed successfully!", {
        description: `Order ${order.order_number} has been created.`,
      });
      setPlaceOrderDialogOpen(false);
      // Optionally navigate to orders page or refresh quote
      // router.push(`/orders/${order.id}`);
    } catch (error: any) {
      toast.error("Failed to place order", {
        description: error?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-24 w-24 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Please Login</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to view quotes</p>
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </ProductPageWrapper>
    );
  }

  if (loading && !quote) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading quote...</div>
          </div>
        </div>
      </ProductPageWrapper>
    );
  }

  if (!quote) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-24 w-24 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Quote not found</h2>
            <p className="text-muted-foreground mb-6">The quote you're looking for doesn't exist or you don't have access to it.</p>
            <Button asChild size="lg">
              <Link href="/quotes">Back to Quotes</Link>
            </Button>
          </div>
        </div>
      </ProductPageWrapper>
    );
  }

  return (
    <ProductPageWrapper>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Quotes", href: "/quotes" }, { label: quote.quote_number }]} />

        <div className="mt-6">
          {/* Header Section */}
          <div className="mb-6 pb-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="icon" asChild className="hover:bg-muted">
                  <Link href="/quotes">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{quote.quote_number}</h1>
                    <Badge className={`${statusColors[quote.status]} text-white capitalize flex items-center gap-1 px-2.5 py-0.5 text-xs`}>
                      {statusIcons[quote.status]}
                      {statusLabels[quote.status]}
                    </Badge>
                    {quote.has_custom_pricing && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 text-xs">
                        Custom Pricing
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">Created on {formatDate(quote.created_at)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {quote.status === "approved" && (
                  <Button size="sm" onClick={handlePlaceOrder} disabled={isPlacingOrder} className="gap-1.5 h-8 bg-primary hover:bg-primary/90">
                    {isPlacingOrder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                    Place Order
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleViewPdf} disabled={isGeneratingPdf} className="gap-1.5 h-8">
                  {isGeneratingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                  View PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="gap-1.5 h-8">
                  {isGeneratingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1.5 h-8">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0" onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Quote Items */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border-border/50 gap-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Items
                    </CardTitle>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {quote.items.length} {quote.items.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {quote.has_custom_pricing && (
                    <div className="rounded-lg bg-amber-50 text-amber-700 border-amber-200 p-3 mb-4 border">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <span>This quote includes items requiring custom pricing</span>
                      </p>
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {quote.items.map((item, index) => {
                      const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price || 0;
                      const itemTotal = item.item_total
                        ? typeof item.item_total === "string"
                          ? parseFloat(item.item_total)
                          : item.item_total
                        : item.requires_custom_price
                        ? null
                        : itemPrice * item.quantity;
                      const taxAmount = item.tax_amount ? (typeof item.tax_amount === "string" ? parseFloat(item.tax_amount) : item.tax_amount) : null;
                      const itemTotalWithTax = item.item_total_with_tax ? (typeof item.item_total_with_tax === "string" ? parseFloat(item.item_total_with_tax) : item.item_total_with_tax) : null;
                      return (
                        <div key={item.id} className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-sm ${index !== quote.items.length - 1 ? "border-b" : ""}`}>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm mb-0.5 leading-tight">{item.product_name}</h3>
                                {item.variant_name && <p className="text-xs text-muted-foreground truncate">{item.variant_name}</p>}
                              </div>
                              <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                {item.gst_rate && (
                                  <Badge variant="outline" className="text-xs font-medium px-1.5 py-0">
                                    GST {item.gst_rate}%
                                  </Badge>
                                )}
                                {item.requires_custom_price && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 text-xs px-1.5 py-0">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2.5 border-t bg-muted/20 -mx-4 px-4 py-2.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Qty:</span>
                                  <span className="font-medium">{item.quantity}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Unit Price:</span>
                                  <span className="font-medium">{item.requires_custom_price ? <span className="text-muted-foreground italic">-</span> : formatPrice(item.price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Subtotal:</span>
                                  <span className="font-medium">{item.requires_custom_price ? <span className="text-muted-foreground italic">-</span> : formatPrice(itemTotal)}</span>
                                </div>
                                {taxAmount !== null && taxAmount !== undefined ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Tax:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(taxAmount)}</span>
                                  </div>
                                ) : (
                                  <div></div>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                                <span className="font-semibold text-sm">Total</span>
                                <span className="font-bold text-base">
                                  {item.requires_custom_price ? (
                                    <span className="text-muted-foreground italic font-normal">Custom</span>
                                  ) : itemTotalWithTax !== null ? (
                                    formatPrice(itemTotalWithTax)
                                  ) : (
                                    formatPrice(itemTotal)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quote Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 shadow-sm border-border/50 gap-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Quote Info */}
                  <div className="space-y-2 pb-3 border-b">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Quote Number</span>
                      <span className="font-medium text-right text-xs">{quote.quote_number}</span>
                    </div>
                    {quote.expires_at && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires
                        </span>
                        <span className="font-medium text-xs">{formatDate(quote.expires_at)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{quote.items.length}</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 pb-3 border-b">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {quote.subtotal === null ? (
                          <span className="text-muted-foreground italic">Price on Request</span>
                        ) : (
                          <>
                            {formatPrice(quote.subtotal)}
                            {quote.has_custom_pricing && <span className="text-[10px] text-muted-foreground ml-1 font-normal">(partial)</span>}
                          </>
                        )}
                      </span>
                    </div>
                    {quote.total_tax !== null && quote.total_tax !== undefined && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Total Tax (GST)</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(quote.total_tax)}</span>
                      </div>
                    )}
                    {quote.tax_breakdown && Object.keys(quote.tax_breakdown).length > 0 && (
                      <div className="rounded-lg border bg-muted/30 p-2 space-y-1 mt-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tax Breakdown</p>
                        <div className="space-y-1">
                          {Object.entries(quote.tax_breakdown).map(([rate, amount]) => (
                            <div key={rate} className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">GST {rate}%</span>
                              <span className="font-medium">{formatPrice(amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">Grand Total</span>
                      <span className="text-xl font-bold">
                        {quote.total === null ? (
                          <span className="text-muted-foreground italic text-base font-normal">Price on Request</span>
                        ) : (
                          <>
                            {formatPrice(quote.total)}
                            {quote.has_custom_pricing && <span className="text-[10px] text-muted-foreground ml-1 font-normal">(partial)</span>}
                          </>
                        )}
                      </span>
                    </div>
                    {quote.has_custom_pricing && quote.total !== null && <p className="text-[10px] text-muted-foreground leading-relaxed">Partial total - custom pricing required</p>}
                  </div>

                  {/* Notes */}
                  {quote.notes && (
                    <div className="pt-3 border-t">
                      <h3 className="text-xs font-semibold mb-1.5">Notes</h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
                    </div>
                  )}
                  {quote.admin_notes && (
                    <div className="pt-3 border-t">
                      <h3 className="text-xs font-semibold mb-1.5">Admin Notes</h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{quote.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Quote</DialogTitle>
              <DialogDescription>Update quote notes and expiration date.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea id="edit-notes" placeholder="Add any special instructions or notes..." value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expires_at">Expiration Date</Label>
                <Input id="edit-expires_at" type="date" value={editExpiresAt} onChange={(e) => setEditExpiresAt(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={confirmUpdate} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Quote"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Quote</DialogTitle>
              <DialogDescription>Are you sure you want to delete this quote? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Place Order Dialog */}
        <Dialog open={placeOrderDialogOpen} onOpenChange={setPlaceOrderDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Place Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to place an order for quote <strong>{quote?.quote_number}</strong>? This will create a new order based on this approved quote.
              </DialogDescription>
            </DialogHeader>
            {quote && (
              <div className="py-4 space-y-2">
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quote Number:</span>
                    <span className="font-medium">{quote.quote_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium">{quote.items.length}</span>
                  </div>
                  {quote.total !== null && (
                    <div className="flex items-center justify-between text-sm pt-1 border-t">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-base">
                        {formatPrice(quote.total)}
                      </span>
                    </div>
                  )}
                </div>
                {quote.expires_at && new Date(quote.expires_at) < new Date() && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                    <p className="text-xs text-amber-800 dark:text-amber-200 font-medium flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>This quote has expired. You may still place an order, but please verify pricing.</span>
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlaceOrderDialogOpen(false)} disabled={isPlacingOrder}>
                Cancel
              </Button>
              <Button onClick={confirmPlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Place Order
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProductPageWrapper>
  );
}
