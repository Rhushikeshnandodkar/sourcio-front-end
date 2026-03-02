"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Clock,
  XCircle,
  Building2,
  MapPin,
  Edit,
  Save,
  X,
  ShieldCheck,
  ShieldOff,
  Activity,
  Globe2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getUserInfo, updateUserProfile, UserInfo } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShippingAddresses } from "@/components/account/ShippingAddresses";

const profileUpdateSchema = z
  .object({
    category: z.enum(["personal", "organization"]),
    gstNumber: z.string().optional(),
    shippingAddress1: z.string().min(1, "Address line 1 is required"),
    shippingAddress2: z.string().optional(),
    shippingPin: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
    shippingCity: z.string().min(1, "City is required"),
    shippingState: z.string().min(1, "State is required"),
    shippingCountry: z.string().min(1, "Country is required"),
  })
  .refine(
    (data) => {
      if (data.category === "organization") {
        return data.gstNumber && data.gstNumber.length === 15;
      }
      return true;
    },
    {
      message: "GST number is required and must be 15 characters for organizations",
      path: ["gstNumber"],
    }
  );

type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileCompletion = useMemo(() => {
    if (!userInfo) return 0;
    const requiredFields = [
      userInfo.category,
      userInfo.shipping_address1,
      userInfo.shipping_pin,
      userInfo.shipping_city,
      userInfo.shipping_state,
      userInfo.shipping_country,
    ];

    if (userInfo.category === "organization") {
      requiredFields.push(userInfo.gst_number);
    }

    const filled = requiredFields.filter(Boolean).length;
    const percentage = Math.round((filled / requiredFields.length) * 100);
    return Math.min(100, Math.max(0, percentage));
  }, [userInfo]);

  const shippingSummary = useMemo(() => {
    if (!userInfo) return "Add your shipping details so deliveries land at the right door.";

    if (userInfo.shipping_address1 || userInfo.shipping_city || userInfo.shipping_country) {
      const parts = [
        userInfo.shipping_address1,
        userInfo.shipping_address2,
        userInfo.shipping_city,
        userInfo.shipping_state,
        userInfo.shipping_country,
        userInfo.shipping_pin,
      ].filter(Boolean);

      return parts.join(", ");
    }

    return "Add your shipping details so deliveries land at the right door.";
  }, [userInfo]);

  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      category: "personal",
      gstNumber: "",
      shippingAddress1: "",
      shippingAddress2: "",
      shippingPin: "",
      shippingCity: "",
      shippingState: "",
      shippingCountry: "India",
    },
  });

  const selectedCategory = form.watch("category");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      return; // useRequireAuth will handle redirect
    }

    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (userInfo) {
      form.reset({
        category: (userInfo.category as "personal" | "organization") || "personal",
        gstNumber: userInfo.gst_number || "",
        shippingAddress1: userInfo.shipping_address1 || "",
        shippingAddress2: userInfo.shipping_address2 || "",
        shippingPin: userInfo.shipping_pin || "",
        shippingCity: userInfo.shipping_city || "",
        shippingState: userInfo.shipping_state || "",
        shippingCountry: userInfo.shipping_country || "India",
      });
    }
  }, [userInfo, form]);

  const fetchUserInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserInfo();
      setUserInfo(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load user information";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If session expired, redirect to login
      if (errorMessage.includes("Session expired") || errorMessage.includes("authentication token")) {
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (values: ProfileUpdateFormValues) => {
    setIsSaving(true);
    try {
      const updatedData = await updateUserProfile({
        category: values.category,
        gstNumber: values.gstNumber || undefined,
        shippingAddress: {
          address1: values.shippingAddress1,
          address2: values.shippingAddress2 || undefined,
          pin: values.shippingPin,
          city: values.shippingCity,
          state: values.shippingState,
          country: values.shippingCountry,
        },
      });
      setUserInfo(updatedData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(errorMessage);
      
      // If session expired, redirect to login
      if (errorMessage.includes("Session expired") || errorMessage.includes("authentication token")) {
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-52" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="py-8 text-center">
                <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                <h2 className="mb-1 text-lg font-semibold text-gray-900">Error Loading Account</h2>
                <p className="mb-4 text-sm text-gray-600">{error}</p>
                <Button onClick={fetchUserInfo} size="sm">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-2">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(147,51,234,0.06),transparent_35%)]" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="relative space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold text-slate-900">Account Information</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline" className="border-slate-300 bg-white text-slate-700 shadow-sm">
                    <Mail className="mr-1 h-3.5 w-3.5" /> {userInfo?.email || "Loading account"}
                  </Badge>
                  {userInfo ? (
                    <>
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                        {userInfo.is_active ? <ShieldCheck className="mr-1 h-3.5 w-3.5" /> : <ShieldOff className="mr-1 h-3.5 w-3.5" />}
                        {userInfo.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="secondary" className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200">
                        {userInfo.role}
                      </Badge>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex w-full max-w-sm flex-col gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Profile completeness</span>
                    <span className="font-semibold text-slate-900">{profileCompletion}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span>{profileCompletion >= 80 ? "Checkout ready" : "Add shipping details to speed up checkout"}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">Edit Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">Keep your shipping and account details up to date.</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="personal">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>Personal</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="organization">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    <span>Organization</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedCategory === "organization" && (
                        <FormField
                          control={form.control}
                          name="gstNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GST Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter 15-digit GST number"
                                  maxLength={15}
                                  className="uppercase"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="space-y-4 rounded-xl border bg-muted/40 p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <FormLabel className="text-base font-semibold">Shipping Address</FormLabel>
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1</FormLabel>
                              <FormControl>
                                <Input placeholder="Street address, building number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingAddress2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2 (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Apartment, suite, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="shippingPin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIN Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="6 digits"
                                    maxLength={6}
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="shippingCity"
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
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="shippingState"
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
                            name="shippingCountry"
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
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          form.reset();
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSaving} className="gap-2">
                        {isSaving ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Profile signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoChip
                  icon={userInfo?.is_active ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                  label="Account status"
                  value={userInfo?.is_active ? "Active" : "Inactive"}
                  tone={userInfo?.is_active ? "success" : "danger"}
                />
                <InfoChip
                  icon={<Activity className="h-4 w-4" />}
                  label="Last login"
                  value={userInfo?.last_login ? formatDate(userInfo.last_login) : "Not recorded"}
                />
                <InfoChip
                  icon={<Clock className="h-4 w-4" />}
                  label="Last updated"
                  value={userInfo?.updated_at ? formatDate(userInfo.updated_at) : "N/A"}
                />
                <InfoChip icon={<Globe2 className="h-4 w-4" />} label="Country" value={userInfo?.shipping_country || "Not set"} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">Profile overview</CardTitle>
                    <p className="text-sm text-muted-foreground">Your latest account details in one place.</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Update
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  <div className="grid gap-2 md:grid-cols-2">
                    <InfoChip icon={<Mail className="h-4 w-4" />} label="Email" value={userInfo?.email} />
                    <InfoChip icon={<User className="h-4 w-4" />} label="Role" value={userInfo?.role} />
                    <InfoChip
                      icon={userInfo?.category === "organization" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      label="Account Type"
                      value={userInfo?.category || "Not set"}
                    />
                    {userInfo?.category === "organization" && userInfo?.gst_number ? (
                      <InfoChip icon={<Building2 className="h-4 w-4" />} label="GST" value={userInfo.gst_number} mono />
                    ) : null}
                    <InfoChip
                      icon={<Calendar className="h-4 w-4" />}
                      label="Created"
                      value={userInfo?.created_at ? formatDate(userInfo.created_at) : "N/A"}
                    />
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-muted/50 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Shipping summary</p>
                        <p className="text-sm text-muted-foreground">{shippingSummary}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                      Edit shipping
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <ShippingAddresses enabled={isAuthenticated && !authLoading} />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Account snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-0">
                  <InfoChip
                    icon={userInfo?.is_active ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                    label="Status"
                    value={userInfo?.is_active ? "Active" : "Inactive"}
                    tone={userInfo?.is_active ? "success" : "danger"}
                  />
                  <InfoChip
                    icon={<Activity className="h-4 w-4" />}
                    label="Last login"
                    value={userInfo?.last_login ? formatDate(userInfo.last_login) : "Not recorded"}
                  />
                  <InfoChip
                    icon={<Clock className="h-4 w-4" />}
                    label="Last updated"
                    value={userInfo?.updated_at ? formatDate(userInfo.updated_at) : "N/A"}
                  />
                  <InfoChip icon={<Globe2 className="h-4 w-4" />} label="Country" value={userInfo?.shipping_country || "Not set"} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
  mono,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  mono?: boolean;
  tone?: "success" | "danger";
}) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
      : tone === "danger"
        ? "border-red-200 bg-red-50/70 text-red-800"
        : "border-border bg-card text-foreground shadow-none";

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${toneClasses}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${mono ? "font-mono" : ""} truncate`}>{value || "—"}</p>
      </div>
    </div>
  );
}
