"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/components/providers/ReduxProvider";
import { fetchOrderById } from "@/features/orders/orderThunks";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, ArrowLeft, Clock, Truck, CheckCircle, XCircle, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ProductPageWrapper } from "@/components/products/ProductPageWrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Image from "next/image";
import { downloadOrderInvoice } from "@/lib/orders-api";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  processing: <Clock className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

export default function OrderDetailPage() {
  const order = useSelector((state: RootState) => state.orders.currentOrder);
  const loading = useSelector((state: RootState) => state.orders.loading);
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const orderId = parseInt(params.id as string);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (isAuthenticated && orderId) {
      dispatch(fetchOrderById(orderId) as any);
    }
  }, [isAuthenticated, orderId, dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) {
      return "N/A";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    setIsDownloadingInvoice(true);
    try {
      const blob = await downloadOrderInvoice(order.id);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `invoice-${order.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to download invoice", {
        description: error?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Please Login</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to view orders</p>
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </ProductPageWrapper>
    );
  }

  if (loading && !order) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <div className="text-muted-foreground">Loading order...</div>
          </div>
        </div>
      </ProductPageWrapper>
    );
  }

  if (!order) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
            <Button asChild size="lg">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </div>
        </div>
      </ProductPageWrapper>
    );
  }

  return (
    <ProductPageWrapper>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Orders", href: "/orders" }, { label: order.order_number }]} />

        <div className="mt-6">
          {/* Header Section */}
          <div className="mb-6 pb-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" asChild className="hover:bg-muted -ml-2">
                  <Link href="/orders">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{order.order_number}</h1>
                    <Badge className={`${statusColors[order.status]} text-white capitalize flex items-center gap-1 px-2.5 py-0.5 text-xs`}>
                      {statusIcons[order.status]}
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">Created on {formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadInvoice}
                  disabled={isDownloadingInvoice}
                  className="gap-1.5 h-8"
                >
                  {isDownloadingInvoice ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      Download Invoice
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" asChild className="gap-1.5 h-8">
                  <Link href={`/quotes/${order.quote_id}`}>
                    View Quote
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border-border/50 gap-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Items
                    </CardTitle>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {order.items.map((item, index) => {
                      const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price || 0;
                      const itemTotal = item.item_total
                        ? typeof item.item_total === "string"
                          ? parseFloat(item.item_total)
                          : item.item_total
                        : itemPrice * item.quantity;
                      const taxAmount = item.tax_amount ? (typeof item.tax_amount === "string" ? parseFloat(item.tax_amount) : item.tax_amount) : null;
                      const itemTotalWithTax = item.item_total_with_tax ? (typeof item.item_total_with_tax === "string" ? parseFloat(item.item_total_with_tax) : item.item_total_with_tax) : null;
                      return (
                        <div key={item.id} className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-sm ${index !== order.items.length - 1 ? "border-b" : ""}`}>
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
                                  <span className="font-medium">{formatPrice(item.price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Subtotal:</span>
                                  <span className="font-medium">{formatPrice(itemTotal)}</span>
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
                                  {itemTotalWithTax !== null ? (
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

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 shadow-sm border-border/50 gap-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Order Info */}
                  <div className="space-y-2 pb-3 border-b">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Order Number</span>
                      <span className="font-medium text-right text-xs">{order.order_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{order.items.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={`${statusColors[order.status]} text-white capitalize text-xs`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 pb-3 border-b">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.total_tax !== null && order.total_tax !== undefined && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Total Tax (GST)</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(order.total_tax)}</span>
                      </div>
                    )}
                    {order.tax_breakdown && Object.keys(order.tax_breakdown).length > 0 && (
                      <div className="rounded-lg border bg-muted/30 p-2 space-y-1 mt-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tax Breakdown</p>
                        <div className="space-y-1">
                          {Object.entries(order.tax_breakdown).map(([rate, amount]) => (
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
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="pt-3 border-t">
                      <h3 className="text-xs font-semibold mb-1.5">Notes</h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProductPageWrapper>
  );
}

