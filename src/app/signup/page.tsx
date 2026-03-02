"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, Building2, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { signup } from "@/lib/auth";
import Beams from "@/components/Beams";
import Link from "next/link";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password cannot exceed 128 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  category: z.enum(["personal", "organization"], {
    message: "Please select a category",
  }),
  gstNumber: z.string().optional(),
  shippingAddress1: z.string().min(1, "Address line 1 is required"),
  shippingAddress2: z.string().optional(),
  shippingPin: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingCountry: z.string().min(1, "Country is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.category === "organization") {
    return data.gstNumber && data.gstNumber.length === 15;
  }
  return true;
}, {
  message: "GST number is required and must be 15 characters for organizations",
  path: ["gstNumber"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
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

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    form.clearErrors("root");

    try {
      await signup(
        values.email,
        values.password,
        values.category,
        values.gstNumber || undefined,
        {
          address1: values.shippingAddress1,
          address2: values.shippingAddress2 || undefined,
          pin: values.shippingPin,
          city: values.shippingCity,
          state: values.shippingState,
          country: values.shippingCountry,
        }
      );
      
      // Redirect to verify page with email
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      console.error("Signup error:", error);
      form.setError("root", {
        message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Beams Background - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>

      {/* Form Overlay - Centered */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-medium text-white mb-2 tracking-tight">Create Your Account</h1>
            <p className="text-sm text-white/70 font-medium">Sign up to get started with Sourcio</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white mb-2.5">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-12 pr-12 h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white mb-2.5">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-12 pr-12 h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-1"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white mb-2.5">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-12 pr-12 h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-1"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white mb-2.5">Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full h-12 border-white/10 bg-white/80 text-white">
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
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* GST Number - Only shown for organizations */}
              {selectedCategory === "organization" && (
                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-white mb-2.5">GST Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                          <Input
                            placeholder="Enter 15-digit GST number"
                            maxLength={15}
                            className="pl-12 pr-4 h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg uppercase"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              )}

              {/* Shipping Address Section */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-white/70" />
                  <FormLabel className="text-sm font-semibold text-white">Shipping Address</FormLabel>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-white mb-2.5">Address Line 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Street address, building number"
                            className="h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-white mb-2.5">Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Apartment, suite, etc."
                            className="h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingPin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-white mb-2.5">PIN Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="6 digits"
                              maxLength={6}
                              className="h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-white mb-2.5">City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
                              className="h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-white mb-2.5">State</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="State"
                              className="h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-white mb-2.5">Country</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Country"
                              className="h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {form.formState.errors.root && (
                <div className="rounded-lg bg-red-50/90 backdrop-blur-sm border border-red-200/50 p-4 text-white">
                  <p className="text-sm text-red-700 font-medium">{form.formState.errors.root.message}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading || authLoading} 
                className="w-full h-12 font-semibold text-base mt-8 rounded-lg shadow-lg hover:shadow-xl transition-all bg-white text-black hover:bg-white/90"
              >
                {isLoading || authLoading ? "Creating Account..." : "Sign Up"}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-white/70">
                  Already have an account?{" "}
                  <Link href="/login" className="text-white font-semibold hover:text-white/80 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
