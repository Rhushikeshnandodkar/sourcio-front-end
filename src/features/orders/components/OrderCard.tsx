/**
 * OrderCard Component
 * Single Responsibility: Displays a single order card with its details
 */
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package } from "lucide-react";
import { OrderSummary } from "@/lib/orders-api";
import { formatOrderDate, formatOrderPrice } from "../utils/orderFormatters";
import { getOrderStatusColor, getOrderStatusLabel } from "../constants/orderStatus";

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={`/orders/${order.id}`} className="block">
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow h-full flex flex-col gap-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {order.order_number}
              </CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Created on: {formatOrderDate(order.created_at)}</span>
              </div>
              <Badge
                className={`${getOrderStatusColor(order.status)} text-white capitalize shrink-0 px-2.5 py-1 text-[10px] font-medium shadow-sm`}
              >
                {getOrderStatusLabel(order.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-4">
            {order.item_names && order.item_names.length > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">
                    {order.item_count} {order.item_count === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="pl-5">
                  <div className="text-sm text-foreground font-medium line-clamp-2">
                    {order.item_names.join(", ")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4 shrink-0" />
                <span className="font-medium">
                  {order.item_count} {order.item_count === 1 ? "item" : "items"}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">
                {formatOrderPrice(order.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

