"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { useShippingAddresses } from "@/hooks/useShippingAddresses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(7, "Phone must have 7-15 digits").max(15),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address1: z.string().min(1, "Address line 1 is required"),
  address2: z.string().optional(),
  postalCode: z.string().min(4, "Postal code is required").max(10),
  company: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const defaultValues: AddressFormValues = {
  name: "",
  phone: "",
  country: "India",
  state: "",
  city: "",
  address1: "",
  address2: "",
  postalCode: "",
  company: "",
  instructions: "",
  isDefault: false,
};

interface ShippingAddressesProps {
  enabled?: boolean;
}

export function ShippingAddresses({ enabled = true }: ShippingAddressesProps) {
  const router = useRouter();
  const { addresses, loading, error, refresh, createAddress, updateAddress, deleteAddress } = useShippingAddresses({
    enabled,
  });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  const editingAddress = useMemo(
    () => addresses.find((addr) => addr.id === editingId),
    [addresses, editingId]
  );

  useEffect(() => {
    if (editingAddress) {
      form.reset({
        name: editingAddress.name,
        phone: editingAddress.phone,
        country: editingAddress.country,
        state: editingAddress.state,
        city: editingAddress.city,
        address1: editingAddress.address1,
        address2: editingAddress.address2 || "",
        postalCode: editingAddress.postal_code,
        company: editingAddress.company || "",
        instructions: editingAddress.instructions || "",
        isDefault: editingAddress.is_default,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editingAddress, form]);

  const handleSubmit = async (values: AddressFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        phone: values.phone,
        country: values.country,
        state: values.state,
        city: values.city,
        address1: values.address1,
        address2: values.address2 || null,
        postal_code: values.postalCode,
        company: values.company || null,
        instructions: values.instructions || null,
        is_default: values.isDefault,
      };

      if (editingId) {
        await updateAddress(editingId, payload);
        toast.success("Address updated");
      } else {
        await createAddress(payload);
        toast.success("Address added");
      }

      setOpen(false);
      setEditingId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save address";
      toast.error(message);
      
      // If session expired, redirect to login
      if (message.includes("Session expired")) {
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteAddress(id);
      toast.success("Address deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete address";
      toast.error(message);
      
      // If session expired, redirect to login
      if (message.includes("Session expired")) {
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await updateAddress(id, { is_default: true });
      toast.success("Default address updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set default address";
      toast.error(message);
      
      // If session expired, redirect to login
      if (message.includes("Session expired")) {
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-xl font-semibold">Shipping Addresses</CardTitle>
          <p className="text-sm text-muted-foreground">Manage saved addresses for checkout.</p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditingId(null);
            setOpen(true);
          }}
          disabled={!enabled}
        >
          <Plus className="h-4 w-4" />
          Add address
        </Button>
      </CardHeader>
      <CardContent>
        {!enabled ? (
          <div className="text-muted-foreground">Sign in to manage shipping addresses.</div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading addresses...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-between rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <span className="text-destructive">{error}</span>
            <Button variant="outline" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-muted-foreground">
            <MapPin className="h-10 w-10" />
            <p className="text-sm">No shipping addresses yet. Add one to speed up checkout.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="group relative rounded-lg border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">{address.name}</h3>
                      {address.is_default && (
                        <Badge className="h-5 border-emerald-200 bg-emerald-50 px-1.5 text-[10px] text-emerald-700 hover:bg-emerald-50">
                          <Check className="mr-0.5 h-2.5 w-2.5" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-600 justify-between">
                      <span>{address.phone}</span>
                      {address.company && (
                          <span className="font-medium text-slate-700">{address.company}</span>
                      )}
                    </div>
                  </div>
                  {!address.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-slate-600 hover:text-slate-900"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set default
                    </Button>
                  )}
                </div>

                <div className="mt-2.5 text-xs leading-relaxed text-slate-600">
                  <p>{address.address1}{address.address2 ? `, ${address.address2}` : ""}</p>
                  <p className="mt-0.5">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="mt-0.5">{address.country}</p>
                </div>

                {address.instructions && (
                  <div className="mt-2 rounded bg-slate-50 px-2 py-1.5 text-[11px] italic text-slate-600">
                    <span className="font-medium not-italic">Note:</span> {address.instructions}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 gap-1 text-xs"
                    onClick={() => {
                      setEditingId(address.id);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                  >
                    {deletingId === address.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Recipient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal / ZIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Address line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Street, building, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Address line 2 (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartment, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default</FormLabel>
                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <span className="text-sm text-muted-foreground">Set as default</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Delivery instructions (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Notes for delivery" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Save changes" : "Add address"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

