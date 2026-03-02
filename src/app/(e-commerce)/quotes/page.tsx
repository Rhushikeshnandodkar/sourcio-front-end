"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/components/providers/ReduxProvider";
import { fetchUserQuotes, deleteQuoteThunk } from "@/features/quotes/quoteThunks";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Trash2, Eye, Calendar, Package, LayoutGrid, Table2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductPageWrapper } from "@/components/products/ProductPageWrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { QuoteSummary } from "@/lib/quotes-api";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/90",
  pending: "bg-amber-500/90",
  approved: "bg-emerald-500/90",
  rejected: "bg-red-500/90",
  expired: "bg-gray-400/90",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
};

export default function QuotesPage() {
  const quotes = useSelector((state: RootState) => state.quotes.quotes);
  const loading = useSelector((state: RootState) => state.quotes.loading);
  const total = useSelector((state: RootState) => state.quotes.total);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserQuotes() as any);
    }
  }, [isAuthenticated, dispatch]);

  const handleDelete = (quoteId: number) => {
    setQuoteToDelete(quoteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quoteToDelete) return;

    try {
      await dispatch(deleteQuoteThunk(quoteToDelete) as any).unwrap();
      toast.success("Quote deleted successfully");
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete quote");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) {
      return "Price on Request";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toFixed(2)}`;
  };

  const QuoteCard = ({ quote }: { quote: QuoteSummary }) => (
    <div className="relative group">
      <Link href={`/quotes/${quote.id}`} className="block">
        <Card className="hover:shadow-md transition-all duration-200 hover:border-border gap-0 shadow-none cursor-pointer h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 pr-10">
              <div className="flex-1 min-w-0 space-y-1.5">
                <CardTitle className="text-base font-semibold truncate leading-tight">
                  {quote.quote_number}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{formatDate(quote.created_at)}</span>
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge
                  className={`${statusColors[quote.status]} text-white capitalize text-[10px] px-2 py-0.5 font-medium whitespace-nowrap`}
                >
                  {statusLabels[quote.status]}
                </Badge>
                {quote.has_custom_pricing && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 border-amber-300/50 text-amber-700 bg-amber-50/50 whitespace-nowrap">
                    Custom
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-normal">Items</span>
                <span className="font-medium text-sm text-foreground">{quote.item_count}</span>
              </div>
              {quote.expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5 font-normal">
                    <Calendar className="h-3 w-3 shrink-0" />
                    Expires
                  </span>
                  <span className="font-medium text-sm text-foreground">
                    {formatDate(quote.expires_at)}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">Total</span>
                <span className="text-base font-semibold text-foreground">
                  {quote.total === null ? (
                    <span className="text-muted-foreground italic text-xs font-normal">Price on Request</span>
                  ) : (
                    <span className="flex items-baseline gap-1">
                      <span>{formatPrice(quote.total)}</span>
                      {quote.has_custom_pricing && (
                        <span className="text-[10px] text-muted-foreground font-normal">(partial)</span>
                      )}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-md"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDelete(quote.id);
        }}
        aria-label="Delete quote"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const QuoteTableRow = ({ quote }: { quote: QuoteSummary }) => (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="text-sm">{quote.quote_number}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(quote.created_at)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={`${statusColors[quote.status]} text-white capitalize text-xs px-2 py-0.5`}
        >
          {statusLabels[quote.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{quote.item_count}</TableCell>
      <TableCell className="text-sm">
        {quote.expires_at ? formatDate(quote.expires_at) : "-"}
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-end">
          {quote.total === null ? (
            <span className="text-muted-foreground italic text-xs">Price on Request</span>
          ) : (
            <>
              <span className="text-sm font-semibold">{formatPrice(quote.total)}</span>
              {quote.has_custom_pricing && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 mt-1 border-amber-300/50 text-amber-700 bg-amber-50/50">
                  Custom
                </Badge>
              )}
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            asChild
          >
            <Link href={`/quotes/${quote.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(quote.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  if (!isAuthenticated) {
    return (
      <ProductPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-24 w-24 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Please Login</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your quotes
            </p>
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </ProductPageWrapper>
    );
  }

  return (
    <ProductPageWrapper>
      <div className="container mx-auto px-4 py-6 max-w-[80%]">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Quotes" },
          ]}
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">My Quotes</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track your quote requests
              </p>
            </div>
          </div>

          {loading && quotes.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-muted-foreground text-sm">Loading quotes...</div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No quotes yet</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-md">
                Create your first quote from your cart to get started
              </p>
              <Button asChild>
                <Link href="/cart">Go to Cart</Link>
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="card" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="h-9">
                  <TabsTrigger value="card" className="gap-2 text-xs">
                    <LayoutGrid className="h-4 w-4" />
                    Card View
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-2 text-xs">
                    <Table2 className="h-4 w-4" />
                    Table View
                  </TabsTrigger>
                </TabsList>
                <div className="text-sm text-muted-foreground">
                  {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
                </div>
              </div>

              <TabsContent value="card" className="mt-4">
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {quotes.map((quote) => (
                    <QuoteCard key={quote.id} quote={quote} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-0">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Quote Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Items</TableHead>
                        <TableHead className="w-[140px]">Expires</TableHead>
                        <TableHead className="text-right w-[150px]">Total</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.map((quote) => (
                        <QuoteTableRow key={quote.id} quote={quote} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Quote</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this quote? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setQuoteToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProductPageWrapper>
  );
}
